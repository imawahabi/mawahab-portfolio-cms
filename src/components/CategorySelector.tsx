import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronDown, Folder, Check, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Category {
  value: string;
  labelAr: string;
  labelEn: string;
}

interface CategorySelectorProps {
  name?: string;
  value?: string;
  onChange: (categoryId: string) => void;
  placeholder?: string;
  className?: string;
}

export const CategorySelector = ({ 
  name,
  value, 
  onChange, 
  placeholder, 
  className 
}: CategorySelectorProps) => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(value || null);

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    retry: 1,
  });

  // Fallback categories
  const fallbackCategories: Category[] = [
    { value: 'design', labelAr: 'التصميم', labelEn: 'Design' },
    { value: 'development', labelAr: 'التطوير', labelEn: 'Development' },
    { value: 'content', labelAr: 'المحتوى', labelEn: 'Content' },
    { value: 'consulting', labelAr: 'الاستشارات', labelEn: 'Consulting' },
  ];

  const categoriesList = categories?.main || fallbackCategories;

  const handleCategorySelect = (categoryValue: string) => {
    setSelectedCategory(categoryValue);
    onChange(categoryValue);
    setIsOpen(false);
  };

  const getSelectedCategoryInfo = () => {
    if (!selectedCategory) return null;

    // Check if it's the custom "Other" option
    if (selectedCategory === 'custom-other') {
      return {
        value: 'custom-other',
        labelAr: 'أخرى / استشارة مخصصة',
        labelEn: 'Other / Custom Consultation'
      };
    }

    const category = categoriesList.find(cat => cat.value === selectedCategory);
    if (category) {
      return category;
    }

    return null;
  };

  // Create hidden input for form submission
  useEffect(() => {
    if (name) {
      const existingInput = document.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      if (existingInput) {
        existingInput.value = selectedCategory || '';
      }
    }
  }, [selectedCategory, name]);

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
      <div 
        className="w-full h-12 rounded-xl border border-border/50 bg-background/50 px-4 cursor-pointer hover:border-primary focus:border-primary focus:bg-background transition-all duration-300 flex items-center justify-between gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedCategoryInfo ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Folder className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {isArabic ? selectedCategoryInfo.labelAr : selectedCategoryInfo.labelEn}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">
            {placeholder || (isArabic ? 'اختر فئة الخدمة' : 'Select service category')}
          </span>
        )}
        
        <ChevronDown 
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          <div className="p-1">
            {categoriesList.map(category => (
              <button
                key={category.value}
                onClick={() => handleCategorySelect(category.value)}
                className="w-full px-3 py-2 rounded-md hover:bg-primary/10 transition-colors group flex items-center justify-between gap-2 text-left"
              >
                <span className="text-sm truncate">
                  {isArabic ? category.labelAr : category.labelEn}
                </span>
                {selectedCategory === category.value && (
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                )}
              </button>
            ))}

            {/* Other Option */}
            <button
              onClick={() => handleCategorySelect('custom-other')}
              className="w-full px-3 py-2 rounded-md border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors text-sm text-muted-foreground hover:text-foreground text-left"
            >
              {isArabic ? 'أخرى / استشارة مخصصة' : 'Other / Custom Consultation'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};
