-- Fix Storage Policies for Covers and Book Files

-- 1. COVERS (Public)
DROP POLICY IF EXISTS "Public Access Covers" ON storage.objects;
CREATE POLICY "Public Access Covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');

DROP POLICY IF EXISTS "Authenticated Upload Covers" ON storage.objects;
CREATE POLICY "Authenticated Upload Covers" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'covers' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Owner Manage Covers" ON storage.objects;
CREATE POLICY "Owner Manage Covers" ON storage.objects FOR ALL USING (
  bucket_id = 'covers' AND auth.uid() = owner
);

-- 2. BOOK FILES (Private)
DROP POLICY IF EXISTS "Seller Upload Book Files" ON storage.objects;
CREATE POLICY "Seller Upload Book Files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'book_files' AND auth.role() = 'authenticated'
);

DROP POLICY IF EXISTS "Seller Manage Book Files" ON storage.objects;
CREATE POLICY "Seller Manage Book Files" ON storage.objects FOR ALL USING (
  bucket_id = 'book_files' AND auth.uid() = owner
);
