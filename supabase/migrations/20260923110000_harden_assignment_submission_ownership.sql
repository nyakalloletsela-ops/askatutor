-- Ensure a learner can only submit work for their own assignment and cannot
-- author or overwrite tutor grading fields. Tutors may update submissions for
-- their assignments; admins retain the existing operational override.

DROP POLICY IF EXISTS "student creates own submission" ON public.assignment_submissions;
CREATE POLICY "student creates own assignment submission"
ON public.assignment_submissions
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = student_id
  AND public.has_role(auth.uid(), 'student'::app_role)
  AND EXISTS (
    SELECT 1
    FROM public.assignments a
    WHERE a.id = assignment_submissions.assignment_id
      AND a.student_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "student or tutor updates submission" ON public.assignment_submissions;
CREATE POLICY "student updates own ungraded submission"
ON public.assignment_submissions
FOR UPDATE TO authenticated
USING (
  auth.uid() = student_id
  AND public.has_role(auth.uid(), 'student'::app_role)
  AND grade IS NULL
  AND feedback IS NULL
  AND graded_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.assignments a
    WHERE a.id = assignment_submissions.assignment_id
      AND a.student_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = student_id
  AND public.has_role(auth.uid(), 'student'::app_role)
  AND grade IS NULL
  AND feedback IS NULL
  AND graded_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.assignments a
    WHERE a.id = assignment_submissions.assignment_id
      AND a.student_id = auth.uid()
  )
);

CREATE POLICY "tutor or admin updates assignment submission"
ON public.assignment_submissions
FOR UPDATE TO authenticated
USING (
  (
    public.has_role(auth.uid(), 'tutor'::app_role)
    AND EXISTS (
      SELECT 1
      FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND a.tutor_id = auth.uid()
        AND a.student_id = assignment_submissions.student_id
    )
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  (
    public.has_role(auth.uid(), 'tutor'::app_role)
    AND EXISTS (
      SELECT 1
      FROM public.assignments a
      WHERE a.id = assignment_submissions.assignment_id
        AND a.tutor_id = auth.uid()
        AND a.student_id = assignment_submissions.student_id
    )
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);
