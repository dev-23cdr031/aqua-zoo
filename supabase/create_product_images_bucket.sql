-- CREATE PRODUCT IMAGE STORAGE BUCKET (SUPABASE)
-- ==============================================
-- Copy this whole file and paste it into:
--   Supabase Dashboard -> SQL Editor -> New query -> Run
-- Then open the Admin panel -> Products -> Add Product ->
-- click/drop a photo to upload.  (Safe to run twice.)
-- ==============================================

-- 1) Public bucket for product / gallery photos (10 MB max)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Public read for everyone visiting the site
drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

-- 3) Signed-in admins may upload / replace / delete images
drop policy if exists "admin_upload_product_images" on storage.objects;
create policy "admin_upload_product_images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "admin_update_product_images" on storage.objects;
create policy "admin_update_product_images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images');

drop policy if exists "admin_delete_product_images" on storage.objects;
create policy "admin_delete_product_images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');
