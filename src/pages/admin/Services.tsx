import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  DollarSign,
  Zap,
  Settings2,
  CheckCircle,
  Calendar,
  Star,
  Target,
  BarChart3,
  Palette,
  Code,
  Monitor,
  Database,
  Layers,
  Cpu,
  Globe,
  Smartphone,
  Layout,
  Brush,
  PenLine,
  Server,
  Figma,
  AppWindow,
  Cloud,
  Shield,
  ShoppingCart,
  MessageSquare,
  Camera,
  Loader2,
  X,
} from 'lucide-react';
import LoadingSpinner, { ServiceCardSkeleton } from '@/components/admin/LoadingSpinner';

const splitList = (value?: string) =>
  value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

const emptyForm = {
  slug: '',
  titleAr: '',
  titleEn: '',
  descriptionAr: '',
  descriptionEn: '',
  mainCategory: 'design',
  subCategory: '',
  featuresAr: '',
  featuresEn: '',
  icon: '',
  priceFrom: '',
  priceTo: '',
  priceUnitAr: 'د.ك',
  priceUnitEn: 'KWD',
  isFeatured: false,
  sortOrder: 0,
  newFeatureAr: '',
  newFeatureEn: '',
};

type FormState = typeof emptyForm & {
  subCategory?: string;
};

type Service = {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  mainCategory: string;
  subCategory?: string;
  featuresAr: string[];
  featuresEn: string[];
  icon?: string;
  priceFrom?: number;
  priceTo?: number;
  priceUnitAr?: string;
  priceUnitEn?: string;
  isFeatured: boolean;
  sortOrder?: number;
};

const parseService = (s: any): Service => ({
  ...s,
  featuresAr: s.featuresAr || [],
  featuresEn: s.featuresEn || [],
  isFeatured: !!s.isFeatured,
  subCategory: s.subCategory || '',
});

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const {
    data: categoriesData,
    refetch: refetchCategories,
    isLoading: loadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const flatCategories = useMemo(() => {
    const main = categoriesData?.main || [];
    const subs = main.flatMap((cat: any) => cat.subcategories?.map((sub: any) => ({ ...sub, parentId: cat.id })) || []);
    return [...main, ...subs];
  }, [categoriesData]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getServices();
      setServices(data.map(parseService));
    } catch {
      toast.error('فشل في جلب الخدمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!form.mainCategory && categoriesData?.main?.length) {
      setForm((prev) => ({ ...prev, mainCategory: prev.mainCategory || categoriesData.main[0].value }));
    }
  }, [categoriesData, form.mainCategory]);

  useEffect(() => {
    if (
      activeCategory !== 'all' &&
      categoriesData?.main &&
      !categoriesData.main.some((cat: any) => cat.value === activeCategory)
    ) {
      setActiveCategory('all');
    }
  }, [activeCategory, categoriesData]);

  const addToken = (listKey: keyof FormState, value: string, clearKey?: keyof FormState) => {
    if (!value.trim()) return;
    const list = splitList((form as any)[listKey]);
    const next = Array.from(new Set([...list, value.trim()]));
    setForm((prev) => ({
      ...prev,
      [listKey]: next.join(', '),
      ...(clearKey ? { [clearKey]: '' } : {}),
    }) as FormState);
  };

  const removeToken = (listKey: keyof FormState, value: string) => {
    const list = splitList((form as any)[listKey]).filter((item) => item !== value);
    setForm((prev) => ({ ...prev, [listKey]: list.join(', ') }));
  };

  const handleFeatureKeyDown = (lang: 'ar' | 'en') => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (lang === 'ar') {
        addToken('featuresAr', form.newFeatureAr, 'newFeatureAr');
      } else {
        addToken('featuresEn', form.newFeatureEn, 'newFeatureEn');
      }
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const fillForm = (service: Service) => {
    setEditingId(service.id);
    setForm({
      slug: service.slug,
      titleAr: service.titleAr,
      titleEn: service.titleEn,
      descriptionAr: service.descriptionAr,
      descriptionEn: service.descriptionEn,
      mainCategory: service.mainCategory,
      subCategory: service.subCategory || '',
      featuresAr: service.featuresAr.join(', '),
      featuresEn: service.featuresEn.join(', '),
      icon: service.icon || '',
      priceFrom: service.priceFrom ? String(service.priceFrom) : '',
      priceTo: service.priceTo ? String(service.priceTo) : '',
      priceUnitAr: service.priceUnitAr || 'د.ك',
      priceUnitEn: service.priceUnitEn || 'KWD',
      isFeatured: service.isFeatured,
      sortOrder: service.sortOrder || 0,
      newFeatureAr: '',
      newFeatureEn: '',
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug,
        titleAr: form.titleAr,
        titleEn: form.titleEn,
        descriptionAr: form.descriptionAr,
        descriptionEn: form.descriptionEn,
        mainCategory: form.mainCategory,
        subCategory: form.subCategory || null,
        featuresAr: splitList(form.featuresAr),
        featuresEn: splitList(form.featuresEn),
        icon: form.icon,
        priceFrom: form.priceFrom ? Number(form.priceFrom) : null,
        priceTo: form.priceTo ? Number(form.priceTo) : null,
        priceUnitAr: form.priceUnitAr,
        priceUnitEn: form.priceUnitEn,
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder) || 0,
      } as any;

      if (editingId) {
        await api.updateService(editingId, payload);
        toast.success('تم التحديث');
      } else {
        await api.createService(payload);
        toast.success('تمت الإضافة');
      }
      setOpen(false);
      resetForm();
      load();
    } catch {
      toast.error('فشل الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف الخدمة؟')) return;
    try {
      await api.deleteService(id);
      toast.success('تم الحذف');
      load();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const mainCategories = useMemo(() => categoriesData?.main || [], [categoriesData]);

  const safeMainCategories = useMemo(() => (mainCategories || []).filter((cat: any) => !!cat?.value), [mainCategories]);

  const subCategories = useMemo(() => {
    const mainCategory = safeMainCategories.find((cat: any) => cat.value === form.mainCategory);
    return (mainCategory?.subcategories || []).filter((sub: any) => !!sub?.value);
  }, [form.mainCategory, safeMainCategories]);

  const featuresListAr = useMemo(() => splitList(form.featuresAr), [form.featuresAr]);
  const featuresListEn = useMemo(() => splitList(form.featuresEn), [form.featuresEn]);

  const getMainCategory = (value?: string) => mainCategories.find((cat: any) => cat.value === value);
  const getSubCategory = (mainValue?: string, subValue?: string) =>
    mainCategories
      .find((cat: any) => cat.value === mainValue)
      ?.subcategories?.find((sub: any) => sub.value === subValue);

  const payloadPreview = useMemo(
    () => ({
      slug: form.slug || '(بدون)',
      mainCategory: form.mainCategory || '(غير محدد)',
      subCategory: form.subCategory || '(غير محدد)',
      title_ar: form.titleAr,
      title_en: form.titleEn,
      description_ar: form.descriptionAr,
      description_en: form.descriptionEn,
      features_ar: splitList(form.featuresAr),
      features_en: splitList(form.featuresEn),
      price_from: form.priceFrom || null,
      price_to: form.priceTo || null,
      price_unit_ar: form.priceUnitAr,
      price_unit_en: form.priceUnitEn,
      is_featured: form.isFeatured,
      sort_order: form.sortOrder,
      icon: form.icon || null,
    }),
    [form],
  );

  // أيقونات مقترحة للاختيار في مودال الخدمات
  const iconOptions = [
    { name: 'palette', icon: Palette },
    { name: 'code', icon: Code },
    { name: 'monitor', icon: Monitor },
    { name: 'database', icon: Database },
    { name: 'layers', icon: Layers },
    { name: 'cpu', icon: Cpu },
    { name: 'globe', icon: Globe },
    { name: 'smartphone', icon: Smartphone },
    { name: 'layout', icon: Layout },
    { name: 'brush', icon: Brush },
    { name: 'pen-line', icon: PenLine },
    { name: 'server', icon: Server },
    { name: 'figma', icon: Figma },
    { name: 'app-window', icon: AppWindow },
    { name: 'cloud', icon: Cloud },
    { name: 'shield', icon: Shield },
    { name: 'shopping-cart', icon: ShoppingCart },
    { name: 'message-square', icon: MessageSquare },
    { name: 'camera', icon: Camera },
  ];

  const filteredIconOptions = iconOptions.filter((opt) =>
    !form.icon ? true : opt.name.toLowerCase().includes(String(form.icon).toLowerCase()),
  );

  const categoryFilterOptions = useMemo(() => {
    return [
      { value: 'all', label: 'الكل', count: services.length },
      ...safeMainCategories.map((cat: any) => ({
        value: cat.value,
        label: cat.labelAr,
        count: services.filter((service) => service.mainCategory === cat.value).length,
      })),
    ];
  }, [safeMainCategories, services]);

  const servicesByCategory = useMemo(() => {
    const map: Record<string, Service[]> = {};
    services.forEach((service) => {
      const key = service.mainCategory || 'uncategorized';
      if (!map[key]) map[key] = [];
      map[key].push(service);
    });

    Object.keys(map).forEach((key) => {
      map[key] = map[key].sort((a, b) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      });
    });

    return map;
  }, [services]);

  const visibleSections = useMemo(() => {
    const selectedKeys =
      activeCategory === 'all'
        ? safeMainCategories.map((cat: any) => cat.value).filter((key) => servicesByCategory[key]?.length)
        : [activeCategory];

    return selectedKeys
      .map((key) => {
        const list = servicesByCategory[key] || [];
        const filtered = showFeaturedOnly ? list.filter((service) => service.isFeatured) : list;
        const categoryMeta = safeMainCategories.find((cat: any) => cat.value === key);
        return {
          key,
          label: categoryMeta?.labelAr || key,
          services: filtered,
          featuredCount: list.filter((service) => service.isFeatured).length,
        };
      })
      .filter((section) => section.services.length > 0);
  }, [activeCategory, servicesByCategory, showFeaturedOnly, safeMainCategories]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Settings2 className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                إدارة الخدمات
              </h1>
              <p className="text-muted-foreground mt-1">إدارة الخدمات، الأسعار والميزات بكفاءة عالية</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> خدمة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-h-[95vh] max-w-6xl flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl backdrop-blur-xl p-0"
            dir="rtl"
          >
            <DialogHeader className="relative border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-slate-900/40 opacity-60 pointer-events-none"></div>
              <div className="relative z-10 flex flex-row items-center justify-between gap-6 w-full">
                <div className="flex flex-row items-center gap-4">
                  <div className="flex flex-col items-start text-left">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full border border-purple-500/40 bg-purple-500/10 text-purple-200 text-xs font-semibold">
                        {editingId ? 'تعديل' : 'إضافة جديدة'}
                      </span>
                      <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-orange-200 bg-clip-text text-transparent flex items-center gap-3">
                        {editingId ? (
                          <Pencil className="w-6 h-6 text-purple-200" />
                        ) : (
                          <Sparkles className="w-6 h-6 text-purple-200" />
                        )}
                        {editingId ? 'تعديل الخدمة' : 'إضافة خدمة'}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-base text-slate-300 leading-relaxed mt-1">
                      أدخل بيانات الخدمة بالتفاصيل الكاملة. كل الحقول مرتبة من الأعلى للأسفل لسهولة التصفح.
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse delay-75"></div>
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse delay-150"></div>
                </div>
              </div>
            </DialogHeader>

            {/* Form Content (sections) */}
            <form
              className="overflow-y-auto flex-1 px-8 py-6 mt-0 space-y-12 text-right [&_input]:text-right [&_textarea]:text-right [&_input::placeholder]:text-right [&_textarea::placeholder]:text-right"
              onSubmit={handleSubmit}
            >
              {/* Basic Section */}
              <section className="space-y-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-transparent rounded-2xl pointer-events-none"></div>
                <header className="relative z-10 space-y-3 pb-4 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-900/30 border border-blue-700/50">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    المعلومات الأساسية
                  </h3>
                  <p className="text-base text-slate-400 leading-relaxed">أدخل اسم الخدمة والوصف والتصنيف.</p>
                </header>

                <div className="relative z-10 space-y-6">
                  <div className="relative z-10 grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="slug" className="font-bold text-slate-200 text-base">الرابط (slug)</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-red-900/30 text-red-300 px-2 py-1 rounded-full border border-red-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                        <Input 
                          id="slug"
                          value={form.slug} 
                          onChange={(e) => setForm({ ...form, slug: e.target.value })} 
                          placeholder="web-design"
                          required 
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="mainCategory" className="font-bold text-slate-200 text-base">التصنيف الرئيسي</Label>
                      <div className="relative">
                        <Select 
                          value={form.mainCategory} 
                          onValueChange={(value) => setForm({ ...form, mainCategory: value, subCategory: '' })}
                          dir="rtl"
                        >
                          <SelectTrigger className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 text-right justify-between">
                            <SelectValue 
                              placeholder="اختر التصنيف الرئيسي"
                              className="text-right"
                            />
                          </SelectTrigger>

                          <SelectContent className="bg-slate-800 border-slate-600 text-right" position="popper">
                            {safeMainCategories.length === 0 && (
                              <SelectItem value="no-main" disabled className="text-right">
                                لا توجد تصنيفات
                              </SelectItem>
                            )}

                            {safeMainCategories.map((category) => (
                              <SelectItem 
                                key={category.value} 
                                value={category.value}
                                className="text-right"
                              >
                                <div className="flex items-center justify-end gap-2">
                                  <span>{category.labelAr}</span>
                                  <span>{category.icon}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="subCategory" className="font-bold text-slate-200 text-base">التصنيف الفرعي</Label>
                      <div className="relative">
                        <Select 
                          value={form.subCategory} 
                          onValueChange={(value) => setForm({ ...form, subCategory: value })}
                          disabled={!form.mainCategory}
                          dir="rtl"
                        >
                          <SelectTrigger className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 disabled:opacity-50 text-right justify-between">
                            <SelectValue
                              placeholder="اختر التصنيف الفرعي"
                              className="text-right"
                            />
                          </SelectTrigger>

                          <SelectContent className="bg-slate-800 border-slate-600 text-right" position="popper">
                            {subCategories.length === 0 && (
                              <SelectItem value="no-sub" disabled className="text-right">
                                لا توجد تصنيفات فرعية
                              </SelectItem>
                            )}

                            {subCategories.map((sub) => (
                              <SelectItem 
                                key={sub.value} 
                                value={sub.value}
                                className="text-right"
                              >
                                {sub.labelAr}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="sortOrder" className="font-bold text-slate-200 text-base flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-slate-400" />
                        <span>ترتيب العرض</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          id="sortOrder"
                          type="number"
                          value={form.sortOrder} 
                          onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} 
                          placeholder="0"
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="icon" className="font-bold text-slate-200 text-base flex items-center gap-2">
                          <Palette className="w-4 h-4 text-slate-400" />
                          <span>الأيقونة</span>
                        </Label>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">اختياري</div>
                      </div>
                      <div className="space-y-3">
                        {/* حقل البحث / اسم الأيقونة */}
                        <div className="relative" dir="rtl">
                          <Input
                            id="icon"
                            value={form.icon}
                            onChange={(e) => setForm({ ...form, icon: e.target.value })}
                            placeholder="ابحث باسم الأيقونة أو اكتبها يدويًا (مثال: palette, code)"
                            className="h-11 rounded-xl border-slate-600 focus:border-purple-500 bg-slate-900/60 text-slate-100 placeholder:text-slate-500"
                          />
                        </div>

                        {/* شبكة الأيقونات مع فلترة بالاسم - تظهر فقط عند وجود نص في الحقل */}
                        {String(form.icon || '').trim() && (
                          <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3 space-y-2">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>اختر أيقونة جاهزة</span>
                              <span className="font-mono text-slate-500">{filteredIconOptions.length} / {iconOptions.length}</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1">
                              {filteredIconOptions.map(({ name, icon: Icon }) => (
                                <button
                                  key={name}
                                  type="button"
                                  onClick={() => setForm({ ...form, icon: name })}
                                  className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-colors whitespace-nowrap ${
                                    form.icon === name
                                      ? 'bg-purple-700/40 border-purple-400 text-purple-100'
                                      : 'bg-slate-800/60 border-slate-700 text-slate-200 hover:bg-slate-700/70'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span className="font-mono">{name}</span>
                                </button>
                              ))}
                              {filteredIconOptions.length === 0 && (
                                <div className="col-span-full text-xs text-slate-500 text-center py-2">
                                  لا توجد أيقونات مطابقة لهذا الاسم
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="priceUnitAr" className="font-bold text-slate-200 text-base">وحدة السعر (عربي)</Label>
                      <div className="relative">
                        <Input 
                          id="priceUnitAr"
                          value={form.priceUnitAr} 
                          onChange={(e) => setForm({ ...form, priceUnitAr: e.target.value })} 
                          placeholder="ريال سعودي"
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="titleAr" className="font-bold text-slate-200 text-base">اسم الخدمة</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700/50">عربي</div>
                      </div>
                      <div className="relative">
                        <Input 
                          id="titleAr"
                          value={form.titleAr} 
                          onChange={(e) => setForm({ ...form, titleAr: e.target.value })} 
                          placeholder="تصميم الويب"
                          required 
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="titleEn" className="font-bold text-slate-200 text-base">Service Name</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">English</div>
                      </div>
                      <div className="relative">
                        <Input 
                          id="titleEn"
                          value={form.titleEn} 
                          onChange={(e) => setForm({ ...form, titleEn: e.target.value })} 
                          placeholder="Web Design"
                          required 
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="descriptionAr" className="font-bold text-slate-200 text-base">الوصف</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700/50">عربي</div>
                      </div>
                      <div className="relative">
                        <Textarea 
                          id="descriptionAr"
                          value={form.descriptionAr} 
                          onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} 
                          placeholder="وصف الخدمة بالعربية"
                          rows={4}
                          required 
                          className="rounded-xl border-slate-600 focus:border-blue-500 resize-none bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                        <div className="absolute left-3 top-3 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇸🇦
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="descriptionEn" className="font-bold text-slate-200 text-base">Description</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">English</div>
                      </div>
                      <div className="relative">
                        <Textarea 
                          id="descriptionEn"
                          value={form.descriptionEn} 
                          onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} 
                          placeholder="Service description in English"
                          rows={4}
                          required 
                          className="rounded-xl border-slate-600 focus:border-blue-500 resize-none bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                        <div className="absolute left-3 top-3 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇬🇧
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Pricing Section */}
              <section className="space-y-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent rounded-2xl pointer-events-none"></div>
                <header className="relative z-10 space-y-3 pb-4 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-900/30 border border-green-700/50">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                    الأسعار
                  </h3>
                  <p className="text-base text-slate-400 leading-relaxed">حدد نطاق السعر ووحدة العملة وحالة التمييز.</p>
                </header>

                <div className="relative z-10 space-y-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="priceFrom" className="font-bold text-slate-200 text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>السعر من</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          id="priceFrom"
                          type="number" 
                          value={form.priceFrom} 
                          onChange={(e) => setForm({ ...form, priceFrom: e.target.value })} 
                          placeholder="1000"
                          className="h-12 rounded-xl border-slate-600 focus:border-green-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="priceTo" className="font-bold text-slate-200 text-base flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                        <span>السعر إلى</span>
                      </Label>
                      <div className="relative">
                        <Input 
                          id="priceTo"
                          type="number" 
                          value={form.priceTo} 
                          onChange={(e) => setForm({ ...form, priceTo: e.target.value })} 
                          placeholder="5000"
                          className="h-12 rounded-xl border-slate-600 focus:border-green-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 flex flex-col justify-end">
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-amber-900/20 to-amber-900/10 border border-amber-700/50 backdrop-blur-sm">
                        <Switch 
                          id="featured"
                          checked={form.isFeatured} 
                          onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} 
                          className="data-[state=checked]:bg-amber-500"
                        />
                        <Label htmlFor="featured" className="font-bold text-slate-200 cursor-pointer flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-400" />
                          <span>مميزة</span>
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <Label htmlFor="priceUnitAr" className="font-bold text-slate-200 text-base">وحدة السعر (عربي)</Label>
                      <div className="relative">
                        <Input 
                          id="priceUnitAr"
                          value={form.priceUnitAr} 
                          onChange={(e) => setForm({ ...form, priceUnitAr: e.target.value })} 
                          placeholder="ريال سعودي"
                          className="h-12 rounded-xl border-slate-600 focus:border-green-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label htmlFor="priceUnitEn" className="font-bold text-slate-200 text-base">Price Unit (English)</Label>
                      <div className="relative">
                        <Input 
                          id="priceUnitEn"
                          value={form.priceUnitEn} 
                          onChange={(e) => setForm({ ...form, priceUnitEn: e.target.value })} 
                          placeholder="Saudi Riyal"
                          className="h-12 rounded-xl border-slate-600 focus:border-green-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="space-y-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 to-transparent rounded-2xl pointer-events-none"></div>
                <header className="relative z-10 space-y-3 pb-4 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-900/30 border border-indigo-700/50">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    الميزات
                  </h3>
                  <p className="text-base text-slate-400 leading-relaxed">أضف الميزات الأساسية للخدمة.</p>
                </header>

                <div className="relative z-10 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label className="font-bold text-slate-200 text-base">الميزات (عربي)</Label>
                        <div className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700/50">عربي</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {featuresListAr.length === 0 && (
                          <span className="text-sm text-slate-500">لا توجد ميزات مضافة بعد</span>
                        )}
                        {featuresListAr.map((feat) => (
                          <span
                            key={feat}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/80 text-slate-100 text-sm"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-300" />
                            <span>{feat}</span>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-red-400 transition"
                              onClick={() => removeToken('featuresAr', feat)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={form.newFeatureAr}
                          onChange={(e) => setForm({ ...form, newFeatureAr: e.target.value })}
                          onKeyDown={handleFeatureKeyDown('ar')}
                          placeholder="أضف ميزة جديدة"
                          className="flex-1 h-11 rounded-xl border-slate-600 focus:border-indigo-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                        <Button
                          type="button"
                          onClick={() => addToken('featuresAr', form.newFeatureAr, 'newFeatureAr')}
                          className="h-11 px-4 gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          إضافة
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label className="font-bold text-slate-200 text-base">Features (English)</Label>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">English</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {featuresListEn.length === 0 && (
                          <span className="text-sm text-slate-500">No features yet</span>
                        )}
                        {featuresListEn.map((feat) => (
                          <span
                            key={feat}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/70 border border-slate-700/80 text-slate-100 text-sm"
                          >
                            <Sparkles className="w-3 h-3 text-green-300" />
                            <span>{feat}</span>
                            <button
                              type="button"
                              className="text-slate-400 hover:text-red-400 transition"
                              onClick={() => removeToken('featuresEn', feat)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={form.newFeatureEn}
                          onChange={(e) => setForm({ ...form, newFeatureEn: e.target.value })}
                          onKeyDown={handleFeatureKeyDown('en')}
                          placeholder="Add a feature"
                          className="flex-1 h-11 rounded-xl border-slate-600 focus:border-indigo-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                        <Button
                          type="button"
                          onClick={() => addToken('featuresEn', form.newFeatureEn, 'newFeatureEn')}
                          className="h-11 px-4 gap-1"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Settings Section */}
              <section className="space-y-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-transparent rounded-2xl -mx-8 -mb-8" />
                <header className="relative">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings2 className="w-6 h-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-slate-100">الإعدادات</h3>
                  </div>
                  <p className="text-base text-slate-400 leading-relaxed">ملخص الإعدادات والأيقونة والحالة والحمولة المرسلة للباك.</p>
                </header>

                <div className="relative z-10 space-y-6">
                  {/* ملخص الأيقونة المختارة - عرض فقط */}
                  <div className="space-y-3 p-6 rounded-xl bg-gradient-to-br from-purple-900/20 to-purple-900/10 border border-purple-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-purple-300" />
                        <span className="font-bold text-slate-100 text-base">الأيقونة المختارة</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-purple-700/60 bg-slate-900/60 px-4 py-3">
                      <div className="flex items-center gap-2">
                        {form.icon ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-800/60 border border-purple-500/60">
                            <Star className="w-4 h-4 text-purple-200" />
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">لا توجد أيقونة محددة</span>
                        )}
                        {form.icon && (
                          <span className="font-mono text-sm text-purple-100">{form.icon}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </form>

            {/* Footer */}
            <div className="border-t border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-800/30 px-8 py-6 flex items-center justify-between gap-3 backdrop-blur-sm">
              <div className="text-sm text-slate-400">
                {editingId ? 'تحديث الخدمة' : 'إضافة خدمة جديدة'}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="h-11 px-5 border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  onClick={handleSubmit}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <>
                      {editingId ? 'تحديث' : 'حفظ'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSpinner message="جاري تحميل الخدمات..." size="lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ServiceCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 backdrop-blur-sm p-6 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              {categoryFilterOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={activeCategory === option.value ? 'default' : 'outline'}
                  onClick={() => setActiveCategory(option.value)}
                  className={`px-4 py-2 text-sm ${activeCategory === option.value ? 'bg-blue-600 text-white' : ''}`}
                  disabled={option.value !== 'all' && option.count === 0}
                >
                  <div className="flex items-center gap-2">
                    <span>{option.label}</span>
                    <Badge variant={activeCategory === option.value ? 'secondary' : 'outline'} className="text-xs">
                      {option.count}
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-slate-400">
                اختر تصنيفاً لعرض خدماته أو اظهر جميع الخدمات دفعة واحدة.
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="featured-only" className="text-sm text-slate-200">
                  عرض الخدمات المميزة فقط
                </Label>
                <Switch id="featured-only" checked={showFeaturedOnly} onCheckedChange={setShowFeaturedOnly} />
              </div>
            </div>
          </div>

          {visibleSections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-900/60 p-10 text-center text-slate-300">
              لا توجد خدمات مطابقة للمعايير الحالية.
            </div>
          ) : (
            visibleSections.map((section) => (
              <div key={section.key} className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white">{section.label}</h3>
                    <p className="text-sm text-slate-400">
                      {section.services.length} خدمة / {section.featuredCount} مميزة
                    </p>
                  </div>
                  {section.featuredCount > 0 && (
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0">
                      <Star className="w-3 h-3 ml-1" /> {section.featuredCount} خدمة مميزة
                    </Badge>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {section.services.map((service) => (
                    <Card
                      key={service.id}
                      className={`relative overflow-hidden transition-all duration-500 group flex flex-col h-full border
                        ${service.isFeatured
                          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 border-blue-500/70 shadow-[0_0_25px_rgba(59,130,246,0.4)]'
                          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 hover:border-blue-600/70'}
                      `}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5 opacity-60" />
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full blur-3xl" />
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-500/8 to-transparent rounded-full blur-2xl" />

                      <div
                        className={`absolute top-0 right-0 h-full w-1 ${
                          service.isFeatured
                            ? 'bg-gradient-to-b from-blue-500 to-cyan-500'
                            : 'bg-gradient-to-b from-slate-600 to-slate-700'
                        }`}
                      />

                      <div className="relative z-10 p-6 flex flex-col h-full">
                        <div className="flex items-start gap-4 mb-6">
                          <div className="relative">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/50">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                                <Zap className="w-5 h-5" />
                              </div>
                              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 blur-lg opacity-50" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-white truncate">{service.titleAr}</h3>
                              {service.isFeatured && (
                                <Badge className="px-2 py-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-0 text-xs">
                                  <span className="inline-flex items-center gap-1">
                                    <Star className="w-3 h-3" />
                                    مميزة
                                  </span>
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-2">{service.descriptionAr}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                          <Badge className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 text-sm">
                            {getMainCategory(service.mainCategory)?.labelAr || service.mainCategory}
                          </Badge>
                          {service.subCategory && (
                            <Badge variant="outline" className="px-3 py-1 border-slate-600 text-slate-400 text-sm">
                              {getSubCategory(service.mainCategory, service.subCategory)?.labelAr || service.subCategory}
                            </Badge>
                          )}
                        </div>

                        {(service.priceFrom || service.priceTo) && (
                          <div className="mb-6">
                            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-emerald-400" />
                                <div className="text-lg font-bold text-emerald-400">
                                  {service.priceFrom || 0} - {service.priceTo || 0}
                                </div>
                                <div className="text-sm text-slate-400">{service.priceUnitAr || ''}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {service.featuresAr.length > 0 && (
                          <div className="mb-6 flex-1">
                            <div className="grid grid-cols-1 gap-2">
                              {service.featuresAr.slice(0, 3).map((feature, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                                  <CheckCircle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                  <span className="truncate">{feature}</span>
                                </div>
                              ))}
                              {service.featuresAr.length > 3 && (
                                <div className="text-xs text-slate-500">+{service.featuresAr.length - 3} ميزات أخرى</div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-auto pt-4 border-t border-slate-700/50">
                          <Button size="sm" variant="ghost" className="gap-2 text-slate-300 hover:text-white" onClick={() => fillForm(service)}>
                            <Pencil className="w-4 h-4" />
                            تعديل
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2 text-red-400 hover:text-red-300" onClick={() => handleDelete(service.id)}>
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
