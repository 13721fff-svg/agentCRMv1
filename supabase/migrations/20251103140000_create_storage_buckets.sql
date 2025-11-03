/*
  # Create Storage Buckets for Images

  1. Storage Buckets
    - `avatars` - User avatars
    - `photos` - General photos (clients, orders, reviews)

  2. Security
    - Enable public access for avatars
    - Enable RLS policies
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'users' AND
    auth.uid()::text = (storage.filename(name))
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = 'users'
  );

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'photos');

CREATE POLICY "Anyone can view photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'photos');

CREATE POLICY "Users can delete their org photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'photos');
