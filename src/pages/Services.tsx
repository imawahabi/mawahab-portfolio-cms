
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  type LucideIcon,
  Check,
  Sparkles,
  Star,
  Palette,
  Rocket,
  PenTool,
  Shield,
  Clock,
  Users,
  Award,
  ArrowRight,
  ArrowLeft,
  Heart,
  ThumbsUp,
  Target,
  TrendingUp,
  DollarSign,
  Headphones,
  CheckCircle2,
  Play,
  Quote,
  AlertCircle,
  Code2,
  Laptop,
  FileText,
  Monitor,
  MessageSquare,
  Layers,
  Camera,
  Globe,
  Brush
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getDisplayProjectCount } from '@/constants/projectCount';

export default function Services() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  // Fetch services from backend
  const { data: backendServices = [], isLoading, error, refetch } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
    retry: 4,
    retryDelay: 1000,
  });

  console.log('🔍 Services query state:', { isLoading, error, dataLength: backendServices.length });
  console.log('🔍 Backend services data:', backendServices);

  const noServices = !isLoading && backendServices.length === 0;
  const handleRefreshData = () => {
    console.log('🔄 Refreshing data...');
    refetch();
  };

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  const categoryIcons: Record<string, LucideIcon> = {
    design: Palette,
    programming: PenTool,
    development: Rocket,
    content: PenTool,
  };

  const iconRegistry: Record<string, LucideIcon> = {
    palette: Palette,
    brush: Brush,
    paint: Brush,
    design: Palette,
    code: Code2,
    laptop: Laptop,
    rocket: Rocket,
    development: Rocket,
    pen: PenTool,
    pencil: PenTool,
    file: FileText,
    document: FileText,
    content: FileText,
    monitor: Monitor,
    screen: Monitor,
    message: MessageSquare,
    layers: Layers,
    stack: Layers,
    camera: Camera,
    photo: Camera,
    global: Globe,
    globe: Globe,
    world: Globe,
    sparkles: Sparkles,
  };

  const getServiceIcon = (service: any): LucideIcon => {
    const normalize = (value?: string) => (typeof value === 'string' ? value.trim().toLowerCase() : undefined);
    const iconKey =
      normalize(service.subCategoryIcon) ||
      normalize(service.mainCategoryIcon) ||
      normalize(service.icon);

    if (iconKey && iconRegistry[iconKey]) {
      return iconRegistry[iconKey];
    }

    const mainKey = normalize(service.mainCategory);
    if (mainKey && categoryIcons[mainKey]) {
      return categoryIcons[mainKey];
    }

    return Sparkles;
  };

  const categories = useMemo(() => {
    if (categoriesData?.main?.length) {
      return categoriesData.main.map((cat: any) => ({
        value: cat.value,
        icon: categoryIcons[cat.value] || Sparkles,
        labelAr: cat.labelAr,
        labelEn: cat.labelEn,
      }));
    }
    return [
      { value: 'design', icon: Palette, labelAr: 'تصميم', labelEn: 'Design' },
      { value: 'programming', icon: PenTool, labelAr: 'برمجة', labelEn: 'Programming' },
      { value: 'development', icon: Rocket, labelAr: 'تطوير', labelEn: 'Development' },
    ];
  }, [categoriesData]);

  const { data: testimonials = [], isLoading: loadingTestimonials } = useQuery({
    queryKey: ['testimonials', 'approved'],
    queryFn: () =>
      api.getTestimonials({ status: 'approved' }).then((list: any[]) =>
        list.map((t) => ({
          ...t,
          clientName: t.clientName || t.companyName || '',
        })),
      ),
  });

  const testimonialsStats = useMemo(() => {
    const count = testimonials.length;
    const avgRating =
      testimonials.reduce((sum: number, t: any) => sum + (Number(t.rating) || 0), 0) / (count || 1);
    const satisfaction = Math.round(Math.min(100, Math.max(0, (avgRating / 5) * 100))) || 0;
    return {
      happyClients: count,
      satisfactionRate: `${satisfaction}%`,
    };
  }, [testimonials]);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    retry: 2,
    retryDelay: 800,
  });
  const statsLoading = loadingProjects || loadingTestimonials;
  const projectCount = projects.length;
  const displayProjectCount = statsLoading ? null : getDisplayProjectCount(projectCount);

  const heroNavLinks = [
    { id: 'services-list', labelAr: 'الخدمات التي أقدمها', labelEn: 'Services I Offer', icon: Layers },
    { id: 'why-choose', labelAr: 'لماذا تختار خدماتي', labelEn: 'Why Choose My Services', icon: Heart },
    { id: 'how-i-work', labelAr: 'كيف أعمل', labelEn: 'How I Work', icon: Target },
    { id: 'testimonials', labelAr: 'آراء العملاء', labelEn: 'Client Voices', icon: Quote },
    { id: 'faq', labelAr: 'الأسئلة الشائعة', labelEn: 'FAQ', icon: MessageSquare },
  ];

  const handleSmoothScroll = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const processSteps = [
    {
      step: 1,
      icon: Target,
      titleAr: 'التواصل وجمع التفاصيل',
      titleEn: 'Discovery & Details',
      descAr: 'أتواصل معك لفهم الفكرة، أطرح كل الأسئلة اللازمة وأوثّق المتطلبات بشكل واضح.',
      descEn: 'I reach out to understand the idea, ask the right questions, and capture every requirement clearly.'
    },
    {
      step: 2,
      icon: Sparkles,
      titleAr: 'تخطيط وهيكلة المشروع',
      titleEn: 'Plan & Blueprint',
      descAr: 'أعد الخطة الزمنية والهيكل الكامل، وأجهز مسودة شاملة أعرضها عليك للمراجعة.',
      descEn: 'I map the full structure and timeline, then prepare a complete draft for you to review.'
    },
    {
      step: 3,
      icon: Rocket,
      titleAr: 'تنفيذ ومراجعة مستمرة',
      titleEn: 'Build & Review',
      descAr: 'أبدأ تنفيذ المشروع خطوة بخطوة، أشاركك التحديثات، ونراجع النتائج للتأكد من دقة التفاصيل.',
      descEn: 'I start building in clear steps, keep you updated, and review outputs to ensure everything matches.'
    },
    {
      step: 4,
      icon: CheckCircle2,
      titleAr: 'العرض النهائي والتسليم',
      titleEn: 'Final Presentation & Delivery',
      descAr: 'أعرض النسخة النهائية، أنفذ التعديلات المطلوبة، ثم أُسلّم المشروع كاملاً مع التوجيهات.',
      descEn: 'I present the final version, apply the refinements you need, and deliver the project with guidance.'
    }
  ];

  const benefits = [
    {
      icon: Shield,
      titleAr: 'ضمان الجودة',
      titleEn: 'Quality Guarantee',
      descAr: 'جميع مشاريعي تأتي مع ضمان شامل للجودة',
      descEn: 'All my projects come with comprehensive quality guarantee'
    },
    {
      icon: Clock,
      titleAr: 'التسليم في الوقت',
      titleEn: 'On-Time Delivery',
      descAr: 'ألتزم بمواعيد التسليم المحددة',
      descEn: 'I adhere to agreed delivery schedules'
    },
    {
      icon: Users,
      titleAr: 'عمل محترف',
      titleEn: 'Professional Work',
      descAr: 'عمل احترافي من واقع سنين طويلة من الخبرة',
      descEn: 'Professional work built on many years of experience'
    },
    {
      icon: Headphones,
      titleAr: 'دعم مستمر',
      titleEn: 'Ongoing Support',
      descAr: 'دعم فني متواصل مني حتى بعد التسليم',
      descEn: 'Continuous technical support from me even after delivery'
    },
    {
      icon: DollarSign,
      titleAr: 'أسعار تنافسية',
      titleEn: 'Competitive Prices',
      descAr: 'أفضل قيمة مقابل السعر في السوق',
      descEn: 'Best value for money in the market'
    },
    {
      icon: Award,
      titleAr: 'خبرة واسعة',
      titleEn: 'Extensive Experience',
      descAr: 'سنوات من الخبرة في المشاريع الناجحة',
      descEn: 'Years of experience in successful projects'
    }
  ];

  const faqItems = [
    {
      questionAr: 'كم يستغرق تنفيذ المشروع؟',
      questionEn: 'How long does project implementation take?',
      answerAr: 'تختلف مدة التنفيذ حسب حجم وتعقيد المشروع، لكن عادة ما تتراوح بين 2-8 أسابيع للمشاريع العادية.',
      answerEn: 'Implementation time varies depending on project size and complexity, but usually ranges from 2-8 weeks for regular projects.'
    },
    {
      questionAr: 'هل يمكن تعديل الباقات حسب احتياجاتي؟',
      questionEn: 'Can packages be customized according to my needs?',
      answerAr: 'بالطبع! جميع باقاتي قابلة للتخصيص والتعديل حسب متطلبات مشروعك المحدد.',
      answerEn: 'Absolutely! All my packages can be customized and modified according to your specific project requirements.'
    },
    {
      questionAr: 'ما هي طرق الدفع المتاحة؟',
      questionEn: 'What payment methods are available?',
      answerAr: 'أقبل التحويل البنكي، K-Net، الدفع النقدي، و PayPal حسب ما يناسبك.',
      answerEn: 'I accept bank transfers, K-Net, cash payments, and PayPal as per your convenience.'
    },
    {
      questionAr: 'هل تقدم دعماً بعد التسليم؟',
      questionEn: 'Do you provide support after delivery?',
      answerAr: 'نعم، أقدم دعماً فنياً مجانياً حسب نوع المشروع.',
      answerEn: 'Yes, I provide free technical support depending on the project type.'
    },
    {
      questionAr: 'هل يمكنني رؤية نموذج أولي قبل البدء؟',
      questionEn: 'Can I see a prototype before starting?',
      answerAr: 'بالطبع! أصمم نموذجاً أولياً توضيحياً قبل البدء في التنفيذ الفعلي.',
      answerEn: 'Of course! I design an illustrative prototype before starting actual implementation.'
    },
    {
      questionAr: 'ما هي الضمانات المقدمة؟',
      questionEn: 'What guarantees are provided?',
      answerAr: 'أقدم ضمانات شاملة تشمل الجودة، التسليم في الوقت، والدعم الفني المستمر.',
      answerEn: 'I provide comprehensive guarantees including quality, on-time delivery, and continuous technical support.'
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden">
      <Header />

      <main className="relative z-10 flex-1 pt-20 overflow-x-hidden">
        {/* Simplified Hero: quick stats and navigation */}
        <section className="relative min-h-screen flex items-center py-16 sm:py-22 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center" dir={isArabic ? 'rtl' : 'ltr'}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-foreground tracking-tight">
                    <span className="block text-sm sm:text-base font-semibold text-primary/80 mb-1">
                      {isArabic ? 'حلول رقمية متكاملة' : 'Integrated digital solutions'}
                    </span>
                    <span className="gradient-text">
                      {t('servicesTitle')}
                    </span>
                  </h1>
                  <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl">
                    {isArabic
                      ? 'أصمم وأبني حلولاً رقمية عميقة الأثر: مواقع، منصات، محتوى، وتجارب مستخدم متقنة بأسلوب عملي ومرن.'
                      : 'I design and ship high-impact digital work—web, platforms, content, and refined UX—with a pragmatic, flexible approach.'}
                  </p>
                </div><br />

                <div className="rounded-3xl border border-border/70 bg-card/70 p-4 sm:p-5 shadow-lg shadow-primary/5 backdrop-blur">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm sm:text-base font-bold text-foreground">
                          {isArabic ? 'الوصول السريع' : 'Quick access'}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {isArabic ? 'روابط للوصول السريع داخل الصفحة' : 'Jump to any section on this page'}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-full border border-border/60 bg-background/30 px-3 py-1 text-[11px] text-muted-foreground">
                      {heroNavLinks.length} {isArabic ? 'أقسام' : 'sections'}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {heroNavLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleSmoothScroll(item.id)}
                          className="group inline-flex w-full items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/30 px-4 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-foreground shadow-sm shadow-black/10 transition-all hover:bg-primary/10 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.99]"
                        >
                          <span className="inline-flex items-center gap-3">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15">
                              <Icon className="h-4 w-4 text-primary" />
                            </span>
                            <span className="text-start">{isArabic ? item.labelAr : item.labelEn}</span>
                          </span>
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-muted/30 border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
                            {isArabic ? (
                              <ArrowLeft className={`h-4 w-4 transition-transform ${isArabic ? 'group-hover:-translate-x-0.5' : ''}`} />
                            ) : (
                              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

          </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.05, duration: 0.6 }}
                className="rounded-3xl border border-border/70 bg-card/80 p-6 shadow-2xl shadow-primary/10 space-y-6"
              >
                {statsLoading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-border/60 bg-secondary/40 p-4 flex items-center gap-3"
                      >
                        <div className="w-11 h-11 rounded-xl bg-muted/30 border border-border/50 animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-5 w-20 bg-muted/40 rounded animate-pulse" />
                          <div className="h-3 w-24 bg-muted/30 rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { value: `${(displayProjectCount ?? 0)}+`, labelAr: 'مشروع منجز', labelEn: 'Projects shipped', icon: Rocket },
                      { value: `${testimonialsStats.happyClients || 0}`, labelAr: 'عميل راضٍ', labelEn: 'Happy clients', icon: ThumbsUp },
                      { value: testimonialsStats.satisfactionRate, labelAr: 'معدل الرضا', labelEn: 'Satisfaction rate', icon: TrendingUp },
                      { value: '14+', labelAr: 'سنوات خبرة', labelEn: 'Years Experience', icon: Award },
                    ].map((stat, index) => {
                      const Icon = stat.icon;
                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-border/60 bg-secondary/40 p-4 flex items-center gap-3"
                        >
                          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 text-primary flex items-center justify-center">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-xl font-bold text-foreground">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">
                              {isArabic ? stat.labelAr : stat.labelEn}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>


        {/* Empty state when no services */}
        {noServices && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-10 text-center space-y-4">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary border border-primary/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">
                {isArabic ? 'لا توجد خدمات متاحة حالياً' : 'No services available right now'}
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isArabic
                  ? 'ترقب خدمات جديدة قريباً أو تواصل معي لطلب خدمة مخصصة.'
                  : 'Stay tuned for new services soon, or contact me for a custom request.'}
              </p>
              <div className="flex justify-center gap-3">
                <Link to="/contact">
                  <Button>{isArabic ? 'تواصل معي' : 'Contact Me'}</Button>
                </Link>
                <Button variant="outline" onClick={handleRefreshData}>
                  {isArabic ? 'تحديث' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Services section heading (hero-style) */}
        {!noServices && (
          <div id="services-list" className="container mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 scroll-mt-28">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-4 max-w-3xl mx-auto"
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                <span className="gradient-text">{isArabic ? 'تصفح خدماتي' : 'Browse My Services'}</span>
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                {isArabic
                  ? 'تصفّح الباقات المصممة لتناسب احتياجاتك مع تفاصيل الأسعار والمزايا.'
                  : 'Browse tailored service packages with clear pricing and included benefits.'}
              </p>
            </motion.div>
          </div>
        )}

        {isLoading && (
          <section className="py-16 lg:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-lg space-y-5 animate-pulse"
                  >
                    <div className="h-4 w-20 bg-muted/40 rounded" />
                    <div className="h-8 w-3/4 bg-muted/50 rounded" />
                    <div className="h-4 w-2/3 bg-muted/30 rounded" />
                    <div className="h-32 w-full bg-muted/20 rounded-2xl" />
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((__, i) => (
                        <div key={i} className="h-4 w-full bg-muted/30 rounded" />
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 w-16 bg-muted/40 rounded" />
                      <div className="h-10 w-24 bg-muted/40 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Enhanced Pricing Packages */}
        {!noServices && categories.map((category, catIndex) => {
          const packages = backendServices.filter((s) => s.mainCategory === category.value);
          if (packages.length === 0) return null;

          return (
            <section key={category.value} className="py-20 lg:py-32 overflow-hidden">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Enhanced Category Header */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: catIndex * 0.1 }}
                  className="text-center mb-12"
                >
                  <div className="space-y-6">
                    <h2 className="text-2xl sm:text-3xl font-bold px-5 inline-flex items-center justify-center gap-5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary category-dot" />
                      <span className="relative z-10">{isArabic ? category.labelAr : category.labelEn}</span>
                      <div className="w-2.5 h-2.5 rounded-full bg-primary category-dot" />
                    </h2>
                    <div className="h-px w-16 sm:w-24 mx-auto rounded-full bg-primary/40" />
                  </div>
                </motion.div>

                {/* Enhanced Professional Service Cards Grid */}
                <div
                  className="relative grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-full sm:max-w-3xl md:max-w-none mx-auto overflow-visible px-2 sm:px-4"
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  {packages.map((pkg, index) => {
                    const title = isArabic ? (pkg.titleAr || pkg.titleEn) : (pkg.titleEn || pkg.titleAr);
                    const description = isArabic ? (pkg.descriptionAr || pkg.descriptionEn) : (pkg.descriptionEn || pkg.descriptionAr);
                    const rawFeatures = isArabic ? (pkg.featuresAr || pkg.features) : (pkg.featuresEn || pkg.features);
                    const normalizedFeatures = Array.isArray(rawFeatures)
                      ? rawFeatures
                      : typeof rawFeatures === 'string'
                        ? rawFeatures.split('\n').filter(Boolean)
                        : [];
                    const isExpanded = !!expandedPackages[pkg.id];
                    const visibleFeatures = isExpanded ? normalizedFeatures : normalizedFeatures.slice(0, 3);
                    const hasHiddenFeatures = normalizedFeatures.length > 3;
                    const currencyLabel = isArabic
                      ? pkg.priceUnitAr || pkg.currency || 'د.ك'
                      : pkg.priceUnitEn || pkg.currency || 'KWD';
                    const ServiceIcon = getServiceIcon(pkg);
                    const isFeatured = pkg.isFeatured ?? pkg.isRecommended;

                    return (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.6 }}
                        className="group relative cursor-pointer w-full max-w-full mx-auto"
                      >
                        {/* Enhanced Card Container */}
                        <div
                          className={`relative rounded-3xl overflow-hidden transition-all duration-700 transform md:hover:-translate-y-2 bg-gradient-to-b from-card via-card to-muted/10 border shadow-xl md:hover:shadow-2xl ${
                            isFeatured
                              ? 'border-2 border-amber-400/70 hover:border-amber-300 shadow-amber-500/30 hover:shadow-amber-500/50'
                              : 'border border-border/60 hover:border-primary/40 hover:shadow-primary/10'
                          } backdrop-blur-sm`}
                        >
                          <div className="flex flex-col">
                            {isFeatured && (
                              <div className="absolute top-5 right-5 z-20">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400/90 to-amber-300/90 text-amber-950 font-semibold text-xs border border-amber-200/80 shadow-lg shadow-amber-500/40">
                                  <Star className="w-4 h-4 fill-current" />
                                  {isArabic ? 'خدمة مميزة' : 'Featured'}
                                </div>
                              </div>
                            )}
                          {/* Compact Card Header */}
                          <div className="relative p-3.5 sm:p-6 pb-4">
                            {/* Dynamic Background Pattern */}
                            <div className={`absolute top-0 left-0 w-full h-24 rounded-t-3xl overflow-hidden ${
                              isFeatured
                                ? 'bg-gradient-to-b from-amber-200/30 via-amber-100/10 to-transparent'
                                : 'bg-gradient-to-b from-primary/10 via-primary/5 to-transparent'
                            }`}>
                              {/* Floating Geometric Shapes */}
                              <div className="absolute bottom-10 right-15 w-64 h-32 bg-gradient-to-br from-amber/20 to-transparent rounded-full blur-lg" />
                              {/* Service icon watermark */}
                              <div className="absolute bottom-2 -right-4 rotate-12">
                                <div className="relative w-32 h-32">
                                  <div className={`absolute inset-0 rounded-full blur-3xl ${isFeatured ? 'bg-amber-200/12' : 'bg-primary/10'}`} />
                                  <ServiceIcon className={`absolute inset-0 w-full h-full ${isFeatured ? 'text-amber-200/10' : 'text-primary/5'} blur-sm`} />
                                </div>
                              </div>
                            </div>
                            
                            {/* Compact Service Icon Container */}
                            <div className="relative flex justify-center mb-8">
                              <div
                                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 ${
                                  isFeatured
                                    ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-amber-950 border-2 border-amber-200/80 group-hover:border-amber-100'
                                    : 'bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 text-primary border border-primary/30 group-hover:border-primary/50'
                                }`}
                              >
                                <ServiceIcon className="w-8 h-8 relative z-10" />

                                {/* Glow layers similar to homepage services cards */}
                                <div
                                  className={`absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 ${
                                    isFeatured ? 'bg-gradient-to-br from-amber-900 to-amber-900' : 'bg-gradient-to-br from-primary/50 to-primary/20'
                                  }`}
                                />
                                <div
                                  className={`absolute -inset-1 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${
                                    isFeatured ? 'bg-gradient-to-r from-amber-200/60 to-amber-100/40' : 'bg-gradient-to-r from-primary/20 to-accent/20'
                                  }`}
                                />
                                {isFeatured && (
                                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-100 rounded-full animate-pulse" />
                                )}
                              </div>
                            </div>

                            {/* Compact Title and Description */}
                            <div className="text-center space-y-3">
                              <h3 className={`text-xl font-bold leading-tight ${
                                isFeatured ? 'text-white' : 'text-foreground group-hover:text-primary transition-colors duration-300'
                              }`}>
                                {title}
                              </h3>
                              {description && (
                                <p className={`text-sm leading-relaxed max-w-xs mx-auto ${
                                  isFeatured ? 'text-amber-200' : 'text-muted-foreground'
                                }`}>
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Compact Features Section */}
                          <div className="px-4 sm:px-6 pb-6 flex-1 flex flex-col">
                            {/* Compact Section Header */}
                            <div className="flex items-center gap-3 mb-4">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${isFeatured ? 'bg-amber-400' : 'bg-primary'}`} />
                              <h4 className="text-sm font-bold text-foreground">
                                {isArabic ? 'ما يتضمنه' : "What's Included"}
                              </h4>
                              <div className={`flex-1 h-px bg-gradient-to-r ${isFeatured ? 'from-amber-300/70' : 'from-primary/40'} to-transparent`} />
                            </div>

                            {/* Compact Features List with Gradient Fade */}
                            <div className="relative flex-1">
                              <div className="relative h-full rounded-2xl border border-border/40 bg-card/40 p-4 overflow-hidden">
                                <div className="space-y-3">
                                  {visibleFeatures.map((feature, i) => (
                                    <motion.div
                                      key={i}
                                      initial={{ opacity: 0, x: -20 }}
                                      whileInView={{ opacity: 1, x: 0 }}
                                      viewport={{ once: true }}
                                      transition={{ delay: (index * 0.1) + (i * 0.05), duration: 0.4 }}
                                      className="flex items-start gap-3 group/feature"
                                    >
                                      {/* Compact Check Icon */}
                                      <div className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                        isFeatured
                                          ? 'bg-gradient-to-br from-amber-400 to-amber-200 text-amber-950 shadow-md'
                                          : 'bg-primary/10 text-primary border border-primary/20 group-hover/feature:border-primary/40 group-hover/feature:bg-primary group-hover/feature:text-white'
                                      }`}>
                                        <Check className="w-3 h-3" />
                                      </div>
                                      
                                      {/* Feature Text */}
                                      <span
                                        className={`text-sm text-foreground leading-relaxed transition-colors break-words ${
                                          isFeatured ? 'group-hover/feature:text-amber-300' : 'group-hover/feature:text-primary'
                                        }`}
                                        title={feature}
                                      >
                                        {feature}
                                      </span>
                                    </motion.div>
                                  ))}
                                </div>
                                
                              </div>
                            </div>

                            {/* Compact Expand Button */}
                            {hasHiddenFeatures && (
                            <button
                              type="button"
                              className={`mt-4 text-xs font-semibold transition-colors duration-300 flex items-center gap-2 group/expand ${
                                isFeatured ? 'text-amber-300 hover:text-amber-200' : 'text-primary hover:text-accent'
                              }`}
                              onClick={() =>
                                setExpandedPackages((prev) => ({
                                  ...prev,
                                  [pkg.id]: !isExpanded,
                                }))
                                }
                              >
                                <div
                                  className={`w-1 h-1 rounded-full transition-colors ${
                                    isFeatured
                                      ? 'bg-amber-300 group-hover/expand:bg-amber-200'
                                      : 'bg-primary group-hover/expand:bg-accent'
                                  }`}
                                />
                                {isExpanded
                                  ? isArabic ? 'عرض أقل' : 'Show less'
                                  : isArabic
                                    ? `أظهر +${normalizedFeatures.length - visibleFeatures.length}  مميزات اخرى`
                                    : `+ ${normalizedFeatures.length - visibleFeatures.length} more`}
                                {isArabic ? (
                                  <ArrowLeft className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : '-rotate-0'}`} />
                                ) : (
                                  <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? '-rotate-90' : '-rotate-0'}`} />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Compact Pricing Section */}
                          <div className="px-4 sm:px-6 pb-10 mt-auto">
                            {/* Compact Pricing Card */}
                            <div
                              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-500 group-hover:shadow-xl bg-gradient-to-b from-card via-card to-muted/20 ${
                                isFeatured
                                  ? 'border-amber-400/70 hover:border-amber-300 shadow-amber-500/30 hover:shadow-amber-500/50'
                                  : 'border-border hover:border-primary/50 hover:shadow-primary/10'
                              }`}
                            >
                              
                              {/* Background Pattern for Recommended */}
                              {isFeatured && (
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-transparent" />
                              )}

                              <div className="relative p-4">
                                {/* Main Price Display - Horizontal Layout */}
                                <div className="text-center">
                                  {/* Price Label and Range in One Line */}
                                  <div className={`flex items-center justify-center gap-2 flex-wrap pb-3 ${
                                    isFeatured ? 'text-amber-50' : 'text-foreground'
                                  }`}>
                                    {/* Price Label */}
                                    <span className={`text-xs font-semibold ${
                                      isFeatured ? 'text-amber-100/80' : 'text-muted-foreground'
                                    }`}>
                                      {isArabic ? 'ابتداءً من' : 'Starting from'}
                                    </span>
                                    
                                    {/* Price Range */}
                                    <span className={`text-2xl font-bold ${
                                      isFeatured ? 'text-amber-300' : 'text-primary'
                                    }`}>
                                      {pkg.priceFrom || 0}
                                    </span>
                                    {pkg.priceTo && (
                                      <>
                                        <span className={`text-lg font-medium ${
                                          isFeatured ? 'text-amber-200/80' : 'text-muted-foreground'
                                        }`}>-</span>
                                        <span className={`text-xl font-bold ${
                                          isFeatured ? 'text-amber-300' : 'text-primary/80'
                                        }`}>
                                          {pkg.priceTo}
                                        </span>
                                      </>
                                    )}
                                    <span className={`text-sm font-bold ${
                                      isFeatured ? 'text-amber-50/90' : 'text-muted-foreground'
                                    }`}>
                                      {currencyLabel}
                                    </span>
                                  </div>

                                  {/* Compact Disclaimer */}
                                  <div className={`relative p-2 rounded-xl border backdrop-blur-sm ${
                                    isFeatured 
                                      ? 'bg-amber-100/10 border-amber-200/30 text-amber-50/90' 
                                      : 'bg-muted/30 border-border/40 text-muted-foreground'
                                  }`}>
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className={`w-3 h-3 mt-0.5 flex-shrink-0 ${
                                        isFeatured ? 'text-amber-100' : 'text-primary'
                                      }`} />
                                      <p className="text-xs leading-relaxed">
                                        {isArabic
                                          ? 'الأسعار تقريبية وقد تختلف حسب تفاصيل مشروعك النهائي'
                                          : 'Prices may vary based on your final project scope'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
 
        {/* Enhanced Benefits Section - Professional Redesign */}
        <section id="why-choose" className="py-20 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {isArabic ? 'لماذا تختار خدماتي' : 'Why Choose My Services?'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4">
                {isArabic
                  ? 'أنا ملتزم بتقديم أفضل تجربة ونتائج استثنائية مع جودة عالية ودعم مستمر'
                  : 'I am committed to providing the best experience and exceptional results with high quality and continuous support'}
              </p>
            </motion.div>

            {/* Enhanced Benefits Grid with Modern Design */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8" dir={isArabic ? 'rtl' : 'ltr'}>
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className="relative group"
                >
                  {/* Enhanced Card Container */}
                  <div className="relative h-full rounded-3xl overflow-hidden transition-all duration-700 transform hover:-translate-y-2 bg-gradient-to-b from-card via-card to-muted/10 border border-border/60 hover:border-primary/40 shadow-xl hover:shadow-2xl hover:shadow-primary/10 backdrop-blur-sm">
                    <div className="flex flex-col h-full">
                      {/* Enhanced Icon Container with Gradient Background */}
                      <div className="relative p-8 pb-4">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
                        <div className="relative flex justify-center">
                          <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-all duration-500 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/30">
                            <benefit.icon className="w-10 h-10 text-primary relative z-10" />
                            <div className="absolute inset-0 rounded-2xl blur-lg opacity-40 bg-primary/30" />
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Content Section */}
                      <div className="px-8 pb-8 flex-1 flex flex-col">
                        <div className="text-center space-y-4">
                          <h3 className="text-2xl font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                            {isArabic ? benefit.titleAr : benefit.titleEn}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed text-base group-hover:text-primary/80 transition-colors">
                            {isArabic ? benefit.descAr : benefit.descEn}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Bottom Accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r from-primary/40 to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* Enhanced Process Section */}
        <section id="how-i-work" className="py-20 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Section Header with Professional Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {isArabic ? 'كيف أعمل' : 'How I Work'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mt-4">
                {isArabic 
                  ? 'أربع خطوات واضحة تبدأ بالتواصل لجمع التفاصيل وتنتهي بعرض المشروع وتسليمه بثقة.'
                  : 'Four clear steps that start with discovery and end with a confident final handover.'}
              </p>
            </motion.div>

            {/* Enhanced Professional Tree-Like Timeline with Centered Cards - Compact */}
            <div className="relative max-w-5xl mx-auto mt-8" dir={isArabic ? 'rtl' : 'ltr'}>
              {/* Enhanced Central Timeline Line - Compact */}
              <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary via-primary/30 to-transparent rounded-full shadow-[0_0_10px_rgba(59,130,246,0.15)]" />

              {/* Enhanced Tree Branches - Decorative Elements - Compact */}
              <div className="hidden md:block absolute top-0 left-1/4 w-px h-16 bg-gradient-to-b from-primary/20 to-transparent" />
              <div className="hidden md:block absolute top-0 right-1/4 w-px h-16 bg-gradient-to-b from-primary/20 to-transparent" />
              <div className="hidden md:block absolute bottom-0 left-1/3 w-px h-12 bg-gradient-to-t from-primary/20 to-transparent" />
              <div className="hidden md:block absolute bottom-0 right-1/3 w-px h-12 bg-gradient-to-t from-primary/20 to-transparent" />

              <div className="space-y-12">
                {processSteps.map((step, index) => {
                  const isEven = index % 2 === 0;
                  const placeRight = isArabic ? !isEven : isEven;

                  return (
                    <div key={step.step} className="relative flex w-full items-center">
                      {/* Enhanced Timeline Node - Compact */}
                      <div className="hidden md:block absolute left-1/2 -translate-x-1/2 z-20">
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15, duration: 0.6 }}
                          className="relative"
                        >
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/90 to-primary/70 border-2 border-primary/30 shadow-[0_0_15px_rgba(59,130,246,0.3)] flex items-center justify-center">
                            <span className="text-xs font-bold text-white">{step.step}</span>
                          </div>
                          {/* Pulsing glow effect - Compact */}
                          <div className="absolute inset-0 rounded-full bg-primary/30 blur-lg animate-pulse opacity-20" />
                        </motion.div>
                      </div>

                      {/* Enhanced Card Container with Tree Positioning */}
                      <div className={`flex w-full ${placeRight ? 'md:justify-end' : 'md:justify-start'} justify-center px-1 sm:px-2`}>
                        <motion.div
                          initial={{ opacity: 0, y: 30, x: placeRight ? 30 : -30 }}
                          whileInView={{ opacity: 1, y: 0, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.15, duration: 0.6 }}
                          className="relative w-full md:w-[calc(50%-3rem)]"
                        >
                          {/* Enhanced Professional Card - Compact Size */}
                          <div className="relative rounded-2xl overflow-hidden transition-all duration-700 transform hover:-translate-y-1 bg-gradient-to-br from-card via-card/90 to-muted/20 border border-primary/20 hover:border-primary/40 shadow-lg hover:shadow-xl hover:shadow-primary/10 backdrop-blur-sm">
                            <div className="p-6 text-center min-h-[250px] flex flex-col">

                              {/* Enhanced Icon with Professional Design - Compact */}
                              <div className="relative flex justify-center mb-4">
                                <div className="relative w-16 h-16 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-500 bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/30">
                                  <step.icon className="w-8 h-8 text-primary relative z-10" />
                                  <div className="absolute inset-0 rounded-xl blur-md opacity-30 bg-primary/30" />
                                </div>
                              </div>

                              {/* Enhanced Step Badge - Compact */}
                              <div className="mb-3">
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary/90 to-primary/80 text-white font-semibold text-xs border border-primary/20 shadow-md">
                                  <span className="font-bold">{isArabic ? 'مرحلة' : 'Phase'} {step.step}</span>
                                </span>
                              </div>

                              {/* Enhanced Content - Compact */}
                              <div className="flex-1 flex flex-col justify-center space-y-3">
                                <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-colors">
                                  {isArabic ? step.titleAr : step.titleEn}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed group-hover:text-primary/80 transition-colors">
                                  {isArabic ? step.descAr : step.descEn}
                                </p>
                              </div>

                              {/* Enhanced Bottom Accent */}
                              <div className="absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r from-primary/40 to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                            </div>
                          </div>

                          {/* Enhanced Tree Branch Connector - Compact */}
                          <div className={`hidden md:block absolute top-1/2 ${placeRight ? 'right-0 translate-x-1/2' : 'left-0 -translate-x-1/2'} w-16 h-px bg-gradient-to-${placeRight ? 'left' : 'right'} from-primary/40 via-primary/20 to-transparent`} />
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Professional Testimonials Section */}
        <section id="testimonials" className="py-20 lg:py-32 relative overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            {/* Enhanced Section Header with Professional Design */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="inline-flex items-center gap-4 mb-8">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-bold">
                    {isArabic ? 'ماذا يقول عملائي' : 'What My Clients Say'}
                  </h2>
                  <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
                    {isArabic 
                      ? 'تجارب حقيقية من عملاء راضين عن خدماتي'
                      : 'Real experiences from satisfied clients about our services'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Testimonials Grid with Professional Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
              {testimonials.map((testimonial, index) => {
                const displayInitial = (testimonial.clientName || testimonial.name || '-').charAt(0);
                const hasLogo = Boolean(testimonial.logoUrl);
                const formattedDate = testimonial.createdAt
                  ? new Date(testimonial.createdAt).toLocaleDateString('ar-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })
                  : '';

                return (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, duration: 0.6 }}
                    className="group relative"
                  >
                    {/* Enhanced Professional Card Design */}
                    <div className="relative h-full rounded-3xl overflow-hidden transition-all duration-700 transform hover:-translate-y-3 bg-gradient-to-b from-card via-card to-muted/10 border border-border/60 hover:border-primary/40 shadow-xl hover:shadow-2xl hover:shadow-primary/10 backdrop-blur-sm">
                      
                      {/* Dynamic Background Pattern */}
                      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
                      
                      {/* Floating Decorative Elements */}
                      <div className="absolute top-4 right-4 w-6 h-6 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-md group-hover:scale-125 transition-transform duration-500" />

                      <div className="relative p-8 space-y-5">
                        {/* Client brand + project */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">
                                {testimonial.name}
                              </h4>
                              {testimonial.clientName && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs border border-primary/20">
                                  {testimonial.clientName}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                              {[...Array(testimonial.rating || 0)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, scale: 0 }}
                                  whileInView={{ opacity: 1, scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: (index * 0.2) + (i * 0.1), duration: 0.3 }}
                                >
                                  <Star className="w-4 h-4 text-primary fill-current" />
                                </motion.div>
                              ))}
                              <span className="text-sm font-semibold text-muted-foreground ml-1">
                                {testimonial.rating}/5
                              </span>
                            </div>
                            {formattedDate && (
                              <span className="text-xs text-muted-foreground">
                                {formattedDate}
                              </span>
                            )}
                          </div>

                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/25 via-primary/10 to-card shadow-lg">
                            <div className="absolute -inset-1 rounded-2xl bg-primary/30 blur-md opacity-50 pointer-events-none" />
                            <div className="absolute inset-0 rounded-2xl border border-primary/40 backdrop-blur-[1px] pointer-events-none" />
                            {!hasLogo && (
                              <span className="absolute inset-0 flex items-center justify-center text-lg font-semibold text-primary/70">
                                {displayInitial}
                              </span>
                            )}
                            {hasLogo && (
                              <div className="relative z-10 w-full h-full">
                                <img
                                  src={testimonial.logoUrl}
                                  alt={`${testimonial.clientName || testimonial.name} logo`}
                                  loading="lazy"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Testimonial body */}
                        <div className="relative rounded-2xl border border-primary/15 bg-card/80 p-5 min-h-[170px] flex items-center justify-center text-center">
                          <Quote className="absolute -top-3 -left-3 w-10 h-10 text-primary/10" />
                          <p className="text-foreground leading-relaxed text-base relative z-10">
                            {testimonial.message}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Bottom Accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700" />
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Enhanced Empty State */}
              {testimonials.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="col-span-full text-center py-16"
                >
                  <div className="relative max-w-md mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-3xl blur-xl" />
                    <div className="relative rounded-3xl border border-dashed border-primary/30 bg-card/80 backdrop-blur-sm p-12">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 border border-primary/50 flex items-center justify-center text-primary shadow-lg mx-auto mb-6">
                        <MessageSquare className="w-8 h-8" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-4">
                        {isArabic ? 'لا توجد آراء عملاء حالياً' : 'No Client Reviews Yet'}
                      </h3>
                      <p className="text-muted-foreground">
                        {isArabic 
                          ? 'سيتم عرض آراء العملاء هنا عندما تصبح متاحة'
                          : 'Client reviews will be displayed here when available'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

          </div>
        </section>

        {/* Enhanced FAQ Section */}
        <section id="faq" className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {isArabic ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mt-4">
                {isArabic 
                  ? 'إجابات على أهم الأسئلة التي قد تخطر ببالك'
                  : 'Answers to the most important questions that might come to your mind'}
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="w-full space-y-4">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem 
                      value={`item-${index}`}
                      className="border border-primary/20 rounded-2xl px-6 bg-card/95 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <AccordionTrigger className="text-left py-6 text-lg font-semibold hover:text-primary hover:no-underline transition-colors">
                        {isArabic ? item.questionAr : item.questionEn}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 text-muted-foreground leading-relaxed text-base">
                        {isArabic ? item.answerAr : item.answerEn}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16 space-y-8"
            >
              <div className="max-w-3xl mx-auto space-y-6">
                <h3 className="text-3xl font-bold">
                  {isArabic ? 'لا يزال لديك أسئلة؟' : 'Still have questions?'}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {isArabic 
                    ? 'تواصل معي الآن واحصل على استشارة مجانية لمشروعك'
                    : 'Contact me now and get a free consultation for your project'}
                </p>
              </div><br />
              <Link to="/contact">
                <Button size="lg" className="neon-button text-lg px-12 py-6 shadow-2xl hover:shadow-primary/50 transition-all duration-300">
                  {isArabic ? 'تواصل معي' : 'Contact me'}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
