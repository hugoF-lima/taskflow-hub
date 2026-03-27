INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-attachments', 'feedback-attachments', true);

CREATE POLICY "Authenticated can upload feedback attachments"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'feedback-attachments');

CREATE POLICY "Anyone can view feedback attachments"
ON storage.objects
FOR SELECT
USING (bucket_id = 'feedback-attachments');