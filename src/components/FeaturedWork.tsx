import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DirectionalArrow } from '@/components/ui/directional-arrow';
import { api } from '@/lib/api';
import { FeaturedProjectsSkeleton } from './LoadingPlaceholders';
import { compareProjects } from '@/lib/projectSort';
import { ProjectCard } from './ProjectCard';

export const FeaturedWork = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [showAll, setShowAll] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: allProjects = [], isLoading } = useQuery({
    queryKey: ['projects', 'featured-section'],
    queryFn: () => api.getProjects(),
    retry: 2,
    retryDelay: 800,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const mainCategories = (categoriesData as any)?.main || [];
  const availableCategories = useMemo(
    () =>
      mainCategories.filter(
        (cat: any) =>
          cat.value === 'all' ||
          allProjects.some((p: any) => p.mainCategory === cat.value),
      ),
    [mainCategories, allProjects],
  );

  const categoryOptions = useMemo(() => {
    const base = [{ value: 'all', labelAr: 'الكل', labelEn: 'All' }];
    const mapped = availableCategories.map((cat: any) => ({
      value: cat.value,
      labelAr: cat.labelAr,
      labelEn: cat.labelEn,
    }));
    return base.concat(mapped);
  }, [availableCategories]);

  const sortedProjects = useMemo(() => {
    const arr = [...allProjects];
    return arr.sort(compareProjects);
  }, [allProjects]);

  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') {
      // Pick one project from each main category first, then the rest by the same ordering
      const seen = new Set<string>();
      const primary: any[] = [];
      const rest: any[] = [];
      sortedProjects.forEach((p: any) => {
        if (!seen.has(p.mainCategory)) {
          primary.push(p);
          seen.add(p.mainCategory);
        } else {
          rest.push(p);
        }
      });
      return [...primary, ...rest];
    }
    return sortedProjects.filter((p: any) => p.mainCategory === selectedCategory);
  }, [sortedProjects, selectedCategory]);

  const baseLimit = 3;
  const maxLimit = 6;
  const currentLimit = showAll ? Math.min(maxLimit, filteredProjects.length) : baseLimit;
  const projects = filteredProjects.slice(0, currentLimit);

  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            {t('featuredWork')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('featuredWorkDesc')}
          </p>
        </motion.div>

        {isLoading && filteredProjects.length === 0 ? (
          <div className="space-y-6">
            <FeaturedProjectsSkeleton />
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              {categoryOptions.map((cat) => (
                <Button
                  key={cat.value}
                  size="sm"
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  onClick={() => {
                    setSelectedCategory(cat.value);
                    setShowAll(false);
                  }}
                  className={`rounded-full px-4 py-2 text-sm ${
                    selectedCategory === cat.value
                      ? 'bg-primary text-primary-foreground shadow-primary/30 shadow-lg'
                      : 'bg-background/60'
                  }`}
                  disabled={isLoading}
                >
                  {isArabic ? cat.labelAr : cat.labelEn}
                </Button>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {projects.map((project: any, index: number) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  activeMainCategory={selectedCategory}
                />
              ))}
            </div>
          </>
        )}

        {filteredProjects.length > baseLimit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button
                size="lg"
                variant="outline"
                className="glow-border glow-hover group"
                onClick={() => setShowAll(!showAll)}
                disabled={isLoading}
              >
                {showAll ? t('showLess') : t('showMore')}
                <DirectionalArrow
                  className={`ml-2 w-5 h-5 transition-transform ${
                    showAll ? '-rotate-90' : 'group-hover:translate-x-1'
                  }`}
                />
              </Button>

              <Link to="/portfolio">
                <Button size="lg" className="neon-button group">
                  {t('viewAll')}
                  <DirectionalArrow className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        )}

        {filteredProjects.length <= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link to="/portfolio">
              <Button size="lg" className="neon-button group">
                {t('viewAll')}
                <DirectionalArrow className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
};
