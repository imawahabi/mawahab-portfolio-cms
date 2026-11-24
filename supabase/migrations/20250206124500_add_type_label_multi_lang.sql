-- Add multilingual prefix label for projects
alter table projects add column if not exists type_label text;
alter table projects add column if not exists type_label_ar text;
alter table projects add column if not exists type_label_en text;
