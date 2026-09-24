-- Keep owner/entitlement RLS checks as defense in depth. Learner simulation
-- creation and version history writes go through the checked RPC only.

ALTER TABLE public.simulations
  ADD COLUMN IF NOT EXISTS save_request_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS simulations_owner_save_request_uidx
  ON public.simulations (user_id, save_request_id)
  WHERE save_request_id IS NOT NULL;

DROP POLICY IF EXISTS "owners insert own simulations" ON public.simulations;
CREATE POLICY "entitled owners insert own simulations"
ON public.simulations
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.platform_config pc
    WHERE pc.id = 1 AND pc.ai_enabled = true
  )
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'tutor'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.platform_config pc
      WHERE pc.id = 1 AND pc.is_subscriptions_enabled = false
    )
    OR public.student_has_scope('labs')
  )
);

DROP POLICY IF EXISTS "owners insert own simulation versions" ON public.simulation_versions;
CREATE POLICY "entitled owners insert own simulation versions"
ON public.simulation_versions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.simulations s
    WHERE s.id = simulation_versions.simulation_id AND s.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.platform_config pc
    WHERE pc.id = 1 AND pc.ai_enabled = true
  )
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'tutor'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.platform_config pc
      WHERE pc.id = 1 AND pc.is_subscriptions_enabled = false
    )
    OR public.student_has_scope('labs')
  )
);

-- Simulation metadata is not yet edited through a versioned application path.
-- Keep saved rows immutable so edits cannot silently bypass history.
DROP POLICY IF EXISTS "owners update own simulations" ON public.simulations;
REVOKE UPDATE ON public.simulations FROM PUBLIC, anon, authenticated;

-- A history row must not be rewritten or removed independently of its parent.
DROP POLICY IF EXISTS "owners update own simulation versions" ON public.simulation_versions;
DROP POLICY IF EXISTS "owners delete own simulation versions" ON public.simulation_versions;
REVOKE INSERT, UPDATE, DELETE ON public.simulation_versions FROM PUBLIC, anon, authenticated;
REVOKE INSERT ON public.simulations FROM PUBLIC, anon, authenticated;

-- Classroom PhET selection sync uses lab:<room-id>. Only room participants may
-- subscribe or broadcast; the client message remains ephemeral display state.
DROP POLICY IF EXISTS "room members access lab topic" ON realtime.messages;
CREATE POLICY "room members access lab topic"
ON realtime.messages
FOR SELECT TO authenticated
USING (
  CASE
    WHEN realtime.topic() LIKE 'lab:%'
      THEN public.can_access_classroom_room(substring(realtime.topic() FROM 5))
    ELSE false
  END
);

DROP POLICY IF EXISTS "room members broadcast lab topic" ON realtime.messages;
CREATE POLICY "room members broadcast lab topic"
ON realtime.messages
FOR INSERT TO authenticated
WITH CHECK (
  CASE
    WHEN realtime.topic() LIKE 'lab:%'
      THEN public.can_access_classroom_room(substring(realtime.topic() FROM 5))
    ELSE false
  END
);

-- The definer helper lives outside PostgREST's exposed public schema. Its
-- security checks are repeated inside the transaction because it bypasses RLS.
-- These enforcement helpers qualify every application object; pin their
-- SECURITY DEFINER execution away from caller-controlled schema resolution.
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = '';
ALTER FUNCTION public.get_my_scopes() SET search_path = '';
ALTER FUNCTION public.student_has_scope(text) SET search_path = '';
ALTER FUNCTION public.can_access_classroom_room(text) SET search_path = '';

-- Similarity lookup needs no definer privileges. Keep owner RLS effective,
-- constrain its work, and pin the pgvector operator to its extension schema.
CREATE OR REPLACE FUNCTION public.match_simulations(
  query_embedding public.vector(1536),
  match_count int DEFAULT 5,
  min_similarity float DEFAULT 0.0
)
RETURNS TABLE (
  id uuid,
  prompt text,
  subject text,
  title text,
  schema_json jsonb,
  thumbnail_url text,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF match_count IS NULL OR match_count < 1 OR match_count > 50
     OR min_similarity IS NULL OR min_similarity < -1 OR min_similarity > 1 THEN
    RAISE EXCEPTION 'Invalid similarity query parameters' USING ERRCODE = '22023';
  END IF;

  RETURN QUERY
  SELECT s.id, s.prompt, s.subject, s.title, s.schema_json, s.thumbnail_url, s.created_at,
         1 - (s.embedding OPERATOR(public.<=>) query_embedding) AS similarity
  FROM public.simulations s
  WHERE s.user_id = auth.uid()
    AND s.embedding IS NOT NULL
    AND 1 - (s.embedding OPERATOR(public.<=>) query_embedding) >= min_similarity
  ORDER BY s.embedding OPERATOR(public.<=>) query_embedding
  LIMIT match_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.match_simulations(public.vector, integer, double precision)
  FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_simulations(public.vector, integer, double precision)
  TO authenticated;

CREATE SCHEMA IF NOT EXISTS lab_private;
REVOKE ALL ON SCHEMA lab_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA lab_private TO authenticated;

DROP FUNCTION IF EXISTS public.save_simulation_with_initial_version(
  text, text, text, jsonb, public.vector, text, text[]
);
DROP FUNCTION IF EXISTS lab_private.save_simulation_with_initial_version(
  uuid, text, text, text, jsonb, public.vector, text, text[]
);

CREATE FUNCTION lab_private.save_simulation_with_initial_version(
  _save_request_id uuid,
  _prompt text,
  _subject text,
  _title text,
  _schema_json jsonb,
  _embedding public.vector(1536),
  _thumbnail_url text,
  _tags text[]
)
RETURNS TABLE (
  id uuid,
  prompt text,
  subject text,
  title text,
  schema_json jsonb,
  thumbnail_url text,
  created_at timestamptz,
  tags text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _simulation public.simulations;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  IF _save_request_id IS NULL
     OR _prompt IS NULL OR btrim(_prompt) = '' OR char_length(_prompt) > 2000
     OR _subject IS NULL OR _title IS NULL
     OR _schema_json IS NULL OR jsonb_typeof(_schema_json) IS DISTINCT FROM 'object'
     OR pg_column_size(_schema_json) > 1048576
     OR jsonb_typeof(_schema_json -> 'subject') IS DISTINCT FROM 'string'
     OR jsonb_typeof(_schema_json -> 'title') IS DISTINCT FROM 'string'
     OR _schema_json ->> 'subject' IS DISTINCT FROM _subject
     OR _schema_json ->> 'title' IS DISTINCT FROM _title
     OR jsonb_typeof(_schema_json -> 'objects') IS DISTINCT FROM 'array'
     OR CASE WHEN jsonb_typeof(_schema_json -> 'objects') = 'array'
       THEN jsonb_array_length(_schema_json -> 'objects') > 60 ELSE false END
     OR jsonb_typeof(_schema_json -> 'connections') IS DISTINCT FROM 'array'
     OR CASE WHEN jsonb_typeof(_schema_json -> 'connections') = 'array'
       THEN jsonb_array_length(_schema_json -> 'connections') > 80 ELSE false END
     OR jsonb_typeof(_schema_json -> 'rules') IS DISTINCT FROM 'array'
     OR jsonb_typeof(_schema_json -> 'tags') IS DISTINCT FROM 'array'
     OR CASE WHEN jsonb_typeof(_schema_json -> 'tags') = 'array'
       THEN jsonb_array_length(_schema_json -> 'tags') > 12 ELSE false END
     OR (_schema_json ? 'steps' AND (
       jsonb_typeof(_schema_json -> 'steps') IS DISTINCT FROM 'array'
       OR CASE WHEN jsonb_typeof(_schema_json -> 'steps') = 'array'
         THEN jsonb_array_length(_schema_json -> 'steps') > 20 ELSE false END
     ))
     OR (_schema_json ? 'events' AND (
       jsonb_typeof(_schema_json -> 'events') IS DISTINCT FROM 'array'
       OR CASE WHEN jsonb_typeof(_schema_json -> 'events') = 'array'
         THEN jsonb_array_length(_schema_json -> 'events') > 40 ELSE false END
     ))
     OR jsonb_typeof(_schema_json -> 'visualization') IS DISTINCT FROM 'string'
     OR NOT COALESCE(_schema_json ->> 'visualization' = ANY (
       ARRAY['scene3d', 'scene2d', 'process', 'timeline', 'geo', 'language']
     ), false)
     OR (_schema_json ? 'quiz' AND (
       jsonb_typeof(_schema_json -> 'quiz') IS DISTINCT FROM 'array'
       OR CASE WHEN jsonb_typeof(_schema_json -> 'quiz') = 'array'
         THEN jsonb_array_length(_schema_json -> 'quiz') > 15 ELSE false END
     ))
     OR (_schema_json ? 'geo' AND (
       jsonb_typeof(_schema_json -> 'geo') IS DISTINCT FROM 'object'
       OR jsonb_typeof(_schema_json -> 'geo' -> 'regions') IS DISTINCT FROM 'array'
       OR CASE WHEN jsonb_typeof(_schema_json -> 'geo' -> 'regions') = 'array'
         THEN jsonb_array_length(_schema_json -> 'geo' -> 'regions') > 40 ELSE false END
     ))
     OR (_schema_json ? 'language' AND (
       jsonb_typeof(_schema_json -> 'language') IS DISTINCT FROM 'object'
       OR jsonb_typeof(_schema_json -> 'language' -> 'characters') IS DISTINCT FROM 'array'
       OR CASE WHEN jsonb_typeof(_schema_json -> 'language' -> 'characters') = 'array'
         THEN jsonb_array_length(_schema_json -> 'language' -> 'characters') > 6 ELSE false END
       OR jsonb_typeof(_schema_json -> 'language' -> 'dialogue') IS DISTINCT FROM 'array'
       OR CASE WHEN jsonb_typeof(_schema_json -> 'language' -> 'dialogue') = 'array'
         THEN jsonb_array_length(_schema_json -> 'language' -> 'dialogue') > 30 ELSE false END
       OR (_schema_json -> 'language' ? 'vocabulary' AND (
         jsonb_typeof(_schema_json -> 'language' -> 'vocabulary') IS DISTINCT FROM 'array'
         OR CASE WHEN jsonb_typeof(_schema_json -> 'language' -> 'vocabulary') = 'array'
           THEN jsonb_array_length(_schema_json -> 'language' -> 'vocabulary') > 20 ELSE false END
       ))
     ))
     OR COALESCE(cardinality(_tags), 0) > 12
     OR (_thumbnail_url IS NOT NULL AND char_length(_thumbnail_url) > 400000) THEN
    RAISE EXCEPTION 'Invalid simulation data' USING ERRCODE = '22023';
  END IF;

  IF EXISTS (
    SELECT 1 FROM jsonb_array_elements(_schema_json -> 'objects') AS object_row(value)
    WHERE jsonb_typeof(object_row.value) IS DISTINCT FROM 'object'
       OR jsonb_typeof(object_row.value -> 'type') IS DISTINCT FROM 'string'
  ) OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(_schema_json -> 'connections') AS connection_row(value)
    WHERE jsonb_typeof(connection_row.value) IS DISTINCT FROM 'object'
       OR CASE WHEN jsonb_typeof(connection_row.value -> 'from') = 'number'
         THEN (connection_row.value ->> 'from')::numeric < 0
           OR trunc((connection_row.value ->> 'from')::numeric) <> (connection_row.value ->> 'from')::numeric
         ELSE true END
       OR CASE WHEN jsonb_typeof(connection_row.value -> 'to') = 'number'
         THEN (connection_row.value ->> 'to')::numeric < 0
           OR trunc((connection_row.value ->> 'to')::numeric) <> (connection_row.value ->> 'to')::numeric
         ELSE true END
  ) OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(_schema_json -> 'rules') AS rule_row(value)
    WHERE jsonb_typeof(rule_row.value) IS DISTINCT FROM 'string'
  ) OR EXISTS (
    SELECT 1 FROM jsonb_array_elements(_schema_json -> 'tags') AS tag_row(value)
    WHERE jsonb_typeof(tag_row.value) IS DISTINCT FROM 'string'
  ) THEN
    RAISE EXCEPTION 'Invalid simulation data' USING ERRCODE = '22023';
  END IF;

  IF _schema_json ? 'quiz' AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(_schema_json -> 'quiz') AS quiz_row(value)
    WHERE jsonb_typeof(quiz_row.value) IS DISTINCT FROM 'object'
       OR jsonb_typeof(quiz_row.value -> 'type') IS DISTINCT FROM 'string'
       OR NOT COALESCE(quiz_row.value ->> 'type' = ANY (ARRAY['mcq', 'tf', 'short']), false)
       OR jsonb_typeof(quiz_row.value -> 'question') IS DISTINCT FROM 'string'
       OR jsonb_typeof(quiz_row.value -> 'answer') IS DISTINCT FROM 'string'
       OR (quiz_row.value ? 'options' AND (
         jsonb_typeof(quiz_row.value -> 'options') IS DISTINCT FROM 'array'
         OR CASE WHEN jsonb_typeof(quiz_row.value -> 'options') = 'array'
           THEN jsonb_array_length(quiz_row.value -> 'options') > 6 ELSE false END
       ))
  ) THEN
    RAISE EXCEPTION 'Invalid simulation quiz data' USING ERRCODE = '22023';
  END IF;

  IF _schema_json ? 'graph2d' AND (
    jsonb_typeof(_schema_json -> 'graph2d') IS DISTINCT FROM 'object'
    OR jsonb_typeof(_schema_json -> 'graph2d' -> 'curves') IS DISTINCT FROM 'array'
    OR CASE WHEN jsonb_typeof(_schema_json -> 'graph2d' -> 'curves') = 'array'
      THEN jsonb_array_length(_schema_json -> 'graph2d' -> 'curves') > 6 OR EXISTS (
        SELECT 1
        FROM jsonb_array_elements(_schema_json -> 'graph2d' -> 'curves') AS curve_row(value)
        WHERE jsonb_typeof(curve_row.value) IS DISTINCT FROM 'object'
           OR jsonb_typeof(curve_row.value -> 'expr') IS DISTINCT FROM 'string'
           OR CASE WHEN jsonb_typeof(curve_row.value -> 'expr') = 'string'
             THEN char_length(curve_row.value ->> 'expr') > 256 ELSE false END
      )
      ELSE false END
    OR jsonb_typeof(_schema_json -> 'graph2d' -> 'points') IS DISTINCT FROM 'array'
    OR CASE WHEN jsonb_typeof(_schema_json -> 'graph2d' -> 'points') = 'array'
      THEN jsonb_array_length(_schema_json -> 'graph2d' -> 'points') > 20 ELSE false END
  ) THEN
    RAISE EXCEPTION 'Invalid simulation graph data' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.platform_config pc
    WHERE pc.id = 1 AND pc.ai_enabled = true
  ) THEN
    RAISE EXCEPTION 'AI features are currently disabled by the platform admin.'
      USING ERRCODE = '42501';
  END IF;

  IF NOT (
    COALESCE(public.has_role(_user_id, 'admin'::public.app_role), false)
    OR COALESCE(public.has_role(_user_id, 'tutor'::public.app_role), false)
    OR EXISTS (
      SELECT 1 FROM public.platform_config pc
      WHERE pc.id = 1 AND pc.is_subscriptions_enabled = false
    )
    OR COALESCE(public.student_has_scope('labs'), false)
  ) THEN
    RAISE EXCEPTION 'Labs is a premium feature. Submit your monthly subscription on the dashboard to unlock it.'
      USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.simulations (
    user_id, save_request_id, prompt, subject, title, schema_json,
    embedding, thumbnail_url, tags, processed, ai_schema_version
  )
  VALUES (
    _user_id, _save_request_id, _prompt, _subject, _title, _schema_json,
    _embedding, _thumbnail_url, COALESCE(_tags, '{}'::text[]), true, 2
  )
  ON CONFLICT (user_id, save_request_id) WHERE save_request_id IS NOT NULL
  DO NOTHING
  RETURNING * INTO _simulation;

  IF NOT FOUND THEN
    SELECT s.* INTO _simulation
    FROM public.simulations s
    WHERE s.user_id = _user_id AND s.save_request_id = _save_request_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Could not resolve simulation save retry' USING ERRCODE = '40001';
    END IF;
    IF _simulation.prompt IS DISTINCT FROM _prompt
       OR _simulation.subject IS DISTINCT FROM _subject
       OR _simulation.title IS DISTINCT FROM _title
       OR _simulation.schema_json IS DISTINCT FROM _schema_json
       OR _simulation.tags IS DISTINCT FROM COALESCE(_tags, '{}'::text[]) THEN
      RAISE EXCEPTION 'Save request id was already used for different simulation data'
        USING ERRCODE = '22023';
    END IF;

    RETURN QUERY
    SELECT s.id, s.prompt, s.subject, s.title, s.schema_json,
           s.thumbnail_url, s.created_at, s.tags
    FROM public.simulations s WHERE s.id = _simulation.id;
    RETURN;
  END IF;

  INSERT INTO public.simulation_versions (
    simulation_id, user_id, schema_json, prompt, version_number
  )
  VALUES (_simulation.id, _user_id, _schema_json, _prompt, 1);

  RETURN QUERY
  SELECT s.id, s.prompt, s.subject, s.title, s.schema_json,
         s.thumbnail_url, s.created_at, s.tags
  FROM public.simulations s WHERE s.id = _simulation.id;
END;
$$;

REVOKE ALL ON FUNCTION lab_private.save_simulation_with_initial_version(
  uuid, text, text, text, jsonb, public.vector, text, text[]
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION lab_private.save_simulation_with_initial_version(
  uuid, text, text, text, jsonb, public.vector, text, text[]
) TO authenticated;

-- SECURITY INVOKER wrapper leaves authorization to the helper's explicit
-- checks while keeping the PostgREST-facing public function minimally capable.
CREATE FUNCTION public.save_simulation_with_initial_version(
  _save_request_id uuid,
  _prompt text,
  _subject text,
  _title text,
  _schema_json jsonb,
  _embedding public.vector(1536),
  _thumbnail_url text,
  _tags text[]
)
RETURNS TABLE (
  id uuid,
  prompt text,
  subject text,
  title text,
  schema_json jsonb,
  thumbnail_url text,
  created_at timestamptz,
  tags text[]
)
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT * FROM lab_private.save_simulation_with_initial_version(
    _save_request_id, _prompt, _subject, _title, _schema_json,
    _embedding, _thumbnail_url, _tags
  );
$$;

REVOKE ALL ON FUNCTION public.save_simulation_with_initial_version(
  uuid, text, text, text, jsonb, public.vector, text, text[]
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_simulation_with_initial_version(
  uuid, text, text, text, jsonb, public.vector, text, text[]
) TO authenticated;
