import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

type ProjectCardProject = {
  id: string;
  slug: string;
  mainCategory: string;
  designType?: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  typeLabelAr?: string;
  typeLabelEn?: string;
  typeLabel?: string;
  coverImage: string;
  year?: number | string;
  clientName?: string;
  isFeatured?: boolean;
};

interface ProjectCardProps {
  project: ProjectCardProject;
  index: number;
  activeMainCategory?: string;
}

export const ProjectCard = ({ project, index, activeMainCategory = 'all' }: ProjectCardProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });
  
  const title = isArabic ? project.titleAr : project.titleEn;
  const description = isArabic ? project.shortDescAr : project.shortDescEn;
  
  // Get category info using the same logic as ProjectDetail
  const getCategoryInfo = (categoryValue: string, subcategoryValue?: string) => {
    if (!categoriesData?.main) return { name: t(categoryValue), subcategory: '' };
    
    const mainCategory = categoriesData.main.find((cat: any) => cat.value === categoryValue);
    if (!mainCategory) return { name: t(categoryValue), subcategory: '' };
    
    const mainName = isArabic ? mainCategory.labelAr : mainCategory.labelEn;
    
    if (!subcategoryValue) return { name: mainName, subcategory: '' };
    
    const subcategory = mainCategory.subcategories?.find((sub: any) => sub.value === subcategoryValue);
    const subcategoryName = subcategory ? (isArabic ? subcategory.labelAr : subcategory.labelEn) : subcategoryValue;
    
    return { name: mainName, subcategory: subcategoryName };
  };
  
  const categoryInfo = getCategoryInfo(project.mainCategory, project.designType);
  const showSubAsPrimary =
    activeMainCategory !== 'all' &&
    project.mainCategory === activeMainCategory &&
    Boolean(categoryInfo.subcategory);
  const prefix = isArabic
    ? project.typeLabelAr || project.typeLabel || project.typeLabelEn
    : project.typeLabelEn || project.typeLabel || project.typeLabelAr;
  const primaryBadgeLabel = showSubAsPrimary ? categoryInfo.subcategory : categoryInfo.name;
  const secondaryBadgeLabel = showSubAsPrimary ? categoryInfo.name : categoryInfo.subcategory;

  return (
    <Link to={`/portfolio/${project.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.15 }}
        className="group relative overflow-hidden rounded-2xl bg-card border border-primary/20 hover:border-primary/60 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 cursor-pointer h-full flex flex-col"
      >
        {/* Creative background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-16 translate-x-16" />

        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted rounded-t-2xl">
          <img
            src={project.coverImage}
            alt={title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-[0.5deg] group-hover:brightness-[1.05]"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_30%)]" />

          {/* Year badge on image */}
          {project.year && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-primary/80 text-white border border-white/15 font-semibold text-[11px] shadow-lg backdrop-blur transition-all duration-700 ease-out group-hover:scale-125 group-hover:-translate-y-1 group-hover:shadow-[0_15px_35px_rgba(59,130,246,0.35)]">
                {project.year}
              </Badge>
            </div>
          )}

          {/* Creative arrow indicator */}
          <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 shadow-xl">
            <ArrowUpRight className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="relative p-4 sm:p-6 flex flex-col flex-grow">
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold transition-all duration-500 leading-tight line-clamp-2">
                <div className="flex items-center gap-3 flex-wrap">
                  {prefix && (
                    <Badge className="pointer-events-none inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white border border-slate-500/40 shadow-xl shadow-[0_12px_30px_rgba(15,23,42,0.55)] backdrop-blur-md relative overflow-hidden">
                      <div className="w-2 h-2 bg-sky-300 rounded-full shadow-sm animate-pulse" />
                      <span className="font-semibold tracking-wide text-white">
                        {prefix}
                      </span>
                    </Badge>
                  )}
                  <span
                    className={`inline-block transition-transform transition-colors duration-500 group-hover:text-primary group-hover:scale-[1.02] ${
                      isArabic ? 'origin-right' : 'origin-left'
                    }`}
                  >
                    {title}
                  </span>
                </div>
              </h3>
              <div className="w-12 h-1 bg-primary/30 rounded-full group-hover:bg-primary/60 transition-colors duration-300" />
            </div>

            <p className="text-muted-foreground line-clamp-2 leading-relaxed text-sm group-hover:text-foreground/80 transition-colors">
              {description}
            </p>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              {secondaryBadgeLabel && (
                <Badge className="text-xs font-medium bg-slate-900/80 text-white border border-white/10 backdrop-blur px-3 py-1">
                  {secondaryBadgeLabel}
                </Badge>
              )}
            </div>

            {project.clientName && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground block">{t('client')}</span>
                <span className="text-sm font-semibold text-foreground">{project.clientName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary/50 to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ${isArabic ? 'origin-right' : 'origin-left'}`} />
      </motion.div>
    </Link>
  );
};
