-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table for role management
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Site settings table
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name_ar TEXT NOT NULL DEFAULT 'أبو راكان',
  site_name_en TEXT NOT NULL DEFAULT 'Abu Rakan',
  hero_title_ar TEXT,
  hero_title_en TEXT,
  hero_subtitle_ar TEXT,
  hero_subtitle_en TEXT,
  about_short_ar TEXT,
  about_short_en TEXT,
  about_long_ar TEXT,
  about_long_en TEXT,
  whatsapp_number TEXT,
  email_contact TEXT,
  phone_number TEXT,
  instagram_url TEXT,
  behance_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  cv_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  main_category TEXT NOT NULL CHECK (main_category IN ('design', 'programming', 'development')),
  design_type TEXT CHECK (design_type IN ('web', 'social', 'other')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  short_desc_ar TEXT NOT NULL,
  short_desc_en TEXT NOT NULL,
  long_desc_ar TEXT,
  long_desc_en TEXT,
  year INTEGER,
  client_name TEXT,
  is_featured BOOLEAN DEFAULT false,
  cover_image TEXT,
  external_url TEXT,
  role_ar TEXT,
  role_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage projects"
  ON public.projects FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Project images table
CREATE TABLE public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_ar TEXT,
  alt_en TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project images"
  ON public.project_images FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage project images"
  ON public.project_images FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Services table
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  main_category TEXT NOT NULL CHECK (main_category IN ('design', 'programming', 'development')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT NOT NULL,
  description_en TEXT NOT NULL,
  features_ar TEXT[],
  features_en TEXT[],
  icon TEXT,
  base_price DECIMAL(10,2),
  price_unit_ar TEXT,
  price_unit_en TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view services"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Pricing packages table
CREATE TABLE public.pricing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  main_category TEXT NOT NULL CHECK (main_category IN ('design', 'programming', 'development')),
  title_ar TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_ar TEXT,
  description_en TEXT,
  price_from DECIMAL(10,2),
  price_to DECIMAL(10,2),
  features_ar TEXT[],
  features_en TEXT[],
  is_recommended BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pricing_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pricing packages"
  ON public.pricing_packages FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage pricing packages"
  ON public.pricing_packages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Contact messages table
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  service_id UUID REFERENCES public.services(id),
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'seen', 'replied')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view contact messages"
  ON public.contact_messages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can create contact messages"
  ON public.contact_messages FOR INSERT
  WITH CHECK (true);

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pricing_packages_updated_at
  BEFORE UPDATE ON public.pricing_packages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial site settings
INSERT INTO public.site_settings (
  site_name_ar, site_name_en,
  hero_title_ar, hero_title_en,
  hero_subtitle_ar, hero_subtitle_en,
  whatsapp_number, email_contact, phone_number
) VALUES (
    'أبو راكان', 'Abu Rakan',
    'هلا، أنا أبو راكان 👋', 'Hey, I''m Abu Rakan 👋',
  'مصمم جرافيك ومطوّر مواقع وبرامج من الكويت، أساعدك تطلع بشغل مرتب يناسب هويتك ويخفف عنك صداع التصميم والبرمجة.',
  'Graphic Designer & Web/Software Developer based in Kuwait. I help brands and businesses get clean designs and solid websites/apps without the usual tech headache.',
  '+965 9000 0000', 'hello@mawahab.design', '+965 9000 0000'
);
