import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { dbClient, HttpError } from './db.js';

dotenv.config();

const PORT = Number(process.env.PORT) || 4600;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
if (!ADMIN_PASSWORD || !JWT_SECRET) {
  throw new Error('Missing required environment variables: ADMIN_PASSWORD and JWT_SECRET must be set (see .env.example).');
}

type JwtPayload = { email: string; role: 'admin' };

interface AuthedRequest extends Request {
  user?: JwtPayload;
}

const asyncHandler =
  (handler: (req: AuthedRequest, res: Response, next: NextFunction) => Promise<any>) =>
  (req: AuthedRequest, res: Response, next: NextFunction) =>
    handler(req, res, next).catch(next);

const app = express();
app.use(cors());
app.use(express.json());

const requireAuth = (req: AuthedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const normalizeImages = (images: any[] = []) =>
  images
    .filter((img) => img && img.url)
    .map((img, idx) => ({
      url: img.url,
      alt_ar: img.altAr ?? img.alt_ar ?? null,
      alt_en: img.altEn ?? img.alt_en ?? null,
      sort_order: img.sort_order ?? idx,
    }));

const toDbProject = (payload: any) => {
  const isFeatured = payload.isFeatured ?? payload.is_featured ?? false;
  const isHidden = payload.isHidden ?? payload.is_hidden ?? false;
  return {
    slug: payload.slug,
    main_category: payload.mainCategory,
    design_type: payload.designType ?? null,
    title_ar: payload.titleAr,
    title_en: payload.titleEn,
    short_desc_ar: payload.shortDescAr,
    short_desc_en: payload.shortDescEn,
    long_desc_ar: payload.longDescAr ?? null,
    long_desc_en: payload.longDescEn ?? null,
    year: payload.year ?? null,
    completion_date: payload.completionDate ?? null,
    client_name: payload.clientName ?? null,
    tags_ar: payload.tagsAr ?? [],
    tags_en: payload.tagsEn ?? [],
    technologies_ar: payload.technologiesAr ?? [],
    technologies_en: payload.technologiesEn ?? [],
    type_label: payload.typeLabel ?? payload.type_label ?? null,
    type_label_ar: payload.typeLabelAr ?? payload.type_label_ar ?? payload.typeLabel ?? payload.type_label ?? null,
    type_label_en: payload.typeLabelEn ?? payload.type_label_en ?? payload.typeLabel ?? payload.type_label ?? null,
    is_featured: isFeatured ? 1 : 0,
    is_hidden: isHidden ? 1 : 0,
    sort_order: payload.sortOrder ?? 0,
    cover_image: payload.coverImage ?? null,
    external_url: payload.externalUrl ?? null,
    role: payload.role ?? null,
    images: normalizeImages(payload.images),
  };
};

const toDbService = (payload: any) => ({
  slug: payload.slug,
  main_category: payload.mainCategory,
  sub_category: payload.subCategory || payload.sub_category,
  title_ar: payload.titleAr,
  title_en: payload.titleEn,
  description_ar: payload.descriptionAr,
  description_en: payload.descriptionEn,
  features_ar: payload.featuresAr ?? [],
  features_en: payload.featuresEn ?? [],
  icon: payload.icon ?? null,
  price_from: payload.priceFrom ?? null,
  price_to: payload.priceTo ?? null,
  price_unit_ar: payload.priceUnitAr ?? null,
  price_unit_en: payload.priceUnitEn ?? null,
  is_featured: payload.isFeatured ? 1 : 0,
  sort_order: payload.sortOrder ?? 0,
});

const toDbSettings = (payload: any) => ({
  site_name_ar: payload.siteNameAr,
  site_name_en: payload.siteNameEn,
  hero_title_ar: payload.heroTitleAr,
  hero_title_en: payload.heroTitleEn,
  hero_subtitle_ar: payload.heroSubtitleAr,
  hero_subtitle_en: payload.heroSubtitleEn,
  about_short_ar: payload.aboutShortAr,
  about_short_en: payload.aboutShortEn,
  about_long_ar: payload.aboutLongAr,
  about_long_en: payload.aboutLongEn,
  email_contact: payload.emailContact,
  phone_number: payload.phoneNumber,
  whatsapp_number: payload.whatsappNumber,
  instagram_url: payload.instagramUrl,
  behance_url: payload.behanceUrl,
  github_url: payload.githubUrl,
  linkedin_url: payload.linkedinUrl,
  cv_url: payload.cvUrl,
  primary_color: payload.primaryColor,
  secondary_color: payload.secondaryColor,
  availability_status: payload.availabilityStatus || 'available',
});

const toDbNote = (payload: any) => ({
  title: payload.title,
  description: payload.description ?? null,
  due_date: payload.dueDate ?? null,
});

const toDbTestimonial = (payload: any) => ({
  inviteToken: payload.inviteToken,
  name: payload.name,
  logoUrl: payload.logoUrl,
  clientName: payload.clientName,
  rating: payload.rating,
  message: payload.message,
});

app.get('/health', (_req, res) => res.json({ ok: true }));
app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    if (!process.env.DATABASE_URL) {
      throw new HttpError(500, 'DATABASE_URL is not configured');
    }
    await dbClient.ping();
    res.json({ ok: true, db: 'up' });
  }),
);

// Categories
app.get(
  '/api/categories',
  asyncHandler(async (_req, res) => {
    const categories = await dbClient.getCategories();
    res.json(categories);
  }),
);

// Auth
app.post(
  '/api/auth/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    const user = await dbClient.verifyUser(email, password);
    if (!user) {
      return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
    }
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { email: user.email, role: user.role, name: user.name } });
  }),
);

app.get(
  '/api/auth/me',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    return res.json({ email: req.user?.email ?? ADMIN_EMAIL, role: req.user?.role ?? 'admin' });
  }),
);

// Projects
app.get(
  '/api/projects',
  asyncHandler(async (req, res) => {
    const featured = req.query.featured === 'true';
    const includeHidden = req.query.includeHidden === 'true';
    const projects = await dbClient.getProjects(featured, includeHidden);
    res.json(projects);
  }),
);

app.get(
  '/api/projects/slug/:slug',
  asyncHandler(async (req, res) => {
    const includeHidden = req.query.includeHidden === 'true';
    const project = await dbClient.getProjectBySlug(req.params.slug, includeHidden);
    if (!project) return res.status(404).json({ message: 'Not found' });
    res.json(project);
  }),
);

app.post(
  '/api/projects',
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await dbClient.createProject(toDbProject(req.body));
    res.status(201).json(project);
  }),
);

app.put(
  '/api/projects/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const project = await dbClient.updateProject(req.params.id, toDbProject(req.body));
    res.json(project);
  }),
);

app.delete(
  '/api/projects/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteProject(req.params.id);
    res.status(204).send();
  }),
);

// Services
app.get(
  '/api/services',
  asyncHandler(async (_req, res) => {
    const services = await dbClient.getServices();
    res.json(services);
  }),
);

app.get(
  '/api/services/slug/:slug',
  asyncHandler(async (req, res) => {
    const service = await dbClient.getServiceBySlug(req.params.slug);
    if (!service) return res.status(404).json({ message: 'Not found' });
    res.json(service);
  }),
);

app.post(
  '/api/services',
  requireAuth,
  asyncHandler(async (req, res) => {
    const service = await dbClient.createService(toDbService(req.body));
    res.status(201).json(service);
  }),
);

app.put(
  '/api/services/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const service = await dbClient.updateService(req.params.id, toDbService(req.body));
    res.json(service);
  }),
);

app.delete(
  '/api/services/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteService(req.params.id);
    res.status(204).send();
  }),
);

// Category management (admin)
app.post(
  '/api/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const category = await dbClient.createCategory({
      slug: req.body.slug,
      nameAr: req.body.nameAr,
      nameEn: req.body.nameEn,
      icon: req.body.icon,
      parentId: req.body.parentId || null,
      sortOrder: req.body.sortOrder ?? 0,
    });
    res.status(201).json(category);
  }),
);

app.put(
  '/api/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const category = await dbClient.updateCategory(req.params.id, {
      nameAr: req.body.nameAr,
      nameEn: req.body.nameEn,
      icon: req.body.icon,
      sortOrder: req.body.sortOrder,
      parentId: req.body.parentId ?? null,
    });
    res.json(category);
  }),
);

app.delete(
  '/api/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteCategory(req.params.id);
    res.status(204).send();
  }),
);

// Site settings
app.get(
  '/api/settings',
  asyncHandler(async (_req, res) => {
    const settings = await dbClient.getSettings();
    res.json(settings);
  }),
);

app.put(
  '/api/settings',
  requireAuth,
  asyncHandler(async (req, res) => {
    const settings = await dbClient.updateSettings(toDbSettings(req.body));
    res.json(settings);
  }),
);

// Notes
app.get(
  '/api/notes',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const notes = await dbClient.getNotes();
    res.json(notes);
  }),
);

app.post(
  '/api/notes',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notes = await dbClient.createNote(toDbNote(req.body));
    res.status(201).json(notes);
  }),
);

app.put(
  '/api/notes/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const notes = await dbClient.updateNote(req.params.id, toDbNote(req.body));
    res.json(notes);
  }),
);

app.delete(
  '/api/notes/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteNote(req.params.id);
    res.status(204).send();
  }),
);

// Testimonials
app.post(
  '/api/testimonials/invite',
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const invite = await dbClient.createTestimonialInvite(req.user?.email ?? null);
    res.status(201).json(invite);
  }),
);

app.post(
  '/api/testimonials/submit',
  asyncHandler(async (req, res) => {
    const testimonial = await dbClient.submitTestimonial(toDbTestimonial(req.body));
    res.status(201).json(testimonial);
  }),
);

app.get(
  '/api/testimonials',
  asyncHandler(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const items = await dbClient.getTestimonials(status);
    res.json(items);
  }),
);

app.get(
  '/api/testimonials/invites',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const invites = await dbClient.getTestimonialInvites();
    res.json(invites);
  }),
);

app.delete(
  '/api/testimonials/invites/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteTestimonialInvite(req.params.id);
    res.status(204).send();
  }),
);

app.patch(
  '/api/testimonials/:id/status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = req.body?.status;
    const updated = await dbClient.updateTestimonialStatus(req.params.id, status);
    res.json(updated);
  }),
);

app.put(
  '/api/testimonials/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const updated = await dbClient.updateTestimonial(req.params.id, req.body || {});
    res.json(updated);
  }),
);

app.delete(
  '/api/testimonials/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteTestimonial(req.params.id);
    res.status(204).send();
  }),
);

// Contact messages
app.post(
  '/api/contact',
  asyncHandler(async (req, res) => {
    const result = await dbClient.addContactMessage(req.body);
    res.status(201).json(result);
  }),
);

app.get(
  '/api/messages',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const messages = await dbClient.getContactMessages();
    res.json(messages);
  }),
);

app.put(
  '/api/messages/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.updateContactMessageStatus(req.params.id, req.body.status);
    res.json({ ok: true });
  }),
);

app.delete(
  '/api/messages/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    await dbClient.deleteContactMessage(req.params.id);
    res.status(204).send();
  }),
);

// Admin stats
app.get(
  '/api/admin/stats',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const stats = await dbClient.getStats();
    res.json(stats);
  }),
);

// Uploads
app.post('/api/uploads', requireAuth, (_req: AuthedRequest, res: Response) => {
  // File uploads معطلة حالياً؛ استخدم روابط خارجية بدلاً من التخزين المحلي
  res.status(501).json({ message: 'Uploads are disabled; use external image URLs instead.' });
});

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'Not found' });
  }
  return next();
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal server error' });
});

const start = async () => {
  await dbClient.init();
  app.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
};

// In serverless (Vercel) we don't listen; we export the app.
if (!process.env.VERCEL) {
  start().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
} else {
  // Warm up DB on cold start
  dbClient.init().catch((err) => console.error('DB init failed', err));
}

export default app;
