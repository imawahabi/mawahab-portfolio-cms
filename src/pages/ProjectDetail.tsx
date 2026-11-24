import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Lightbox } from '@/components/Lightbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ExternalLink, Calendar, User, Briefcase, Code, Tag } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProjectDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isSticky, setIsSticky] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data: project, isLoading, isError } = useQuery({
    queryKey: ['project', slug],
    enabled: Boolean(slug),
    queryFn: () => api.getProjectBySlug(slug || ''),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const getCategoryInfo = (categoryValue: string, subcategoryValue?: string) => {
    if (!categoriesData?.main) return { name: t(categoryValue), subcategory: subcategoryValue ? t(subcategoryValue) : '' };
    
    const mainCategory = categoriesData.main.find((cat: any) => cat.value === categoryValue);
    if (!mainCategory) return { name: t(categoryValue), subcategory: subcategoryValue ? t(subcategoryValue) : '' };
    
    const mainName = isArabic ? mainCategory.labelAr : mainCategory.labelEn;
    
    if (!subcategoryValue) return { name: mainName, subcategory: '' };
    
    const subcategory = mainCategory.subcategories?.find((sub: any) => sub.value === subcategoryValue);
    const subcategoryName = subcategory ? (isArabic ? subcategory.labelAr : subcategory.labelEn) : t(subcategoryValue);
    
    return { name: mainName, subcategory: subcategoryName };
  };

  const title = project ? (isArabic ? project.titleAr : project.titleEn) : '';
  const shortDescription = project ? (isArabic ? project.shortDescAr : project.shortDescEn) : '';
  const description = project ? (isArabic ? project.longDescAr : project.longDescEn) : '';
  
  // Get category info from API
  const categoryInfo = project ? getCategoryInfo(project.mainCategory, project.designType) : { name: '', subcategory: '' };
  
  // Get technologies and tags
  const technologies = project ? (isArabic ? project.technologiesAr || [] : project.technologiesEn || []) : [];
  const tags = project ? (isArabic ? project.tagsAr || [] : project.tagsEn || []) : [];

  useLayoutEffect(() => {
    if (!slug) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [slug]);

  useEffect(() => {
    if (isLoading) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [isLoading, slug]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSticky(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
        // أضف هامش موجب لتأخير تفعيل الستيكي بعد تمرير أكبر
        rootMargin: '500px 0px 0px 0px',
      },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const showNotFound = !isLoading && (isError || !project);

  const loadingSkeleton = (
    <>
      <div className="relative h-[40vh] sm:h-[50vh] min-h-[280px] bg-gradient-to-br from-muted/20 to-muted/5 animate-pulse" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6">
        <div className="h-10 w-40 bg-muted/60 rounded-lg animate-pulse" />
        <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-32 sm:h-40 bg-muted/40 rounded-xl animate-pulse" />
            <div className="h-48 sm:h-56 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-64 sm:h-72 bg-muted/30 rounded-xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-60 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-48 bg-muted/30 rounded-xl animate-pulse" />
            <div className="h-36 bg-muted/30 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-10 overflow-x-hidden">
        <div ref={sentinelRef} className="h-px w-full" aria-hidden />
        {isLoading && loadingSkeleton}
        {showNotFound && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">{t('projectNotFound')}</h1>
              <Link to="/portfolio">
                <Button>{t('backToPortfolio')}</Button>
              </Link>
            </div>
          </div>
        )}
        {!isLoading && project && !showNotFound && (
        <>
        {/* Hero Section */}
        <div className="relative h-[50vh] sm:h-[60vh] min-h-[350px] sm:min-h-[400px] overflow-hidden">
          <motion.img
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1 }}
            src={project.coverImage}
            alt={title}
            className="w-full h-full object-cover brightness-80 hover:brightness-100 transition-all duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/20 text-primary border-primary/50">
                    {categoryInfo.name}
                  </Badge>
                  {project.designType && (
                    <Badge variant="secondary">
                      {categoryInfo.subcategory}
                    </Badge>
                  )}
                </div>
                
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  {title}
                </h1>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Back + View Project Buttons - Mobile sticky; Desktop static */}
          <div className={`mb-8 ${isArabic ? 'text-right' : 'text-left'}`}>
            {/* Mobile sticky */}
            <div
              className={`sm:hidden w-full pointer-events-none ${
                isSticky ? 'fixed inset-x-0 px-4 top-[72px] z-40' : 'relative'
              }`}
            >
              <div
                className={`pointer-events-auto max-w-5xl mx-auto flex flex-wrap items-center gap-3 ${
                  isArabic ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Link to="/portfolio" className="flex-1 min-w-[160px]">
                  <Button
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium w-full shadow-sm border border-white/10 bg-black/40 backdrop-blur-lg text-white hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {isArabic ? (
                      <>
                        {isArabic ? 'العودة إلى أعمالي' : 'Back to My Works'}
                        <ArrowLeft className="w-4 h-4 mr-2" />
                      </>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {isArabic ? 'العودة إلى أعمالي' : 'Back to My Works'}
                      </>
                    )}
                  </Button>
                </Link>
                {project.externalUrl && (
                  <a
                    href={project.externalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[160px]"
                  >
                    <Button
                      className="group relative w-full overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold text-foreground bg-background/70 border border-foreground/10 shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <span className="relative flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-primary-foreground">
                        {isArabic ? (
                          <>
                            {t('viewProject')}
                            <ExternalLink className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            {t('viewProject')}
                            <ExternalLink className="w-4 h-4" />
                          </>
                        )}
                      </span>
                    </Button>
                  </a>
                )}
              </div>
            </div>
            {/* Desktop/Tablet static */}
            <div
              className={`hidden sm:flex w-full items-center gap-3 ${
                isArabic ? 'flex-row-reverse' : 'flex-row'
              } ${project.externalUrl ? 'justify-between' : ''}`}
            >
              <Link to="/portfolio" className="block">
                <Button
                  variant="outline"
                  className="px-4 py-2 text-sm font-medium shadow-sm border border-white/10 bg-black/40 backdrop-blur-lg text-white hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {isArabic ? (
                    <>
                      {isArabic ? 'العودة إلى أعمالي' : 'Back to My Works'}
                      <ArrowLeft className="w-4 h-4 mr-2" />
                    </>
                  ) : (
                    <>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      {isArabic ? 'العودة إلى أعمالي' : 'Back to My Works'}
                    </>
                  )}
                </Button>
              </Link>
              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="group relative overflow-hidden rounded-lg px-6 py-2.5 text-sm font-semibold text-foreground bg-background/70 border border-foreground/10 shadow-lg shadow-black/10 backdrop-blur-md transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative flex items-center justify-center gap-2 transition-colors duration-300 group-hover:text-primary-foreground">
                      {isArabic ? (
                        <>
                          {t('viewProject')}
                          <ExternalLink className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          {t('viewProject')}
                          <ExternalLink className="w-4 h-4" />
                        </>
                      )}
                    </span>
                  </Button>
                </a>
              )}
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-12 xl:gap-16">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Short Description */}
              {shortDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-6 lg:p-8 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/5 border border-primary/30 space-y-3 backdrop-blur-sm hover:border-primary/50 transition-colors duration-300"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                    <span className="w-1 h-5 sm:h-6 bg-primary rounded-full"></span>
                    {isArabic ? 'نبذة مختصرة' : 'Overview'}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {shortDescription}
                  </p>
                </motion.div>
              )}

              {/* Full Description */}
              {description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <span className="w-1 h-8 bg-primary rounded-full"></span>
                    {isArabic ? 'التفاصيل الكاملة' : 'Full Description'}
                  </h2>
                  <div className="p-4 sm:p-6 lg:p-8 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm">
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Gallery with Lightbox */}
              {project.images.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="text-3xl font-bold flex items-center gap-3">
                    <span className="w-1 h-8 bg-primary rounded-full"></span>
                    {t('gallery') || 'Gallery'}
                  </h2>
                  <div className="p-4 sm:p-6 rounded-xl bg-card/30 border border-border/50 backdrop-blur-sm">
                    <Lightbox images={project.images} isArabic={isArabic} />
                  </div>
                </motion.div>
              )}


            </div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Project Details Card */}
              <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-br from-card/80 via-card/50 to-background/30 glow-border border space-y-6 backdrop-blur-sm">
                <h3 className="text-xl font-bold flex items-center gap-3">
                  <span className="w-1 h-6 bg-primary rounded-full"></span>
                  {t('projectDetailsTitle')}
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                    <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('year')}</p>
                      <p className="font-bold text-base truncate">{project.year}</p>
                    </div>
                  </div>

                  {project.clientName && (
                    <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                      <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('client')}</p>
                        <p className="font-bold text-base truncate">{project.clientName}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                    <Briefcase className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('category')}</p>
                      <p className="font-bold text-base truncate">{categoryInfo.name}</p>
                      {project.designType && (
                        <p className="text-xs text-primary/80 font-medium truncate">{categoryInfo.subcategory}</p>
                      )}
                    </div>
                  </div>

                  {project.role && (
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{t('role')}</p>
                        <p className="font-bold text-base truncate">{t(project.role) || project.role}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technologies and Tags Card */}
              {(technologies.length > 0 || tags.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="p-6 rounded-xl bg-gradient-to-br from-card/80 via-card/50 to-background/30 glow-border border space-y-6 backdrop-blur-sm"
                >
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <span className="w-1 h-6 bg-primary rounded-full"></span>
                    {isArabic ? 'التقنيات والعلامات' : 'Technologies & Tags'}
                  </h3>
                  
                  {/* Technologies Section */}
                  {technologies.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        {isArabic ? 'التقنيات' : 'Technologies'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {technologies.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-medium px-2.5 py-1 bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 transition-colors">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags Section */}
                  {tags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-primary/80 uppercase tracking-wider flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {isArabic ? 'العلامات' : 'Tags'}
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs font-medium px-2.5 py-1 hover:bg-accent hover:text-accent-foreground transition-colors">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Like This Project Card */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10 border border-primary/40 p-6 text-center space-y-5 backdrop-blur-sm">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/20 rounded-full -translate-y-10 translate-x-10 blur-lg" />
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-accent/15 rounded-full translate-y-8 -translate-x-8 blur-lg" />

                <div className="relative space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-primary/40 to-primary/20 flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">{t('likeThisProject')}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {t('likeThisProjectDesc')}
                    </p>
                  </div>

                  <Link to="/contact" className="block">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 w-full py-2.5 font-semibold text-sm">
                      {t('letsWorkTogether')}
                    </Button>
                  </Link>
                </div>
              </div>

              {project.externalUrl && (
                <a
                  href={project.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button className="group relative w-full overflow-hidden rounded-xl border border-primary/30 bg-background/70 px-6 py-8 text-sm font-semibold text-primary shadow-lg shadow-primary/10 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/10 hover:shadow-xl hover:shadow-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative flex items-center justify-center gap-2 font-black">
                      {t('viewProject')}
                      <ExternalLink className="w-4 h-4" />
                    </span>
                  </Button>
                </a>
              )}
            </motion.div>
          </div>
        </div>
        </>
        )}
      </main>

      <Footer />
    </div>
  );
}
