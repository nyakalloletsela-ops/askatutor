-- Storage bucket for classroom files (notes + videos), organized by room_id
INSERT INTO storage.buckets (id, name, public) VALUES ('classroom-files', 'classroom-files', true)
ON CONFLICT (id) DO NOTHING;

-- Policies: any authenticated user can read & upload files in this bucket
CREATE POLICY "classroom files public read"
ON storage.objects FOR SELECT
USING (bucket_id = 'classroom-files');

CREATE POLICY "authenticated upload classroom files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'classroom-files');

CREATE POLICY "authenticated update own classroom files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'classroom-files' AND owner = auth.uid());

CREATE POLICY "authenticated delete own classroom files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'classroom-files' AND owner = auth.uid());