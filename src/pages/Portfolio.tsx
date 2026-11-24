import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProjectCard } from '@/components/ProjectCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter, ChevronDown, Grid3x3, Palette, Code, Rocket, Briefcase, Sparkles, Shield, Lock, Star, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { compareProjects } from '@/lib/projectSort';
import { ProjectsGridSkeleton } from '@/components/LoadingPlaceholders';

export default function Portfolio() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDesignType, setSelectedDesignType] = useState<string>('all');
  const loadingLabel = isArabic ? 'جاري التحميل ...' : 'Loading projects...';

  // Translation function for categories
  const getCategoryName = (category: string) => {
    if (category === 'all') return isArabic ? 'الكل' : 'All';
    
    const translations: Record<string, { ar: string; en: string }> = {
      'design': { ar: 'التصميم', en: 'Design' },
      'programming': { ar: 'البرمجة', en: 'Programming' },
      'design-programming': { ar: 'تصميم وبرمجة', en: 'Design & Programming' },
      'development': { ar: 'التطوير', en: 'Development' },
      'content': { ar: 'المحتوى', en: 'Content' },
      'marketing': { ar: 'التسويق', en: 'Marketing' },
      'other': { ar: 'أخرى', en: 'Other' },
    };
    
    return translations[category]?.[isArabic ? 'ar' : 'en'] || category;
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      'design': Palette,
      'programming': Code,
      'design-programming': Sparkles,
      'development': Rocket,
      'marketing': Briefcase,
      'content': Grid3x3,
      'other': Filter,
    };
    return icons[category] || Grid3x3;
  };

  const { data: projects = [], isLoading: projectsLoading, error: projectsError, refetch: refetchProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    retry: 3,
    retryDelay: 1000,
  });

  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  // Filter to main categories only (no parentId) and only those with projects
  const allMainCategories = (categoriesData as any)?.main?.filter((cat: any) => !cat.parentId) || [];
  const mainCategories = allMainCategories.filter(cat =>
    cat.value === 'all' || projects.some(p => p.mainCategory === cat.value)
  );

  const isLoading = projectsLoading || categoriesLoading;
  const error = projectsError || categoriesError;
  const refetch = () => {
    refetchProjects();
  };
  
  // Subcategories for the currently selected main category (if any)
  const selectedMainCategory = mainCategories.find(cat => cat.id === selectedCategory);
  const selectedSubcategories = selectedMainCategory?.subcategories || [];
  const usedSubs = selectedMainCategory
    ? Array.from(
        new Set(
          projects
            .filter((p) => p.mainCategory === selectedMainCategory.value)
            .map((p) => p.designType)
            .filter(Boolean) as string[],
        ),
      )
    : [];
  const filteredSubcategories = selectedSubcategories.filter((sub: any) =>
    usedSubs.includes(sub.value),
  );

  const getSubcategoryLabel = (value: string) => {
    const sub = selectedSubcategories.find((s: any) => s.value === value);
    if (!sub) return value;
    return isArabic ? sub.labelAr : sub.labelEn;
  };

  const sortedProjects = useMemo(() => [...projects].sort(compareProjects), [projects]);

  const filteredProjects = useMemo(() => {
    const list = sortedProjects.filter((project) => {
      if (selectedCategory !== 'all') {
        const selectedCat = mainCategories.find(cat => cat.id === selectedCategory);
        if (!selectedCat || project.mainCategory !== selectedCat.value) return false;
      }
      if (selectedMainCategory && filteredSubcategories.length > 0 && selectedDesignType !== 'all' && project.designType !== selectedDesignType) return false;
      return true;
    });
    if (selectedCategory !== 'all') return list;

    // When "all" is selected: pick one per main category first, then the rest (all already sorted)
    const seen = new Set<string>();
    const primary: any[] = [];
    const rest: any[] = [];
    list.forEach((p) => {
      if (!seen.has(p.mainCategory)) {
        primary.push(p);
        seen.add(p.mainCategory);
      } else {
        rest.push(p);
      }
    });
    return [...primary, ...rest];
  }, [sortedProjects, selectedCategory, selectedMainCategory, filteredSubcategories, selectedDesignType, mainCategories]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16 space-y-6"
          >
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                {t('portfolio')}
              </h1>
              <div className="mx-auto h-1 w-20 rounded-full bg-gradient-to-r from-primary via-primary/60 to-primary/30" />
            </div>
            <div className="max-w-4xl mx-auto space-y-4">
              <p className="text-lg text-muted-foreground">
                {t('featuredWorkDesc')}
              </p>
              {/* Enhanced Info Section */}
              <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 opacity-40" />
                <div className="relative rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-sm shadow-xl shadow-primary/10 p-6 space-y-6">
                  
                  {/* Top badges */}
                  <div className="flex flex-wrap justify-center gap-3">
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-sm"
                    >
                      <Award className="w-4 h-4" />
                      {isArabic ? 'منذ 2010' : 'Since 2010'}
                    </motion.span>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary/15 via-cyan-500/15 to-primary/10 text-primary border border-primary/30 shadow-sm"
                    >
                      <Shield className="w-4 h-4" />
                      {isArabic ? 'سرية العملاء' : 'Client confidentiality'}
                    </motion.span>
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-background/80 to-background/60 text-foreground border border-border/60 shadow-sm"
                    >
                      <Star className="w-4 h-4" />
                      {isArabic ? 'أعمال مختارة' : 'Selected works'}
                    </motion.span>
                  </div>

                  {/* Info grid */}
                  <div className="grid md:grid-cols-2 gap-6 text-sm">
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10"
                    >
                      <div className="w-16 h-11 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center border border-primary/30 shadow-sm">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-primary">{isArabic ? 'موثّق بعناية' : 'Carefully documented'}</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {isArabic
                            ? 'أعرض الأعمال المسموح بنشرها فقط مع الحفاظ على خصوصية المشاريع الحساسة.'
                            : 'Only publicly shareable work is shown; sensitive projects stay private.'}
                        </p>
                      </div>
                    </motion.div>
                    
                    <motion.div 
                      whileHover={{ y: -2 }}
                      className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10"
                    >
                      <div className="w-16 h-11 rounded-2xl bg-gradient-to-br from-primary/25 to-primary/10 flex items-center justify-center border border-primary/30 shadow-sm">
                        <Lock className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-primary">{isArabic ? 'جودة على المدى الطويل' : 'Long-term quality'}</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {isArabic
                            ? 'أحتفظ ببعض الأعمال القديمة لضمان أن المعروض يعكس مستوى الجودة الحالي.'
                            : 'Some older work is kept off-site to keep the gallery aligned with current quality.'}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Enhanced Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-16"
          >
            {/* Main Filter Card */}
            <div className="relative overflow-hidden rounded-3xl">
              {/* Background Gradient */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-background to-primary/10 opacity-60 pointer-events-none" />
              <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,.05)_50%,transparent_75%)] bg-[length:20px_20px] pointer-events-none" />
              
              {/* Filter Container */}
              <div className="relative rounded-3xl border border-primary/25 bg-card/30 backdrop-blur-xl shadow-2xl shadow-primary/10 p-8 lg:p-12">
                
                {/* Header Section */}
                <div className="flex items-start justify-between mb-10">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                        <Filter className="w-6 h-6 text-primary" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-primary to-primary/70 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                        {isArabic ? 'تصفح أعمالي' : 'Explore My Work'}
                      </h3>
                    </div>
                  </div>
                  
	                  <div className="flex items-center gap-3">
	                    {selectedCategory !== 'all' && (
	                      <motion.button
	                        initial={{ opacity: 0, scale: 0.9 }}
	                        animate={{ opacity: 1, scale: 1 }}
	                        whileHover={{ scale: 1.02 }}
	                        whileTap={{ scale: 0.98 }}
	                        onClick={() => {
	                          setSelectedCategory('all');
	                          setSelectedDesignType('all');
	                        }}
	                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 px-3 py-2 text-primary hover:from-primary/20 hover:to-primary/15 transition-all duration-300 border border-primary/20 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
	                      >
	                        <span className="hidden sm:inline">
	                          {isArabic ? 'مسح جميع الفلاتر' : 'Clear All Filters'}
	                        </span>
	                        <span className="sm:hidden">
	                          {isArabic ? 'مسح الفلاتر' : 'Clear'}
	                        </span>
	                        <motion.div
	                          className="w-1 h-1 bg-primary rounded-full"
	                          animate={{ scale: [1, 1.5, 1] }}
	                          transition={{ duration: 2, repeat: Infinity }}
	                        />
	                      </motion.button>
	                    )}

	                    {/* Quick Stats */}
	                    <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-background/50 border border-border/50 backdrop-blur-sm">
	                      <div className="flex items-center gap-2 text-sm">
	                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
	                        <span className="text-muted-foreground">
	                          {isArabic ? 'الأعمال المعروضة' : 'Results shown'}
	                        </span>
	                      </div>
	                      <div className="w-px h-4 bg-border" />
	                      <span className="text-sm font-medium">{filteredProjects.length}</span>
	                    </div>
	                  </div>
	                </div>

	                {/* Main Categories */}
	                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gradient-to-r from-border via-primary/30 to-transparent" />
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
                      {isArabic ? 'الفئات الرئيسية' : 'Main Categories'}
                    </h4>
                    <div className="flex-1 h-px bg-gradient-to-l from-border via-primary/30 to-transparent" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {/* All Category */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key="all"
                      onClick={() => {
                        setSelectedCategory('all');
                        setSelectedDesignType('all');
                      }}
                      className={`group relative overflow-hidden rounded-xl px-5 py-3 text-center transition-all duration-300 border flex items-center gap-2 ${
                        selectedCategory === 'all'
                          ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-xl shadow-primary/30'
                          : 'bg-gradient-to-br from-background/50 to-background/20 border-border hover:border-primary/50 text-foreground hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                        selectedCategory === 'all'
                          ? 'bg-white/20'
                          : 'bg-primary/10 group-hover:bg-primary/20'
                      }`}>
                        <Grid3x3 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-semibold leading-tight">{getCategoryName('all')}</span>
                      {selectedCategory === 'all' && (
                        <motion.div
                          className="absolute inset-0 bg-white/10"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        />
                      )}
                    </motion.button>

                    {/* Category Buttons */}
                    {mainCategories.map((category) => {
                      const CategoryIcon = getCategoryIcon(category.value);
                      const isSelected = selectedCategory === category.id;
                      
                      return (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSelectedDesignType('all');
                          }}
                          className={`group relative overflow-hidden rounded-xl px-5 py-3 text-center transition-all duration-300 border flex items-center gap-2 ${
                            isSelected
                              ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-primary shadow-xl shadow-primary/30'
                              : 'bg-gradient-to-br from-background/50 to-background/20 border-border hover:border-primary/50 text-foreground hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            isSelected
                              ? 'bg-white/20'
                              : 'bg-primary/10 group-hover:bg-primary/20'
                          }`}>
                            <CategoryIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm font-semibold leading-tight">
                            {isArabic ? category.labelAr : category.labelEn}
                          </span>
                          {isSelected && (
                            <motion.div
                              className="absolute inset-0 bg-white/10"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.1 }}
                            />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-categories */}
                {selectedMainCategory && filteredSubcategories.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6 mt-8"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-gradient-to-r from-border via-primary/30 to-transparent" />
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-3">
                        {isArabic ? 'التصنيفات الفرعية' : 'Subcategories'}
                      </h4>
                      <div className="flex-1 h-px bg-gradient-to-l from-border via-primary/30 to-transparent" />
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        key="all-designs"
                        onClick={() => setSelectedDesignType('all')}
                        className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                          selectedDesignType === 'all'
                            ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/50 shadow-lg shadow-primary/20'
                            : 'bg-gradient-to-r from-background/50 to-background/30 border-border text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary/30'
                        }`}
                      >
                        {isArabic ? 'الكل' : 'All'}
                      </motion.button>
                      {filteredSubcategories.map((sub: any) => (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          key={sub.value}
                          onClick={() => setSelectedDesignType(sub.value)}
                          className={`px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                            selectedDesignType === sub.value
                              ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border-primary/50 shadow-lg shadow-primary/20'
                              : 'bg-gradient-to-r from-background/50 to-background/30 border-border text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 hover:text-primary hover:border-primary/30'
                          }`}
                        >
                          {getSubcategoryLabel(sub.value)}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Projects Grid */}
          {isLoading && projects.length === 0 ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-sm text-muted-foreground">
                  {loadingLabel}
                </span>
              </div>
              <ProjectsGridSkeleton />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  activeMainCategory={selectedMainCategory?.value || 'all'}
                />
              ))}
            </div>
          )}

          {!isLoading && filteredProjects.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-muted-foreground"
            >
              <p className="text-xl">{t('noProjects')}</p>
              <Button className="mt-4" variant="outline" onClick={() => refetch()}>
                {t('refresh')}
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
