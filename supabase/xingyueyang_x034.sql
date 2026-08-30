-- Xingyueyang X0.34 Product CMS + Media
alter table xy_products add column if not exists slug text;
alter table xy_products add column if not exists subtitle text;
alter table xy_products add column if not exists image_url text;
alter table xy_products add column if not exists gallery jsonb not null default '[]'::jsonb;
alter table xy_products add column if not exists features jsonb not null default '[]'::jsonb;
alter table xy_products add column if not exists applications jsonb not null default '[]'::jsonb;
alter table xy_products add column if not exists sort_order integer not null default 0;
alter table xy_products add column if not exists featured boolean not null default false;

update xy_products set slug=lower(replace(model,'-','-')) where slug is null;
create unique index if not exists idx_xy_products_slug on xy_products(slug);

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('xingyueyang-media','xingyueyang-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public=true, file_size_limit=10485760,
allowed_mime_types=array['image/jpeg','image/png','image/webp','image/gif'];

update xy_products set featured=true, sort_order=10 where model='NC-300';
update xy_products set featured=true, sort_order=20 where model='NC-500';
update xy_products set featured=true, sort_order=30 where model='NC-700';
