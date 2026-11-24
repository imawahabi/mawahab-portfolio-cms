-- Add visibility flag to projects to allow hiding instead of deleting
alter table projects
add column if not exists is_hidden boolean default false;
