-- 012: Product image storage bucket for the admin panel
-- Run this in Supabase Dashboard -> SQL Editor (idempotent, safe to re-run).
-- This allows the admin to upload product photos from the Admin -> Products page.

-- 1) Create a public bucket for product/gallery images
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760, -- 10 MB per image
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) Let everyone read the images (public bucket)
drop policy if exists "public_read_product_images" on storage.objects;
create policy "public_read_product_images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');

-- 3) Let signed-in admins upload, replace and delete images
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
