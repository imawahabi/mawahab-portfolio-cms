import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Folder, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Category {
  value: string;
  labelAr: string;
  labelEn: string;
  subcategories?: Array<{
    value: string;
    labelAr: string;
    labelEn: string;
  }>;
}

interface ServiceSelectorProps {
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}

export const ServiceSelector = ({ 
  value, 
  onChange, 
  placeholder, 
  className 
}: ServiceSelectorProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(value || null);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    retry: 1,
  });

  // Fallback categories
  const fallbackCategories: Category[] = [
    { 
      value: 'design', 
      labelAr: 'التصميم', 
      labelEn: 'Design',
      subcategories: [
        { value: 'web', labelAr: 'تصميم المواقع', labelEn: 'Web Design' },
        { value: 'mobile', labelAr: 'تصميم الموبايل', labelEn: 'Mobile Design' },
        { value: 'branding', labelAr: 'الهوية البصرية', labelEn: 'Branding' },
        { value: 'ui-ux', labelAr: 'تصميم واجهات المستخدم', labelEn: 'UI/UX Design' },
        { value: 'graphic', labelAr: 'التصميم الجرافيكي', labelEn: 'Graphic Design' }
      ]
    },
    { 
      value: 'development', 
      labelAr: 'التطوير', 
      labelEn: 'Development',
      subcategories: [
        { value: 'web-dev', labelAr: 'تطوير المواقع', labelEn: 'Web Development' },
        { value: 'mobile-dev', labelAr: 'تطوير الموبايل', labelEn: 'Mobile Development' },
        { value: 'backend', labelAr: 'تطوير الخوادم', labelEn: 'Backend Development' },
        { value: 'frontend', labelAr: 'تطوير الواجهات', labelEn: 'Frontend Development' },
        { value: 'fullstack', labelAr: 'تطوير شامل', labelEn: 'Full Stack Development' }
      ]
    },
    { 
      value: 'content', 
      labelAr: 'المحتوى', 
      labelEn: 'Content',
      subcategories: [
        { value: 'writing', labelAr: 'الكتابة', labelEn: 'Writing' },
        { value: 'translation', labelAr: 'الترجمة', labelEn: 'Translation' },
        { value: 'marketing', labelAr: 'التسويق الرقمي', labelEn: 'Digital Marketing' },
        { value: 'social-media', labelAr: 'إدارة السوشيال ميديا', labelEn: 'Social Media Management' },
        { value: 'seo', labelAr: 'تحسين محركات البحث', labelEn: 'SEO' }
      ]
    },
    { 
      value: 'consulting', 
      labelAr: 'الاستشارات', 
      labelEn: 'Consulting',
      subcategories: [
        { value: 'business', labelAr: 'استشارات أعمال', labelEn: 'Business Consulting' },
        { value: 'technical', labelAr: 'استشارات تقنية', labelEn: 'Technical Consulting' },
        { value: 'marketing-strategy', labelAr: 'استشارات التسويق', labelEn: 'Marketing Strategy' }
      ]
    }
  ];

  const categoriesList = categories?.main || fallbackCategories;

  const toggleCategory = (categoryValue: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryValue)) {
      newExpanded.delete(categoryValue);
    } else {
      newExpanded.add(categoryValue);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCategorySelect = (categoryValue: string, subcategoryValue?: string) => {
    const finalValue = subcategoryValue || categoryValue;
    setSelectedCategory(finalValue);
    onChange(finalValue);
  };

  const getSelectedCategoryInfo = () => {
    if (!selectedCategory) return null;

    // Find if it's a main category
    const mainCategory = categoriesList.find(cat => cat.value === selectedCategory);
    if (mainCategory) {
      return {
        ...mainCategory,
        isMain: true
      };
    }

    // Find if it's a subcategory
    for (const category of categoriesList) {
      const subcategory = category.subcategories?.find(sub => sub.value === selectedCategory);
      if (subcategory) {
        return {
          ...subcategory,
          parentCategory: isArabic ? category.labelAr : category.labelEn,
          isMain: false
        };
      }
    }

    return null;
  };

  if (isLoadingCategories) {
    return (
      <div className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm text-muted-foreground">
          {isArabic ? 'جاري تحميل التصنيفات...' : 'Loading categories...'}
        </span>
      </div>
    );
  }

  const selectedCategoryInfo = getSelectedCategoryInfo();

  return (
    <div className={cn("relative", className)}>
      {/* Selected Category Display */}
      {selectedCategoryInfo ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-primary/50 bg-primary/5"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Folder className="w-4 h-4 text-primary flex-shrink-0" />
                {!selectedCategoryInfo.isMain && (
                  <span className="text-xs font-medium text-primary/70 truncate">
                    {selectedCategoryInfo.parentCategory}
                  </span>
                )}
              </div>
              <h4 className="font-semibold text-sm truncate">
                {isArabic ? selectedCategoryInfo.labelAr : selectedCategoryInfo.labelEn}
              </h4>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null);
                onChange('');
              }}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
            >
              ×
            </button>
          </div>
        </motion.div>
      ) : (
        /* Category Selector */
        <div className="border border-border rounded-lg bg-card">
          <div className="p-3">
            <h3 className="font-medium text-sm mb-3">
              {placeholder || (isArabic ? 'اختر فئة الخدمة' : 'Select service category')}
            </h3>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categoriesList.map(category => {
                const isExpanded = expandedCategories.has(category.value);

                return (
                  <div key={category.value} className="border border-border/50 rounded-lg overflow-hidden">
                    {/* Main Category */}
                    <button
                      onClick={() => handleCategorySelect(category.value)}
                      className="w-full px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm truncate">
                          {isArabic ? category.labelAr : category.labelEn}
                        </span>
                        <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary flex-shrink-0" />
                      </div>
                    </button>

                    {/* Subcategories */}
                    {category.subcategories && category.subcategories.length > 0 && (
                      <div className="border-t border-border/30">
                        <button
                          onClick={() => toggleCategory(category.value)}
                          className="w-full px-3 py-1.5 bg-muted/20 hover:bg-muted/30 transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="text-xs text-muted-foreground">
                            {isArabic ? 'عرض التخصصات' : 'Show specializations'}
                          </span>
                          <motion.div
                            animate={{ rotate: isExpanded ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-3 h-3 text-muted-foreground" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-2 space-y-1">
                                {category.subcategories.map(subcategory => (
                                  <button
                                    key={subcategory.value}
                                    onClick={() => handleCategorySelect(category.value, subcategory.value)}
                                    className="w-full text-right px-3 py-1.5 rounded-md hover:bg-primary/10 transition-colors group"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="text-xs truncate">
                                        {isArabic ? subcategory.labelAr : subcategory.labelEn}
                                      </span>
                                      <Check className="w-3 h-3 opacity-0 group-hover:opacity-100 text-primary flex-shrink-0" />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Other Option */}
              <button
                onClick={() => handleCategorySelect('custom-other')}
                className="w-full px-3 py-2 rounded-lg border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground"
              >
                {isArabic ? 'أخرى / استشارة مخصصة' : 'Other / Custom Consultation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
