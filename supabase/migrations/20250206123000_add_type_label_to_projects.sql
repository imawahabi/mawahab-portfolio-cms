-- Add a prefix/label that appears before project name
alter table projects
add column if not exists type_label text;
