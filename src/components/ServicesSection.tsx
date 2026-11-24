import { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  type LucideIcon,
  Palette,
  Code2,
  Laptop,
  Sparkles,
  FileText,
  Monitor,
  MessageSquare,
  AlertCircle,
  PenTool,
  Rocket,
  Layers,
  Camera,
  Globe,
  Brush,
  ArrowLeft,
  ArrowRight,} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { ServicesGridSkeleton } from './LoadingPlaceholders';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ServicesSection = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const iconMap: Record<string, LucideIcon> = {
    Palette,
    Code2,
    Laptop,
    Sparkles,
    FileText,
    Monitor,
    MessageSquare,
    PenTool,
    Rocket,
    Layers,
    Camera,
    Globe,
    Brush,
  };

  const categoryIconMap: Record<string, LucideIcon> = {
    design: Palette,
    programming: PenTool,
    development: Rocket,
    content: PenTool,
    'design-programming': Rocket,
    marketing: Sparkles,
    consulting: MessageSquare,
    analytics: Monitor,
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
    layers: Layers,
    stack: Layers,
    camera: Camera,
    photo: Camera,
    global: Globe,
    globe: Globe,
    world: Globe,
    sparkles: Sparkles,
  };

  const getCategoryIcon = (service: any): LucideIcon => {
    const normalize = (value?: string) => (typeof value === 'string' ? value.trim().toLowerCase() : undefined);
    const iconFromCategories = normalize(service.subCategoryIcon) || normalize(service.mainCategoryIcon) || normalize(service.icon);
    if (iconFromCategories && iconRegistry[iconFromCategories]) {
      return iconRegistry[iconFromCategories];
    }

    const normalizedMain = normalize(service.mainCategory);
    const normalizedSub = normalize(service.subCategory);
    const normalizedCategory = normalize(service.category);

    if (normalizedMain && categoryIconMap[normalizedMain]) {
      return categoryIconMap[normalizedMain];
    }
    if (normalizedSub && categoryIconMap[normalizedSub]) {
      return categoryIconMap[normalizedSub];
    }
    if (normalizedCategory && categoryIconMap[normalizedCategory]) {
      return categoryIconMap[normalizedCategory];
    }
    if (service.mainCategory && categoryIconMap[service.mainCategory]) {
      return categoryIconMap[service.mainCategory];
    }
    const fallbackName = normalize(service.icon);
    if (fallbackName && iconRegistry[fallbackName]) {
      return iconRegistry[fallbackName];
    }
    return Palette;
  };

  // Fetch services from backend
  const { data: backendServices = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
    retry: 3,
    retryDelay: 1000,
  });

  // Fetch categories to get proper labels
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  // Create a map of category values to their labels
  const categoryLabelsMap = useMemo(() => {
    const map: Record<string, { labelAr: string; labelEn: string }> = {};
    if (categoriesData?.main) {
      for (const cat of categoriesData.main) {
        map[cat.value] = { labelAr: cat.labelAr, labelEn: cat.labelEn };
        if (cat.subcategories) {
          for (const sub of cat.subcategories) {
            map[sub.value] = { labelAr: sub.labelAr, labelEn: sub.labelEn };
          }
        }
      }
    }
    return map;
  }, [categoriesData]);

  const initialVisible = 4;
  const expandedVisible = 8;
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const prioritizedServices = useMemo(() => {
    // Sort services to show featured ones first, then regular ones
    const featured = backendServices.filter(service => service.isFeatured);
    const regular = backendServices.filter(service => !service.isFeatured);
    
    // Randomize regular services for variety
    for (let i = regular.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [regular[i], regular[j]] = [regular[j], regular[i]];
    }
    
    return [...featured, ...regular];
  }, [backendServices]);

  useEffect(() => {
    setVisibleCount((prev) => {
      if (prioritizedServices.length === 0) return 0;
      if (prev === 0 || prev > prioritizedServices.length) {
        return Math.min(initialVisible, prioritizedServices.length);
      }
      return Math.min(prev, Math.min(expandedVisible, prioritizedServices.length));
    });
  }, [prioritizedServices.length]);

  const visibleServices = prioritizedServices.slice(0, visibleCount || 0);
  const showSkeleton = isLoading && backendServices.length === 0;
  const noServices = !isLoading && backendServices.length === 0;
  const showMoreVisible =
    prioritizedServices.length > initialVisible && visibleCount < Math.min(expandedVisible, prioritizedServices.length);
  const showLessVisible = prioritizedServices.length > initialVisible && visibleCount > initialVisible;

  // Helper function to get category label based on language
  const getCategoryLabel = (categoryValue: string) => {
    const category = categoryLabelsMap[categoryValue];
    if (category) {
      return isArabic ? category.labelAr : category.labelEn;
    }
    return categoryValue;
  };

  return (
    <section className="py-24 lg:py-40 relative overflow-hidden">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-background to-accent/3" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-primary/3 to-accent/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t('servicesTitle')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </motion.div>

        {showSkeleton ? (
          <div className="space-y-6">
            <ServicesGridSkeleton />
          </div>
        ) : noServices ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-border/60 bg-card/80 backdrop-blur-sm p-12 text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-md" />
            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-tr from-accent/20 to-transparent rounded-full blur-sm" />
            
            <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary border border-primary/30 shadow-lg">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold relative">
              {isArabic ? 'لا توجد خدمات مضافة حالياً' : 'No services added yet'}
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg leading-relaxed relative">
              {isArabic
                ? 'ترقب تحديثات جديدة قريباً أو تواصل معي لطلب خدمة مخصصة.'
                : 'Stay tuned for new services soon or reach out for a custom request.'}
            </p>
          </motion.div>
        ) : (
          <>
          {/* Professional Service Cards Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-8 lg:gap-10 relative ">
            {/* Enhanced Background Elements */}
            <div className="absolute -top-16 -left-16 w-64 h-64 bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-gradient-to-tl from-accent/8 to-transparent rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-2xl" />

            {visibleServices.map((service, index) => {
              const Icon = getCategoryIcon(service);
              const title =
                (isArabic ? service.titleAr : service.titleEn) ||
                service.titleEn ||
                service.titleAr ||
                t(service.titleKey);
              const mainCategoryLabel = service.mainCategory ? getCategoryLabel(service.mainCategory) : '';
              const subCategoryLabel = service.subCategory ? getCategoryLabel(service.subCategory) : '';
              const description = (isArabic ? service.descriptionAr : service.descriptionEn) || '';

              return (
                <motion.div
                  key={service.id || service.titleKey}
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6, ease: "easeOut" }}
                  className="group relative cursor-pointer"
                >
                  {/* Professional Service Card */}
                  <div className="relative h-[380px] rounded-3xl overflow-hidden transition-all duration-700 transform hover:-translate-y-3 hover:scale-[1.02] bg-gradient-to-br from-card via-card/95 to-muted/20 border border-border/40 hover:border-primary/50 border-primary/10 shadow-2xl hover:shadow-3xl hover:shadow-primary/20 backdrop-blur-xl">
                    
                    {/* Dynamic Background with Multiple Layers */}
                    <div className="absolute inset-0">
                      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/15 via-primary/8 to-transparent" />
                      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-card/80 via-card/50 to-transparent" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent" />
                      {/* Subtle service icon watermark */}
                      <div className="absolute -bottom-2 -right-2 opacity-5 rotate-12">
                        <Icon className="w-32 h-32 text-primary/90 blur-sm" />
                      </div>
                    </div>

                    {/* Floating Decorative Elements */}
                    <div className="absolute top-4 right-20 w-32 h-32 bg-gradient-to-br from-primary/15 to-transparent rounded-full blur-lg group-hover:scale-150 transition-transform duration-700" />

                    <div className="relative h-full flex flex-col p-8">
                      
                      {/* Professional Icon Section */}
                      <div className="relative flex justify-center mb-6">
                        <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-700 bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 border border-primary/30 group-hover:border-primary/50">
                          <Icon className="w-8 h-8 text-primary relative z-10" />
                          
                          {/* Enhanced Glow Effects */}
                          <div className="absolute inset-0 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500 bg-gradient-to-br from-primary/50 to-primary/20" />
                          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 flex flex-col justify-center text-center space-y-4">
                        
                        {/* Title with Enhanced Typography */}
                        <div className="space-y-2">
                          <h3 className="text-lg font-bold leading-tight text-foreground group-hover:text-primary transition-all duration-500 transform group-hover:scale-105">
                            {title}
                          </h3>
                          
                          {description && (
                            <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-foreground/80 transition-colors duration-300 max-w-xs mx-auto">
                              {description}
                            </p>
                          )}
                        </div>

                        {/* Enhanced Category Tags */}
                        <div className="flex flex-wrap justify-center gap-2 mt-auto">
                          {mainCategoryLabel && (
                            <span
                              title={mainCategoryLabel}
                              className="inline-flex items-center justify-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase transition-all duration-300 bg-gradient-to-r from-primary/15 to-primary/10 border border-primary/40 text-primary hover:from-primary/25 hover:to-primary/20 hover:border-primary/60 hover:text-primary hover:shadow-lg hover:shadow-primary/20 max-w-[190px] min-w-0"
                            >
                              <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                              <span className="truncate">{mainCategoryLabel}</span>
                            </span>
                          )}
                          {subCategoryLabel && (
                            <span
                              title={subCategoryLabel}
                              className="inline-flex items-center justify-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase transition-all duration-300 bg-muted/50 border border-border/60 text-muted-foreground hover:bg-muted/70 hover:border-border/80 hover:text-foreground/90 max-w-[190px] min-w-0"
                            >
                              <span className="truncate">{subCategoryLabel}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Professional Bottom Accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary/60 via-primary to-primary/60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 rounded-b-3xl" />
                      
                      {/* Additional Bottom Glow */}
                      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 delay-200" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
          
          {/* Professional Control Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 flex flex-wrap items-center justify-center gap-4"
          >
            {showMoreVisible && (
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  setVisibleCount((prev) =>
                    Math.min(prev + 4, Math.min(expandedVisible, prioritizedServices.length)),
                  )
                }
                className="group relative overflow-hidden border-2 border-primary/30 hover:border-primary/50 bg-card/80 hover:bg-primary/10 transition-all duration-500 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2 font-semibold text-white">
                  {isArabic ? 'عرض المزيد' : 'Show more'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            )}
            
            {showLessVisible && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setVisibleCount(initialVisible)}
                className="group relative overflow-hidden border-2 border-border/50 hover:border-primary/40 bg-card/80 hover:bg-primary/5 transition-all duration-500 transform hover:scale-105"
              >
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                  <ArrowLeft className="w-5 h-5" />
                  {isArabic ? 'عرض أقل' : 'Show less'}
                </span>
              </Button>
            )}
            
            <Link to="/services">
              <Button
                size="lg"
                className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-accent hover:from-primary/90 hover:via-primary hover:to-primary/80 text-white border-2 border-transparent hover:border-white/20 transition-all duration-500 transform hover:scale-105 shadow-2xl hover:shadow-primary/40"
              >
                <span className="relative z-10 flex items-center gap-3 text-black">
                  {isArabic ? 'عرض كافة الخدمات' : 'View all services'}
                  {isArabic ? (
                    <ArrowLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  ) : (
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Button>
            </Link>
          </motion.div>
          </>
        )}
      </div>
    </section>
  );
};
