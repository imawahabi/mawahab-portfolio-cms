interface CategoryItem {
  value: string;
  labelAr: string;
  labelEn: string;
  icon?: string;
  subcategories?: SubcategoryItem[];
}

interface SubcategoryItem {
  value: string;
  labelAr: string;
  labelEn: string;
}

export const CATEGORIES = {
  main: [
    { 
      value: 'design', 
      labelAr: 'تصميم', 
      labelEn: 'Design',
      icon: '🎨',
      subcategories: [
        { value: 'social', labelAr: 'تصميم وسائل التواصل', labelEn: 'Social Media' },
        { value: 'brand', labelAr: 'هوية بصرية', labelEn: 'Brand Identity' },
        { value: 'web', labelAr: 'تصميم مواقع', labelEn: 'Web Design' },
        { value: 'print', labelAr: 'مطبوعات', labelEn: 'Print' },
      ]
    },
    { 
      value: 'programming', 
      labelAr: 'برمجة', 
      labelEn: 'Programming',
      icon: '💻',
      subcategories: [
        { value: 'frontend', labelAr: 'واجهات أمامية', labelEn: 'Frontend' },
        { value: 'backend', labelAr: 'واجهات خلفية', labelEn: 'Backend' },
        { value: 'mobile', labelAr: 'تطبيقات جوال', labelEn: 'Mobile' },
      ]
    },
    { 
      value: 'design-programming', 
      labelAr: 'تصميم وبرمجة', 
      labelEn: 'Design & Programming',
      icon: '🚀',
      subcategories: [
        { value: 'web-app', labelAr: 'تطبيقات ويب', labelEn: 'Web Apps' },
        { value: 'ecommerce', labelAr: 'متاجر إلكترونية', labelEn: 'E-commerce' },
        { value: 'dashboard', labelAr: 'لوحات تحكم', labelEn: 'Dashboards' },
      ]
    },
    { 
      value: 'development', 
      labelAr: 'تطوير', 
      labelEn: 'Development',
      icon: '🔧',
      subcategories: [
        { value: 'websites', labelAr: 'مواقع ويب', labelEn: 'Websites' },
        { value: 'web-apps', labelAr: 'تطبيقات ويب', labelEn: 'Web Apps' },
        { value: 'custom', labelAr: 'حلول مخصصة', labelEn: 'Custom Solutions' },
      ]
    },
    { 
      value: 'content', 
      labelAr: 'إدارة محتوى', 
      labelEn: 'Content Management',
      icon: '📝',
      subcategories: [
        { value: 'writing', labelAr: 'كتابة محتوى', labelEn: 'Content Writing' },
        { value: 'social', labelAr: 'إدارة منصات', labelEn: 'Social Media' },
        { value: 'seo', labelAr: 'تحسين محركات البحث', labelEn: 'SEO' },
      ]
    },
  ],
  design: [
    { value: 'social', labelAr: 'سوشيال ميديا', labelEn: 'Social Media Design' },
    { value: 'brand', labelAr: 'هوية بصرية', labelEn: 'Brand Identity' },
    { value: 'web', labelAr: 'ويب', labelEn: 'Web Design' },
    { value: 'print', labelAr: 'مطبوعات', labelEn: 'Print Design' },
    { value: 'ads', labelAr: 'حملات إعلانية', labelEn: 'Advertising Campaigns' },
  ],
  programming: [
    { value: 'frontend', labelAr: 'تطوير الواجهات الأمامية', labelEn: 'Frontend Development' },
    { value: 'backend', labelAr: 'تطوير الواجهات الخلفية', labelEn: 'Backend Development' },
    { value: 'full-stack', labelAr: 'تطوير متكامل', labelEn: 'Full Stack Development' },
  ],
  'design-programming': [
    { value: 'web-app', labelAr: 'تطبيقات ويب', labelEn: 'Web Applications' },
    { value: 'ecommerce', labelAr: 'متاجر إلكترونية', labelEn: 'E-commerce' },
    { value: 'responsive', labelAr: 'مواقع متجاوبة', labelEn: 'Responsive Websites' },
  ],
  development: [
    { value: 'websites', labelAr: 'مواقع ويب', labelEn: 'Websites Development' },
    { value: 'mobile-web', labelAr: 'ويب ابلكيشن للهواتف', labelEn: 'Mobile Web Applications' },
    { value: 'custom-systems', labelAr: 'أنظمة وبرامج خاصة', labelEn: 'Custom Systems & Software' },
    { value: 'enhancement', labelAr: 'تطوير المواقع والأنظمة', labelEn: 'Web & Systems Enhancement' },
  ],
  content: [
    { value: 'content-creation', labelAr: 'إنشاء محتوى', labelEn: 'Content Creation' },
    { value: 'social-management', labelAr: 'إدارة الحسابات', labelEn: 'Social Media Management' },
    { value: 'content-optimization', labelAr: 'تحسين المحتوى', labelEn: 'Content Optimization' },
    { value: 'web-content', labelAr: 'كتابة وإدارة المواقع', labelEn: 'Website Content & Management' },
    { value: 'data-entry', labelAr: 'إدخال البيانات', labelEn: 'Data Entry' },
  ],
};

export type CategoryKey = keyof typeof CATEGORIES;
