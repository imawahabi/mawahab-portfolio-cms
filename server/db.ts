import { randomUUID } from 'crypto';
import dotenv from 'dotenv';
import { Pool, PoolClient, QueryResult } from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

let pool: Pool | null = null;
const getPool = () => {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new HttpError(500, 'DATABASE_URL is not configured');
  }
  pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  return pool;
};

type CategoryRow = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  icon: string | null;
  parent_id: string | null;
  sort_order: number | null;
  is_active: boolean;
};

type ServiceRow = {
  id: string;
  slug: string;
  category_id: string;
  subcategory_id: string | null;
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  features_ar: string[] | null;
  features_en: string[] | null;
  icon: string | null;
  price_from: string | null;
  price_to: string | null;
  price_unit_ar: string | null;
  price_unit_en: string | null;
  is_featured: boolean;
  sort_order: number | null;
  main_slug: string | null;
  sub_slug: string | null;
  main_label_ar: string | null;
  main_label_en: string | null;
  sub_label_ar: string | null;
  sub_label_en: string | null;
  main_icon: string | null;
  sub_icon: string | null;
};

type ProjectRow = {
  id: string;
  slug: string;
  category_id: string;
  subcategory_id: string | null;
  design_type: string | null;
  title_ar: string;
  title_en: string;
  short_desc_ar: string;
  short_desc_en: string;
  long_desc_ar: string | null;
  long_desc_en: string | null;
  year: number | null;
  completion_date: string | null;
  client_name: string | null;
  tags_ar: string[] | null;
  tags_en: string[] | null;
  technologies_ar: string[] | null;
  technologies_en: string[] | null;
  type_label: string | null;
  type_label_ar: string | null;
  type_label_en: string | null;
  is_featured: boolean;
  is_hidden: boolean | null;
  sort_order: number | null;
  cover_image: string | null;
  external_url: string | null;
  role: string | null;
  main_slug: string | null;
  sub_slug: string | null;
};

type SettingsRow = {
  id: string;
  site_name_ar: string | null;
  site_name_en: string | null;
  hero_title_ar: string | null;
  hero_title_en: string | null;
  hero_subtitle_ar: string | null;
  hero_subtitle_en: string | null;
  about_short_ar: string | null;
  about_short_en: string | null;
  about_long_ar: string | null;
  about_long_en: string | null;
  email_contact: string | null;
  phone_number: string | null;
  whatsapp_number: string | null;
  instagram_url: string | null;
  behance_url: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  cv_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  availability_status: string | null;
};

type TestimonialInviteRow = {
  id: string;
  token: string;
  invited_by: string | null;
  created_at: string;
  used_at: string | null;
};

type TestimonialRow = {
  id: string;
  invite_token: string;
  name: string;
  logo_url: string | null;
  client_name: string | null;
  rating: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
};

const runMigrations = async () => {
  const pool = getPool();
  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    CREATE TABLE IF NOT EXISTS service_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      icon TEXT,
      parent_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
      subcategory_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      description_ar TEXT NOT NULL,
      description_en TEXT NOT NULL,
      features_ar TEXT[],
      features_en TEXT[],
      icon TEXT,
      price_from NUMERIC(10,2),
      price_to NUMERIC(10,2),
      price_unit_ar TEXT,
      price_unit_en TEXT,
      is_featured BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      slug TEXT UNIQUE NOT NULL,
      category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
      subcategory_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
      design_type TEXT,
      title_ar TEXT NOT NULL,
      title_en TEXT NOT NULL,
      short_desc_ar TEXT NOT NULL,
      short_desc_en TEXT NOT NULL,
      long_desc_ar TEXT,
      long_desc_en TEXT,
      year INTEGER,
      completion_date DATE,
      client_name TEXT,
      tags_ar TEXT[],
      tags_en TEXT[],
      technologies_ar TEXT[],
      technologies_en TEXT[],
      type_label TEXT,
      type_label_ar TEXT,
      type_label_en TEXT,
      is_featured BOOLEAN DEFAULT FALSE,
      is_hidden BOOLEAN DEFAULT FALSE,
      sort_order INTEGER DEFAULT 0,
      cover_image TEXT,
      external_url TEXT,
      role TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT FALSE;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS type_label TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS type_label_ar TEXT;
    ALTER TABLE projects ADD COLUMN IF NOT EXISTS type_label_en TEXT;

    CREATE TABLE IF NOT EXISTS project_images (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      alt_ar TEXT,
      alt_en TEXT,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_name_ar TEXT,
      site_name_en TEXT,
      hero_title_ar TEXT,
      hero_title_en TEXT,
      hero_subtitle_ar TEXT,
      hero_subtitle_en TEXT,
      about_short_ar TEXT,
      about_short_en TEXT,
      about_long_ar TEXT,
      about_long_en TEXT,
      email_contact TEXT,
      phone_number TEXT,
      whatsapp_number TEXT,
      instagram_url TEXT,
      behance_url TEXT,
      github_url TEXT,
      linkedin_url TEXT,
      cv_url TEXT,
      primary_color TEXT,
      secondary_color TEXT,
      availability_status TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS testimonial_invites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token TEXT UNIQUE NOT NULL,
      invited_by TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      used_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS testimonials (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invite_token TEXT NOT NULL REFERENCES testimonial_invites(token) ON DELETE CASCADE,
      name TEXT NOT NULL,
      logo_url TEXT,
      client_name TEXT,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Ensure used_at column exists on testimonial_invites
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonial_invites' AND column_name = 'used_at'
      ) THEN
        ALTER TABLE testimonial_invites ADD COLUMN used_at TIMESTAMPTZ;
      END IF;
    END $$;

    -- Ensure client_name/logo/name columns exist on testimonials
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'client_name'
      ) THEN
        ALTER TABLE testimonials ADD COLUMN client_name TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'logo_url'
      ) THEN
        ALTER TABLE testimonials ADD COLUMN logo_url TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'testimonials' AND column_name = 'name'
      ) THEN
        ALTER TABLE testimonials ADD COLUMN name TEXT;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      main_category TEXT,
      sub_category TEXT,
      service_id UUID REFERENCES services(id) ON DELETE SET NULL,
      selected_service TEXT,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'new' CHECK (status IN ('new', 'seen', 'replied')),
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    -- Ensure new columns exist for existing deployments
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_messages' AND column_name = 'main_category'
      ) THEN
        ALTER TABLE contact_messages ADD COLUMN main_category TEXT;
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'contact_messages' AND column_name = 'sub_category'
      ) THEN
        ALTER TABLE contact_messages ADD COLUMN sub_category TEXT;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      due_date DATE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      name TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
  `);
};

const query = async <T>(sql: string, params?: any[], client?: PoolClient): Promise<QueryResult<T>> => {
  const runner = client ?? getPool();
  return runner.query<T>(sql, params);
};

const mapCategory = (row: CategoryRow) => ({
  id: row.id,
  value: row.slug,
  labelAr: row.name_ar,
  labelEn: row.name_en,
  icon: row.icon,
  parentId: row.parent_id,
  sortOrder: row.sort_order ?? 0,
});

const mapService = (row: ServiceRow) => ({
  id: row.id,
  slug: row.slug,
  mainCategory: row.main_slug,
  mainCategoryIcon: row.main_icon,
  mainCategoryLabelAr: row.main_label_ar,
  mainCategoryLabelEn: row.main_label_en,
  subCategory: row.sub_slug,
  subCategoryIcon: row.sub_icon,
  subCategoryLabelAr: row.sub_label_ar,
  subCategoryLabelEn: row.sub_label_en,
  titleAr: row.title_ar,
  titleEn: row.title_en,
  descriptionAr: row.description_ar,
  descriptionEn: row.description_en,
  featuresAr: row.features_ar || [],
  featuresEn: row.features_en || [],
  icon: row.icon,
  priceFrom: row.price_from ? Number(row.price_from) : null,
  priceTo: row.price_to ? Number(row.price_to) : null,
  priceUnitAr: row.price_unit_ar,
  priceUnitEn: row.price_unit_en,
  isFeatured: row.is_featured,
  sortOrder: row.sort_order ?? 0,
});

const mapProject = (row: ProjectRow) => ({
  id: row.id,
  slug: row.slug,
  mainCategory: row.main_slug,
  designType: row.sub_slug || row.design_type,
  titleAr: row.title_ar,
  titleEn: row.title_en,
  shortDescAr: row.short_desc_ar,
  shortDescEn: row.short_desc_en,
  longDescAr: row.long_desc_ar,
  longDescEn: row.long_desc_en,
  year: row.year,
  completionDate: row.completion_date,
  clientName: row.client_name,
  tagsAr: row.tags_ar || [],
  tagsEn: row.tags_en || [],
  technologiesAr: row.technologies_ar || [],
  technologiesEn: row.technologies_en || [],
  typeLabel: row.type_label || '',
  typeLabelAr: row.type_label_ar || '',
  typeLabelEn: row.type_label_en || '',
  type_label: row.type_label || '',
  type_label_ar: row.type_label_ar || '',
  type_label_en: row.type_label_en || '',
  isFeatured: row.is_featured,
  isHidden: row.is_hidden ?? false,
  is_hidden: row.is_hidden ?? false,
  sortOrder: row.sort_order ?? 0,
  coverImage: row.cover_image,
  externalUrl: row.external_url,
  role: row.role,
  images: [] as Array<{ url: string; altAr?: string | null; altEn?: string | null }>,
});

const mapTestimonial = (row: TestimonialRow) => ({
  id: row.id,
  inviteToken: row.invite_token,
  name: row.name,
  logoUrl: row.logo_url,
  clientName: row.client_name,
  rating: row.rating,
  message: row.message,
  status: row.status,
  createdAt: row.created_at,
});

const mapTestimonialInvite = (row: TestimonialInviteRow) => ({
  id: row.id,
  token: row.token,
  invitedBy: row.invited_by,
  createdAt: row.created_at,
  usedAt: row.used_at,
  used: !!row.used_at,
});

const seedCategories = async () => {
  const count = await query<{ count: string }>('SELECT COUNT(*) FROM service_categories;');
  if (Number(count.rows[0].count) > 0) return;

  const defaults = [
    {
      slug: 'design',
      name_ar: 'التصميم',
      name_en: 'Design',
      icon: '🎨',
      subs: [
        { slug: 'social', name_ar: 'سوشيال ميديا', name_en: 'Social Media Design' },
        { slug: 'brand', name_ar: 'هوية بصرية', name_en: 'Brand Identity' },
        { slug: 'web', name_ar: 'ويب', name_en: 'Web Design' },
        { slug: 'print', name_ar: 'مطبوعات', name_en: 'Print' },
      ],
    },
    {
      slug: 'programming',
      name_ar: 'برمجة',
      name_en: 'Programming',
      icon: '💻',
      subs: [
        { slug: 'frontend', name_ar: 'واجهات أمامية', name_en: 'Frontend' },
        { slug: 'backend', name_ar: 'واجهات خلفية', name_en: 'Backend' },
        { slug: 'mobile', name_ar: 'تطبيقات جوال', name_en: 'Mobile Apps' },
      ],
    },
    {
      slug: 'design-programming',
      name_ar: 'تصميم وبرمجة',
      name_en: 'Design & Programming',
      icon: '🚀',
      subs: [
        { slug: 'web-app', name_ar: 'تطبيقات ويب', name_en: 'Web Apps' },
        { slug: 'ecommerce', name_ar: 'متاجر إلكترونية', name_en: 'E-commerce' },
        { slug: 'dashboard', name_ar: 'لوحات تحكم', name_en: 'Dashboards' },
      ],
    },
    {
      slug: 'development',
      name_ar: 'تطوير',
      name_en: 'Development',
      icon: '🔧',
      subs: [
        { slug: 'websites', name_ar: 'مواقع ويب', name_en: 'Websites' },
        { slug: 'web-apps', name_ar: 'تطبيقات ويب', name_en: 'Web Apps' },
        { slug: 'custom-systems', name_ar: 'أنظمة وبرامج خاصة', name_en: 'Custom Systems' },
      ],
    },
    {
      slug: 'content',
      name_ar: 'إدارة محتوى',
      name_en: 'Content Management',
      icon: '📝',
      subs: [
        { slug: 'content-creation', name_ar: 'إنشاء محتوى', name_en: 'Content Creation' },
        { slug: 'social-management', name_ar: 'إدارة الحسابات', name_en: 'Social Media Management' },
        { slug: 'seo', name_ar: 'تحسين محركات البحث', name_en: 'SEO' },
      ],
    },
  ];

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    for (const [index, cat] of defaults.entries()) {
      const main = await query<{ id: string }>(
        `
          INSERT INTO service_categories (slug, name_ar, name_en, icon, sort_order)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar
          RETURNING id;
        `,
        [cat.slug, cat.name_ar, cat.name_en, cat.icon, index],
        client,
      );
      const mainId = main.rows[0].id;
      for (const [subIndex, sub] of (cat.subs || []).entries()) {
        await query(
          `
            INSERT INTO service_categories (slug, name_ar, name_en, icon, parent_id, sort_order)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (slug) DO UPDATE SET name_ar = EXCLUDED.name_ar, parent_id = EXCLUDED.parent_id;
          `,
          [sub.slug, sub.name_ar, sub.name_en, null, mainId, subIndex],
          client,
        );
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getCategoryBySlug = async (slug: string): Promise<CategoryRow | null> => {
  const result = await query<CategoryRow>('SELECT * FROM service_categories WHERE slug = $1 LIMIT 1;', [slug]);
  return result.rows[0] ?? null;
};

const shouldSeedServices = () => {
  return process.env.SKIP_SEED_SERVICES !== 'true';
};

const seedServices = async () => {
  if (!shouldSeedServices()) return;
  const count = await query<{ count: string }>('SELECT COUNT(*) FROM services;');
  if (Number(count.rows[0].count) > 0) return;

  const services = [
    {
      slug: 'web-design',
      category: 'design',
      sub: 'web',
      title_ar: 'تصميم مواقع ويب',
      title_en: 'Web Design',
      description_ar: 'تصميم مواقع عصرية ومتجاوبة مع جميع الأجهزة',
      description_en: 'Modern, responsive website designs for all devices',
      features_ar: ['تصميم UI/UX', 'مواقع متجاوبة', 'نموذج تفاعلي'],
      features_en: ['UI/UX Design', 'Responsive', 'Prototype'],
      icon: 'Palette',
      price_from: 400,
      price_to: 800,
      price_unit_ar: 'د.ك',
      price_unit_en: 'KWD',
      is_featured: true,
      sort_order: 1,
    },
    {
      slug: 'social-media-design',
      category: 'design',
      sub: 'social',
      title_ar: 'تصميم سوشيال ميديا',
      title_en: 'Social Media Design',
      description_ar: 'حملات سوشيال ميديا احترافية مع هوية موحدة',
      description_en: 'Professional social media campaigns with consistent branding',
      features_ar: ['Instagram', 'Facebook', 'TikTok'],
      features_en: ['Instagram', 'Facebook', 'TikTok'],
      icon: 'Image',
      price_from: 250,
      price_to: 500,
      price_unit_ar: 'د.ك',
      price_unit_en: 'KWD',
      is_featured: true,
      sort_order: 2,
    },
    {
      slug: 'inventory-system',
      category: 'development',
      sub: 'custom-systems',
      title_ar: 'نظام إدارة المخزون',
      title_en: 'Inventory System',
      description_ar: 'تطوير نظام إدارة مخزون ومبيعات مخصص',
      description_en: 'Custom inventory and sales management system development',
      features_ar: ['تقارير', 'موردين', 'مبيعات'],
      features_en: ['Reports', 'Suppliers', 'Sales'],
      icon: 'Database',
      price_from: 800,
      price_to: 1500,
      price_unit_ar: 'د.ك',
      price_unit_en: 'KWD',
      is_featured: false,
      sort_order: 3,
    },
  ];

  for (const service of services) {
    const category = await getCategoryBySlug(service.category);
    if (!category) continue;
    const subcategory = service.sub ? await getCategoryBySlug(service.sub) : null;
    await query(
      `
        INSERT INTO services (
          slug, category_id, subcategory_id, title_ar, title_en, description_ar, description_en, features_ar, features_en, icon,
          price_from, price_to, price_unit_ar, price_unit_en, is_featured, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16
        ) ON CONFLICT (slug) DO NOTHING;
      `,
      [
        service.slug,
        category.id,
        subcategory?.id ?? null,
        service.title_ar,
        service.title_en,
        service.description_ar,
        service.description_en,
        service.features_ar,
        service.features_en,
        service.icon,
        service.price_from,
        service.price_to,
        service.price_unit_ar,
        service.price_unit_en,
        service.is_featured,
        service.sort_order,
      ],
    );
  }
};

const seedProjects = async () => {
  const count = await query<{ count: string }>('SELECT COUNT(*) FROM projects;');
  if (Number(count.rows[0].count) > 0) return;

  const projects = [
    {
      slug: 'modern-website-design',
      category: 'design',
      sub: 'web',
      title_ar: 'تصميم موقع حديث',
      title_en: 'Modern Website Design',
      short_desc_ar: 'تصميم موقع عصري بألوان زاهية وتجربة مستخدم مميزة',
      short_desc_en: 'Modern website design with vibrant colors and excellent UX',
      long_desc_ar: 'مشروع تصميم موقع إلكتروني متكامل مع تركيز على تجربة المستخدم والهوية البصرية.',
      long_desc_en: 'Full website design project focusing on UX and brand identity.',
      year: 2024,
      completion_date: '2024-06-15',
      client_name: 'Tech Solutions',
      tags_ar: ['تصميم', 'ويب'],
      tags_en: ['design', 'web'],
      technologies_ar: ['React', 'Tailwind'],
      technologies_en: ['React', 'Tailwind'],
      is_featured: true,
      sort_order: 1,
      cover_image: 'https://placehold.co/800x500?text=Project+1',
      external_url: 'https://example.com',
      role: 'UI/UX Designer',
      images: [
        { url: 'https://placehold.co/1000x600?text=Web+1', alt_ar: 'صورة رئيسية', alt_en: 'Main image' },
        { url: 'https://placehold.co/1000x600?text=Web+2', alt_ar: 'تفاصيل', alt_en: 'Details' },
      ],
    },
    {
      slug: 'social-media-campaign',
      category: 'design',
      sub: 'social',
      title_ar: 'حملة سوشيال ميديا',
      title_en: 'Social Media Campaign',
      short_desc_ar: 'تصميم حملة سوشيال ميديا متكاملة لمدة شهر',
      short_desc_en: 'Complete social media design campaign for a month',
      long_desc_ar: '30 بوست احترافي يحافظ على الهوية البصرية مع خطة نشر واضحة.',
      long_desc_en: '30 professional posts with a clear publishing plan and consistent branding.',
      year: 2024,
      completion_date: '2024-04-01',
      client_name: 'Retail Brand',
      tags_ar: ['سوشيال', 'حملة'],
      tags_en: ['social', 'campaign'],
      technologies_ar: ['Photoshop', 'Illustrator'],
      technologies_en: ['Photoshop', 'Illustrator'],
      is_featured: true,
      sort_order: 2,
      cover_image: 'https://placehold.co/800x500?text=Project+2',
      external_url: null,
      role: 'Graphic Designer',
      images: [{ url: 'https://placehold.co/1000x600?text=Social+1', alt_ar: 'منشور', alt_en: 'Post' }],
    },
    {
      slug: 'inventory-management-system',
      category: 'development',
      sub: 'custom-systems',
      title_ar: 'نظام إدارة المخزون',
      title_en: 'Inventory Management System',
      short_desc_ar: 'برنامج سطح مكتب لإدارة المخزون والمبيعات',
      short_desc_en: 'Desktop app for managing inventory and sales',
      long_desc_ar: 'نظام متكامل لإدارة المخزون والموردين والمبيعات مع تقارير تفصيلية.',
      long_desc_en: 'Full system to manage inventory, suppliers, and sales with detailed reports.',
      year: 2023,
      completion_date: '2023-10-10',
      client_name: 'Trading Company',
      tags_ar: ['برمجة', 'إدارة'],
      tags_en: ['development', 'inventory'],
      technologies_ar: ['.NET', 'SQL'],
      technologies_en: ['.NET', 'SQL'],
      is_featured: false,
      sort_order: 3,
      cover_image: 'https://placehold.co/800x500?text=Project+3',
      external_url: null,
      role: 'Full Stack Developer',
      images: [{ url: 'https://placehold.co/1000x600?text=Inventory+1', alt_ar: 'واجهة', alt_en: 'UI' }],
    },
  ];

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    for (const project of projects) {
      const category = await getCategoryBySlug(project.category);
      const subcategory = project.sub ? await getCategoryBySlug(project.sub) : null;
      if (!category) continue;
      const inserted = await query<{ id: string }>(
        `
          INSERT INTO projects (
            slug, category_id, subcategory_id, design_type, title_ar, title_en, short_desc_ar, short_desc_en, long_desc_ar, long_desc_en,
            year, completion_date, client_name, tags_ar, tags_en, technologies_ar, technologies_en, is_featured, sort_order,
            cover_image, external_url, role
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
          ) ON CONFLICT (slug) DO NOTHING RETURNING id;
        `,
        [
          project.slug,
          category.id,
          subcategory?.id ?? null,
          project.sub,
          project.title_ar,
          project.title_en,
          project.short_desc_ar,
          project.short_desc_en,
          project.long_desc_ar,
          project.long_desc_en,
          project.year,
          project.completion_date,
          project.client_name,
          project.tags_ar,
          project.tags_en,
          project.technologies_ar,
          project.technologies_en,
          project.is_featured,
          project.sort_order,
          project.cover_image,
          project.external_url,
          project.role,
        ],
        client,
      );

      const projectId = inserted.rows[0]?.id;
      if (projectId && project.images?.length) {
        for (const [idx, img] of project.images.entries()) {
          await query(
            `
              INSERT INTO project_images (id, project_id, image_url, alt_ar, alt_en, sort_order)
              VALUES ($1, $2, $3, $4, $5, $6)
              ON CONFLICT (id) DO NOTHING;
            `,
            [randomUUID(), projectId, img.url, img.alt_ar || null, img.alt_en || null, idx],
            client,
          );
        }
      }
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const seedSettings = async () => {
  const existing = await query<{ count: string }>('SELECT COUNT(*) FROM site_settings;');
  if (Number(existing.rows[0].count) > 0) return;

  await query(
    `
      INSERT INTO site_settings (
        site_name_ar, site_name_en, hero_title_ar, hero_title_en, hero_subtitle_ar, hero_subtitle_en, about_short_ar, about_short_en,
        about_long_ar, about_long_en, email_contact, phone_number, whatsapp_number, instagram_url, behance_url, github_url, linkedin_url, cv_url,
        primary_color, secondary_color, availability_status
      ) VALUES (
        'أبو راكان', 'Abu Rakan', 'هلا، أنا أبو راكان 👋', 'Hey, Im Abu Rakan 👋',
        'مصمم ومطور مواقع/برامج أساعدك في حلول عملية وسريعة', 'Designer & developer helping brands ship fast', 'مصمم ومطور واجهات وتجارب رقمية',
        'Designer & developer of digital experiences', 'نص تعريفي أطول عن الخدمات والخبرة', 'Longer bio about services and experience',
        'hello@mawahab.design', '+965 9000 0000', '+965 9000 0000', 'https://instagram.com', 'https://behance.net',
        'https://github.com', 'https://linkedin.com', 'https://example.com/cv.pdf', '#3B82F6', '#1E40AF', 'available'
      );
    `,
  );
};

const seedNotes = async () => {
  const existing = await query<{ count: string }>('SELECT COUNT(*) FROM notes;');
  if (Number(existing.rows[0].count) > 0) return;

  await query(
    `
      INSERT INTO notes (title, description, due_date)
      VALUES ('مرحباً بك', 'ابدأ بإضافة ملاحظات لمهامك اليومية', CURRENT_DATE + INTERVAL '7 days');
    `,
  );
};

const seedAdminUser = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) return;

  const existing = await query<{ id: string }>('SELECT id FROM users WHERE email = $1;', [adminEmail]);
  if (existing.rows[0]) return;

  const hash = await bcrypt.hash(adminPassword, 10);
  await query(
    `
      INSERT INTO users (email, password_hash, role, name)
      VALUES ($1, $2, 'admin', $3)
      ON CONFLICT (email) DO NOTHING;
    `,
    [adminEmail, hash, process.env.ADMIN_NAME || 'Admin'],
  );
};

const ensureSeeds = async () => {
  await seedCategories();
  await seedServices();
  await seedProjects();
  await seedSettings();
  await seedNotes();
  await seedAdminUser();
};

const loadProjectImages = async (projectId: string) => {
  const images = await query<{
    image_url: string;
    alt_ar: string | null;
    alt_en: string | null;
  }>(
    'SELECT image_url, alt_ar, alt_en FROM project_images WHERE project_id = $1 ORDER BY sort_order ASC, created_at ASC;',
    [projectId],
  );
  return images.rows.map((img) => ({
    url: img.image_url,
    altAr: img.alt_ar,
    altEn: img.alt_en,
  }));
};

const resolveCategoryIds = async (mainCategory?: string, subCategory?: string) => {
  if (!mainCategory) throw new HttpError(400, 'Main category is required');
  const main = await getCategoryBySlug(mainCategory);
  if (!main) throw new HttpError(400, 'Main category not found');
  let subId: string | null = null;
  if (subCategory) {
    const sub = await getCategoryBySlug(subCategory);
    if (!sub) throw new HttpError(400, 'Sub category not found');
    if (sub.parent_id && sub.parent_id !== main.id) {
      throw new HttpError(400, 'Sub category does not belong to main category');
    }
    subId = sub.id;
  }
  return { mainId: main.id, subId };
};

export const dbClient = {
  async init() {
    await runMigrations();
    await ensureSeeds();
  },

  async ping() {
    await query('SELECT 1;');
  },

  async getCategories() {
    const result = await query<CategoryRow>(
      `SELECT id, slug, name_ar, name_en, icon, parent_id, sort_order, is_active FROM service_categories WHERE is_active = TRUE ORDER BY sort_order ASC, created_at ASC;`,
    );
    const all = result.rows.map(mapCategory);
    const main = all.filter((c) => !c.parentId);
    const byParent = all.reduce<Record<string, any[]>>((acc, item) => {
      if (item.parentId) {
        acc[item.parentId] = acc[item.parentId] || [];
        acc[item.parentId].push(item);
      }
      return acc;
    }, {});

    const mainWithSubs = main.map((cat) => ({
      ...cat,
      subcategories: byParent[cat.id] || [],
    }));

    const flatBySlug: Record<string, any[]> = {};
    mainWithSubs.forEach((cat) => {
      flatBySlug[cat.value] = cat.subcategories;
    });

    return {
      main: mainWithSubs,
      ...flatBySlug,
    };
  },

  async createCategory(data: { slug: string; nameAr: string; nameEn: string; icon?: string | null; parentId?: string | null; sortOrder?: number }) {
    const slug = data.slug?.trim().toLowerCase();
    if (!slug) throw new HttpError(400, 'Slug is required');

    const parentId = data.parentId || null;
    const inserted = await query(
      `
        INSERT INTO service_categories (slug, name_ar, name_en, icon, parent_id, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, slug, name_ar, name_en, icon, parent_id, sort_order;
      `,
      [slug, data.nameAr, data.nameEn, data.icon || null, parentId, data.sortOrder ?? 0],
    );
    return mapCategory(inserted.rows[0] as any);
  },

  async updateCategory(id: string, data: { nameAr?: string; nameEn?: string; icon?: string | null; sortOrder?: number; parentId?: string | null }) {
    const existing = await query<CategoryRow>('SELECT * FROM service_categories WHERE id = $1;', [id]);
    if (!existing.rows[0]) throw new HttpError(404, 'Category not found');
    const row = existing.rows[0];
    const updated = await query(
      `
        UPDATE service_categories
        SET name_ar = $1, name_en = $2, icon = $3, sort_order = $4, parent_id = $5, updated_at = now()
        WHERE id = $6
        RETURNING id, slug, name_ar, name_en, icon, parent_id, sort_order;
      `,
      [
        data.nameAr ?? row.name_ar,
        data.nameEn ?? row.name_en,
        data.icon ?? row.icon,
        data.sortOrder ?? row.sort_order ?? 0,
        data.parentId ?? row.parent_id,
        id,
      ],
    );
    return mapCategory(updated.rows[0] as any);
  },

  async deleteCategory(id: string) {
    await query('DELETE FROM service_categories WHERE id = $1;', [id]);
  },

  async getProjects(featured?: boolean, includeHidden = false) {
    const sql = featured
      ? `
        SELECT p.*, main.slug as main_slug, sub.slug as sub_slug
        FROM projects p
        LEFT JOIN service_categories main ON p.category_id = main.id
        LEFT JOIN service_categories sub ON p.subcategory_id = sub.id
        WHERE p.is_featured = TRUE ${includeHidden ? '' : 'AND COALESCE(p.is_hidden, FALSE) = FALSE'}
        ORDER BY p.sort_order ASC, p.created_at DESC;
      `
      : `
        SELECT p.*, main.slug as main_slug, sub.slug as sub_slug
        FROM projects p
        LEFT JOIN service_categories main ON p.category_id = main.id
        LEFT JOIN service_categories sub ON p.subcategory_id = sub.id
        ${includeHidden ? '' : 'WHERE COALESCE(p.is_hidden, FALSE) = FALSE'}
        ORDER BY p.sort_order ASC, p.created_at DESC;
      `;
    const result = await query<ProjectRow>(sql);
    const projects = result.rows.map(mapProject);
    for (const project of projects) {
      project.images = await loadProjectImages(project.id);
    }
    return projects;
  },

  async getProjectBySlug(slug: string, includeHidden = false) {
    const result = await query<ProjectRow>(
      `
        SELECT p.*, main.slug as main_slug, sub.slug as sub_slug
        FROM projects p
        LEFT JOIN service_categories main ON p.category_id = main.id
        LEFT JOIN service_categories sub ON p.subcategory_id = sub.id
        WHERE p.slug = $1 ${includeHidden ? '' : 'AND COALESCE(p.is_hidden, FALSE) = FALSE'}
        LIMIT 1;
      `,
      [slug],
    );
    const row = result.rows[0];
    if (!row) return null;
    const project = mapProject(row);
    project.images = await loadProjectImages(project.id);
    return project;
  },

  async createProject(data: any) {
    const { mainId, subId } = await resolveCategoryIds(data.main_category || data.mainCategory, data.design_type || data.designType);
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      const inserted = await query<{ id: string; slug: string }>(
        `
          INSERT INTO projects (
            slug, category_id, subcategory_id, design_type, title_ar, title_en, short_desc_ar, short_desc_en, long_desc_ar, long_desc_en,
            year, completion_date, client_name, tags_ar, tags_en, technologies_ar, technologies_en, type_label, type_label_ar, type_label_en, is_featured, is_hidden, sort_order, cover_image, external_url, role
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
            $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
          )
          RETURNING id, slug;
        `,
        [
          data.slug,
          mainId,
          subId,
          data.design_type || data.designType || null,
          data.title_ar || data.titleAr,
          data.title_en || data.titleEn,
          data.short_desc_ar || data.shortDescAr,
          data.short_desc_en || data.shortDescEn,
          data.long_desc_ar || data.longDescAr || null,
          data.long_desc_en || data.longDescEn || null,
          data.year ?? null,
          data.completion_date || data.completionDate || null,
          data.client_name || data.clientName || null,
          data.tags_ar || data.tagsAr || null,
          data.tags_en || data.tagsEn || null,
          data.technologies_ar || data.technologiesAr || null,
          data.technologies_en || data.technologiesEn || null,
          data.type_label || data.typeLabel || null,
          data.type_label_ar || data.typeLabelAr || null,
          data.type_label_en || data.typeLabelEn || null,
          data.is_featured === 1 || data.isFeatured === true,
          data.is_hidden === 1 || data.isHidden === true,
          data.sort_order ?? data.sortOrder ?? 0,
          data.cover_image || data.coverImage || null,
          data.external_url || data.externalUrl || null,
          data.role || null,
        ],
        client,
      );

      const projectId = inserted.rows[0].id;
      await query('DELETE FROM project_images WHERE project_id = $1;', [projectId], client);
      if (Array.isArray(data.images)) {
        for (const [index, img] of data.images.entries()) {
          await query(
            `
              INSERT INTO project_images (id, project_id, image_url, alt_ar, alt_en, sort_order)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
            [randomUUID(), projectId, img.url, img.alt_ar || img.altAr || null, img.alt_en || img.altEn || null, index],
            client,
          );
        }
      }
      await client.query('COMMIT');
      return this.getProjectBySlug(data.slug, true);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async updateProject(id: string, data: any) {
    const { mainId, subId } = await resolveCategoryIds(data.main_category || data.mainCategory, data.design_type || data.designType);
    const client = await getPool().connect();
    try {
      await client.query('BEGIN');
      await query(
        `
          UPDATE projects SET
            slug = $1,
            category_id = $2,
            subcategory_id = $3,
            design_type = $4,
            title_ar = $5,
            title_en = $6,
            short_desc_ar = $7,
            short_desc_en = $8,
            long_desc_ar = $9,
            long_desc_en = $10,
            year = $11,
            completion_date = $12,
            client_name = $13,
            tags_ar = $14,
            tags_en = $15,
            technologies_ar = $16,
            technologies_en = $17,
            type_label = $18,
            type_label_ar = $19,
            type_label_en = $20,
            is_featured = $21,
            is_hidden = $22,
            sort_order = $23,
            cover_image = $24,
            external_url = $25,
            role = $26,
            updated_at = now()
          WHERE id = $27;
        `,
        [
          data.slug,
          mainId,
          subId,
          data.design_type || data.designType || null,
          data.title_ar || data.titleAr,
          data.title_en || data.titleEn,
          data.short_desc_ar || data.shortDescAr,
          data.short_desc_en || data.shortDescEn,
          data.long_desc_ar || data.longDescAr || null,
          data.long_desc_en || data.longDescEn || null,
          data.year ?? null,
          data.completion_date || data.completionDate || null,
          data.client_name || data.clientName || null,
          data.tags_ar || data.tagsAr || null,
          data.tags_en || data.tagsEn || null,
          data.technologies_ar || data.technologiesAr || null,
          data.technologies_en || data.technologiesEn || null,
          data.type_label || data.typeLabel || null,
          data.type_label_ar || data.typeLabelAr || null,
          data.type_label_en || data.typeLabelEn || null,
          data.is_featured === 1 || data.isFeatured === true,
          data.is_hidden === 1 || data.isHidden === true,
          data.sort_order ?? data.sortOrder ?? 0,
          data.cover_image || data.coverImage || null,
          data.external_url || data.externalUrl || null,
          data.role || null,
          id,
        ],
        client,
      );

      await query('DELETE FROM project_images WHERE project_id = $1;', [id], client);
      if (Array.isArray(data.images)) {
        for (const [index, img] of data.images.entries()) {
          await query(
            `
              INSERT INTO project_images (id, project_id, image_url, alt_ar, alt_en, sort_order)
              VALUES ($1, $2, $3, $4, $5, $6);
            `,
            [randomUUID(), id, img.url, img.alt_ar || img.altAr || null, img.alt_en || img.altEn || null, index],
            client,
          );
        }
      }
      await client.query('COMMIT');
      return this.getProjectBySlug(data.slug, true);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  async deleteProject(id: string) {
    await query('DELETE FROM project_images WHERE project_id = $1;', [id]);
    await query('DELETE FROM projects WHERE id = $1;', [id]);
  },

  async getServices() {
    const result = await query<ServiceRow>(
      `
        SELECT s.*, main.slug AS main_slug, sub.slug AS sub_slug,
               main.name_ar AS main_label_ar, main.name_en AS main_label_en,
               sub.name_ar AS sub_label_ar, sub.name_en AS sub_label_en,
               main.icon AS main_icon, sub.icon AS sub_icon
        FROM services s
        LEFT JOIN service_categories main ON s.category_id = main.id
        LEFT JOIN service_categories sub ON s.subcategory_id = sub.id
        ORDER BY s.sort_order ASC, s.created_at DESC;
      `,
    );
    return result.rows.map(mapService);
  },

  async getServiceBySlug(slug: string) {
    const result = await query<ServiceRow>(
      `
        SELECT s.*, main.slug AS main_slug, sub.slug AS sub_slug,
               main.name_ar AS main_label_ar, main.name_en AS main_label_en,
               sub.name_ar AS sub_label_ar, sub.name_en AS sub_label_en,
               main.icon AS main_icon, sub.icon AS sub_icon
        FROM services s
        LEFT JOIN service_categories main ON s.category_id = main.id
        LEFT JOIN service_categories sub ON s.subcategory_id = sub.id
        WHERE s.slug = $1
        LIMIT 1;
      `,
      [slug],
    );
    const row = result.rows[0];
    return row ? mapService(row) : null;
  },

  async createService(data: any) {
    const { mainId, subId } = await resolveCategoryIds(data.main_category || data.mainCategory, data.sub_category || data.subCategory);
    await query(
      `
        INSERT INTO services (
          slug, category_id, subcategory_id, title_ar, title_en, description_ar, description_en, features_ar, features_en, icon, price_from,
          price_to, price_unit_ar, price_unit_en, is_featured, sort_order
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
        );
      `,
      [
        data.slug,
        mainId,
        subId,
        data.title_ar || data.titleAr,
        data.title_en || data.titleEn,
        data.description_ar || data.descriptionAr,
        data.description_en || data.descriptionEn,
        data.features_ar || data.featuresAr || null,
        data.features_en || data.featuresEn || null,
        data.icon || null,
        data.price_from ?? data.priceFrom ?? null,
        data.price_to ?? data.priceTo ?? null,
        data.price_unit_ar || data.priceUnitAr || null,
        data.price_unit_en || data.priceUnitEn || null,
        data.is_featured === 1 || data.isFeatured === true,
        data.sort_order ?? data.sortOrder ?? 0,
      ],
    );
    return this.getServiceBySlug(data.slug);
  },

  async updateService(id: string, data: any) {
    const { mainId, subId } = await resolveCategoryIds(data.main_category || data.mainCategory, data.sub_category || data.subCategory);
    await query(
      `
        UPDATE services SET
          slug=$1,
          category_id=$2,
          subcategory_id=$3,
          title_ar=$4,
          title_en=$5,
          description_ar=$6,
          description_en=$7,
          features_ar=$8,
          features_en=$9,
          icon=$10,
          price_from=$11,
          price_to=$12,
          price_unit_ar=$13,
          price_unit_en=$14,
          is_featured=$15,
          sort_order=$16,
          updated_at=now()
        WHERE id=$17;
      `,
      [
        data.slug,
        mainId,
        subId,
        data.title_ar || data.titleAr,
        data.title_en || data.titleEn,
        data.description_ar || data.descriptionAr,
        data.description_en || data.descriptionEn,
        data.features_ar || data.featuresAr || null,
        data.features_en || data.featuresEn || null,
        data.icon || null,
        data.price_from ?? data.priceFrom ?? null,
        data.price_to ?? data.priceTo ?? null,
        data.price_unit_ar || data.priceUnitAr || null,
        data.price_unit_en || data.priceUnitEn || null,
        data.is_featured === 1 || data.isFeatured === true,
        data.sort_order ?? data.sortOrder ?? 0,
        id,
      ],
    );
    return this.getServiceBySlug(data.slug);
  },

  async deleteService(id: string) {
    await query('DELETE FROM services WHERE id = $1;', [id]);
  },

  async getSettings() {
    const result = await query<SettingsRow>('SELECT * FROM site_settings ORDER BY updated_at DESC LIMIT 1;');
    const row = result.rows[0];
    if (!row) return null;
    return {
      id: row.id,
      siteNameAr: row.site_name_ar,
      siteNameEn: row.site_name_en,
      heroTitleAr: row.hero_title_ar,
      heroTitleEn: row.hero_title_en,
      heroSubtitleAr: row.hero_subtitle_ar,
      heroSubtitleEn: row.hero_subtitle_en,
      aboutShortAr: row.about_short_ar,
      aboutShortEn: row.about_short_en,
      aboutLongAr: row.about_long_ar,
      aboutLongEn: row.about_long_en,
      emailContact: row.email_contact,
      phoneNumber: row.phone_number,
      whatsappNumber: row.whatsapp_number,
      instagramUrl: row.instagram_url,
      behanceUrl: row.behance_url,
      githubUrl: row.github_url,
      linkedinUrl: row.linkedin_url,
      cvUrl: row.cv_url,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      availabilityStatus: row.availability_status || 'available',
    };
  },

  async updateSettings(data: any) {
    const existing = await query<{ id: string }>('SELECT id FROM site_settings ORDER BY updated_at DESC LIMIT 1;');
    const id = existing.rows[0]?.id || randomUUID();
    await query(
      `
        INSERT INTO site_settings (
          id, site_name_ar, site_name_en, hero_title_ar, hero_title_en, hero_subtitle_ar, hero_subtitle_en, about_short_ar, about_short_en,
          about_long_ar, about_long_en, email_contact, phone_number, whatsapp_number, instagram_url, behance_url, github_url, linkedin_url, cv_url,
          primary_color, secondary_color, availability_status, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, now()
        )
        ON CONFLICT (id) DO UPDATE SET
          site_name_ar = EXCLUDED.site_name_ar,
          site_name_en = EXCLUDED.site_name_en,
          hero_title_ar = EXCLUDED.hero_title_ar,
          hero_title_en = EXCLUDED.hero_title_en,
          hero_subtitle_ar = EXCLUDED.hero_subtitle_ar,
          hero_subtitle_en = EXCLUDED.hero_subtitle_en,
          about_short_ar = EXCLUDED.about_short_ar,
          about_short_en = EXCLUDED.about_short_en,
          about_long_ar = EXCLUDED.about_long_ar,
          about_long_en = EXCLUDED.about_long_en,
          email_contact = EXCLUDED.email_contact,
          phone_number = EXCLUDED.phone_number,
          whatsapp_number = EXCLUDED.whatsapp_number,
          instagram_url = EXCLUDED.instagram_url,
          behance_url = EXCLUDED.behance_url,
          github_url = EXCLUDED.github_url,
          linkedin_url = EXCLUDED.linkedin_url,
          cv_url = EXCLUDED.cv_url,
          primary_color = EXCLUDED.primary_color,
          secondary_color = EXCLUDED.secondary_color,
          availability_status = EXCLUDED.availability_status,
          updated_at = now();
      `,
      [
        id,
        data.site_name_ar || data.siteNameAr,
        data.site_name_en || data.siteNameEn,
        data.hero_title_ar || data.heroTitleAr,
        data.hero_title_en || data.heroTitleEn,
        data.hero_subtitle_ar || data.heroSubtitleAr,
        data.hero_subtitle_en || data.heroSubtitleEn,
        data.about_short_ar || data.aboutShortAr,
        data.about_short_en || data.aboutShortEn,
        data.about_long_ar || data.aboutLongAr,
        data.about_long_en || data.aboutLongEn,
        data.email_contact || data.emailContact,
        data.phone_number || data.phoneNumber,
        data.whatsapp_number || data.whatsappNumber,
        data.instagram_url || data.instagramUrl,
        data.behance_url || data.behanceUrl,
        data.github_url || data.githubUrl,
        data.linkedin_url || data.linkedinUrl,
        data.cv_url || data.cvUrl,
        data.primary_color || data.primaryColor,
        data.secondary_color || data.secondaryColor,
        data.availability_status || data.availabilityStatus || 'available',
      ],
    );
    return this.getSettings();
  },

  async addContactMessage(data: any) {
    let serviceId: string | null = data.service_id || data.serviceId || null;
    let selectedService = data.selected_service || data.selectedService || null;
    const mainCategory = data.main_category || data.mainCategory || null;
    const subCategory = data.sub_category || data.subCategory || null;

    if (!serviceId && data.serviceSlug) {
      const svc = await query<{ id: string; title_ar: string; title_en: string }>('SELECT id, title_ar, title_en FROM services WHERE slug = $1;', [
        data.serviceSlug,
      ]);
      if (svc.rows[0]) {
        serviceId = svc.rows[0].id;
        selectedService = svc.rows[0].title_ar;
      }
    }

    const id = randomUUID();
    await query(
      `
        INSERT INTO contact_messages (id, name, email, phone, main_category, sub_category, service_id, selected_service, message, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'new');
      `,
      [id, data.name, data.email, data.phone || null, mainCategory, subCategory, serviceId || null, selectedService || null, data.message],
    );
    return { id };
  },

  async getContactMessages() {
    const result = await query(
      `
        SELECT id, name, email, phone, main_category, sub_category, service_id, selected_service, message, status, created_at
        FROM contact_messages
        ORDER BY created_at DESC;
      `,
    );
    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      mainCategory: row.main_category,
      subCategory: row.sub_category,
      serviceId: row.service_id,
      selectedService: row.selected_service,
      status: row.status,
      createdAt: row.created_at,
    }));
  },

  async updateContactMessageStatus(id: string, status: string) {
    await query('UPDATE contact_messages SET status = $1, updated_at = now() WHERE id = $2;', [status, id]);
  },

  async deleteContactMessage(id: string) {
    await query('DELETE FROM contact_messages WHERE id = $1;', [id]);
  },

  async createTestimonialInvite(invitedBy?: string | null): Promise<TestimonialInviteRow> {
    const token = randomUUID();
    const result = await query<TestimonialInviteRow>(
      'INSERT INTO testimonial_invites (token, invited_by) VALUES ($1, $2) RETURNING id, token, invited_by, created_at, used_at;',
      [token, invitedBy || null],
    );
    return result.rows[0];
  },

  async submitTestimonial(data: { inviteToken: string; name: string; clientName?: string | null; logoUrl?: string | null; rating: number; message: string }) {
    const invite = await query<TestimonialInviteRow>('SELECT token, used_at FROM testimonial_invites WHERE token = $1;', [data.inviteToken]);
    if (!invite.rows[0]) throw new HttpError(400, 'رابط الدعوة غير صالح');
    if (invite.rows[0].used_at) throw new HttpError(400, 'تم استخدام رابط الدعوة مسبقاً');
    if (!data.name || !data.message || !data.rating) throw new HttpError(400, 'بيانات غير مكتملة');
    
    const rating = Math.max(1, Math.min(5, Number(data.rating)));

    const client = await getPool().connect();
    try {
      await client.query('BEGIN');

      const inserted = await query<TestimonialRow>(
        `
          INSERT INTO testimonials (invite_token, name, logo_url, client_name, rating, message, status)
          VALUES ($1, $2, $3, $4, $5, $6, 'pending')
          RETURNING *;
        `,
        [data.inviteToken, data.name, data.logoUrl || null, data.clientName || null, rating, data.message],
        client,
      );

      // Defensive check: ensure the row was actually inserted before proceeding.
      if (!inserted.rows[0]) {
        throw new Error('فشلت عملية إضافة التقييم إلى قاعدة البيانات بشكل غير متوقع.');
      }

      await query('UPDATE testimonial_invites SET used_at = now() WHERE token = $1;', [data.inviteToken], client);

      await client.query('COMMIT');
      return mapTestimonial(inserted.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      // Re-throw the original error to be handled by the global error handler
      throw err;
    } finally {
      client.release();
    }
  },

  async getTestimonials(status?: string) {
    const params: any[] = [];
    const where = status ? `WHERE status = $1` : '';
    if (status) params.push(status);
    const result = await query<TestimonialRow>(
      `SELECT * FROM testimonials ${where} ORDER BY created_at DESC;`,
      params,
    );
    return result.rows.map(mapTestimonial);
  },

  async getTestimonialInvites() {
    const result = await query<TestimonialInviteRow>(
      'SELECT id, token, invited_by, created_at, used_at FROM testimonial_invites ORDER BY created_at DESC LIMIT 5;',
    );
    return result.rows.map(mapTestimonialInvite);
  },

  async deleteTestimonialInvite(idOrToken: string) {
    const result = await query<TestimonialInviteRow>(
      'SELECT id, used_at FROM testimonial_invites WHERE id::text = $1 OR token = $1 LIMIT 1;',
      [idOrToken],
    );
    const invite = result.rows[0];
    if (!invite) throw new HttpError(404, 'رابط غير موجود');
    await query('DELETE FROM testimonial_invites WHERE id = $1;', [invite.id]);
  },

  async updateTestimonialStatus(id: string, status: 'approved' | 'rejected' | 'pending') {
    const allowed = ['approved', 'rejected', 'pending'];
    if (!allowed.includes(status)) throw new HttpError(400, 'حالة غير صالحة');
    const updated = await query<TestimonialRow>(
      'UPDATE testimonials SET status = $1, updated_at = now() WHERE id = $2 RETURNING *;',
      [status, id],
    );
    if (!updated.rows[0]) throw new HttpError(404, 'التقييم غير موجود');
    return mapTestimonial(updated.rows[0]);
  },

  async updateTestimonial(
    idOrToken: string,
    data: { name?: string; clientName?: string | null; logoUrl?: string | null; rating?: number; message?: string; status?: string },
  ) {
    const allowedStatus = ['approved', 'rejected', 'pending'];
    if (data.status && !allowedStatus.includes(data.status)) throw new HttpError(400, 'حالة غير صالحة');

    const current = await query<TestimonialRow>('SELECT * FROM testimonials WHERE id::text = $1 OR invite_token = $1 LIMIT 1;', [idOrToken]);
    const row = current.rows[0];
    if (!row) throw new HttpError(404, 'التقييم غير موجود');

    const nextRating = data.rating ?? row.rating;
    if (nextRating < 1 || nextRating > 5) throw new HttpError(400, 'التقييم يجب أن يكون بين 1 و 5');

    const result = await query<TestimonialRow>(
      `UPDATE testimonials 
       SET 
         name = $2,
         client_name = $3,
         logo_url = $4,
         rating = $5,
         message = $6,
         status = $7,
         updated_at = now()
       WHERE id = $1
       RETURNING *;
      `,
      [
        row.id,
        data.name ?? row.name,
        data.clientName ?? row.client_name,
        data.logoUrl ?? row.logo_url,
        nextRating,
        data.message ?? row.message,
        data.status ?? row.status,
      ],
    );

    return mapTestimonial(result.rows[0]);
  },

  async deleteTestimonial(id: string) {
    await query('DELETE FROM testimonials WHERE id = $1;', [id]);
  },

  async getNotes() {
    const result = await query('SELECT * FROM notes ORDER BY created_at DESC;');
    return result.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      dueDate: row.due_date,
      createdAt: row.created_at,
    }));
  },

  async createNote(data: any) {
    await query('INSERT INTO notes (title, description, due_date) VALUES ($1, $2, $3);', [
      data.title,
      data.description || null,
      data.due_date || data.dueDate || null,
    ]);
    return this.getNotes();
  },

  async updateNote(id: string, data: any) {
    await query('UPDATE notes SET title = $1, description = $2, due_date = $3, updated_at = now() WHERE id = $4;', [
      data.title,
      data.description || null,
      data.due_date || data.dueDate || null,
      id,
    ]);
    return this.getNotes();
  },

  async deleteNote(id: string) {
    await query('DELETE FROM notes WHERE id = $1;', [id]);
  },

  async getStats() {
    const totalProjects = await query<{ count: string }>('SELECT COUNT(*) FROM projects;');
    const featuredProjects = await query<{ count: string }>('SELECT COUNT(*) FROM projects WHERE is_featured = TRUE;');
    const totalServices = await query<{ count: string }>('SELECT COUNT(*) FROM services;');
    const totalMessages = await query<{ count: string }>('SELECT COUNT(*) FROM contact_messages;');
    const newMessages = await query<{ count: string }>("SELECT COUNT(*) FROM contact_messages WHERE status = 'new';");
    const totalTestimonials = await query<{ count: string }>('SELECT COUNT(*) FROM testimonials;');
    const pendingTestimonials = await query<{ count: string }>("SELECT COUNT(*) FROM testimonials WHERE status = 'pending';");
    const currentYear = new Date().getFullYear();
    const thisYearProjects = await query<{ count: string }>('SELECT COUNT(*) FROM projects WHERE year = $1;', [currentYear]);

    return {
      totalProjects: Number(totalProjects.rows[0].count),
      featuredProjects: Number(featuredProjects.rows[0].count),
      totalServices: Number(totalServices.rows[0].count),
      thisYearProjects: Number(thisYearProjects.rows[0].count),
      totalMessages: Number(totalMessages.rows[0].count),
      newMessages: Number(newMessages.rows[0].count),
      totalTestimonials: Number(totalTestimonials.rows[0].count),
      pendingTestimonials: Number(pendingTestimonials.rows[0].count),
    };
  },

  async getUserByEmail(email: string) {
    const result = await query('SELECT id, email, password_hash, role, name FROM users WHERE email = $1 LIMIT 1;', [email]);
    return result.rows[0] || null;
  },

  async verifyUser(email: string, password: string) {
    const user = await this.getUserByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return null;
    return { id: user.id, email: user.email, role: user.role || 'admin', name: user.name || 'Admin' };
  },

  async createUser(data: { email: string; password: string; role?: string; name?: string }) {
    const hash = await bcrypt.hash(data.password, 10);
    const result = await query(
      `
        INSERT INTO users (email, password_hash, role, name)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, role, name;
      `,
      [data.email, hash, data.role || 'admin', data.name || null],
    );
    return result.rows[0];
  },
};

export type DbClient = typeof dbClient;
export { HttpError };
