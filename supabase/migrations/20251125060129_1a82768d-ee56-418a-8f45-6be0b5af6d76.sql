-- Update projects table structure for new admin requirements
ALTER TABLE public.projects 
  ADD COLUMN IF NOT EXISTS completion_date DATE,
  ADD COLUMN IF NOT EXISTS tags_ar TEXT[],
  ADD COLUMN IF NOT EXISTS tags_en TEXT[],
  ADD COLUMN IF NOT EXISTS technologies_ar TEXT[],
  ADD COLUMN IF NOT EXISTS technologies_en TEXT[];

-- Update services table structure
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS price_unit_ar TEXT,
  ADD COLUMN IF NOT EXISTS price_unit_en TEXT;

-- Create storage bucket for uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'project-images',
  'project-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for project images bucket
CREATE POLICY "Public Access for project images"
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

CREATE POLICY "Admins can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-images' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update project images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete project images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-images'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);