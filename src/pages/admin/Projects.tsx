import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  FileText,
  Image,
  Tag,
  Settings,
  Calendar,
  User,
  Target,
  Star,
  Briefcase,
  Link as LinkIcon,
  ExternalLink,
  Search,
  Filter as FilterIcon,
  Info,
  X,
  Loader2,
  Circle,
  Lightbulb,
  EyeOff,
  Eye,
} from 'lucide-react';
import LoadingSpinner, { ProjectCardSkeleton } from '@/components/admin/LoadingSpinner';
import { compareProjects } from '@/lib/projectSort';
 
const splitList = (value?: string) =>
  value
    ? value
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : [];

const parseImages = (value?: string) =>
  value
    ? value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => {
          const [url, altAr, altEn] = line.split('|').map((p) => p.trim());
          if (!url) return null;
          return { url, altAr: altAr || null, altEn: altEn || null };
        })
        .filter(Boolean)
    : [];

const joinImages = (images?: any[]) =>
  images?.map((img) => `${img.url}${img.altAr ? `|${img.altAr}` : ''}${img.altEn ? `|${img.altEn}` : ''}`).join('\n') || '';

const emptyForm = {
  slug: '',
  titleAr: '',
  titleEn: '',
  shortDescAr: '',
  shortDescEn: '',
  longDescAr: '',
  longDescEn: '',
  mainCategory: 'design',
  designType: '',
  year: new Date().getFullYear().toString(),
  completionDate: '',
  clientName: '',
  technologiesAr: '',
  technologiesEn: '',
  tagsAr: '',
  tagsEn: '',
  coverImage: '',
  typeLabelAr: '',
  typeLabelEn: '',
  typeLabel: '',
  externalUrl: '',
  role: '',
  imagesRaw: '',
  newImageUrl: '',
  newImageAltAr: '',
  newImageAltEn: '',
  newTechAr: '',
  newTechEn: '',
  newTagAr: '',
  newTagEn: '',
  isFeatured: false,
  isHidden: false,
  sortOrder: 0,
};

type FormState = typeof emptyForm;

type Project = ReturnType<typeof parseProject>;

const parseProject = (p: any) => ({
  ...p,
  technologiesAr: p.technologiesAr || [],
  technologiesEn: p.technologiesEn || [],
  tagsAr: p.tagsAr || [],
  tagsEn: p.tagsEn || [],
  images: p.images || [],
  typeLabelAr: p.typeLabelAr ?? p.type_label_ar ?? '',
  typeLabelEn: p.typeLabelEn ?? p.type_label_en ?? '',
  typeLabel: p.typeLabel ?? p.type_label ?? '',
  isHidden: p.isHidden ?? p.is_hidden ?? false,
});

type CategoryOption = {
  id: string;
  value: string;
  labelAr: string;
  labelEn: string;
  subcategories?: CategoryOption[];
};

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [search, setSearch] = useState('');
  const [filterMain, setFilterMain] = useState<string>('all');
  const [filterSub, setFilterSub] = useState<string>('all');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured' | 'normal'>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [actionProject, setActionProject] = useState<Project | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'hide' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { data: categoriesData, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  });

  const mainCategories = useMemo(() => categoriesData?.main || [], [categoriesData]);
  const safeMainCategories = useMemo(() => (mainCategories || []).filter((cat: any) => !!cat?.value), [mainCategories]);
  const designOptions = useMemo(() => {
    const main = safeMainCategories.find((cat: any) => cat.value === form.mainCategory);
    return (main?.subcategories || []).filter((sub: any) => !!sub?.value);
  }, [form.mainCategory, safeMainCategories]);

  const filterSubOptions = useMemo(() => {
    const main = safeMainCategories.find((cat: any) => cat.value === filterMain);
    return (main?.subcategories || []).filter((sub: any) => !!sub?.value);
  }, [filterMain, safeMainCategories]);

  const yearOptions = useMemo(() => {
    const years = Array.from(new Set(projects.map((p) => p.year).filter(Boolean))).sort((a: any, b: any) => (Number(b) || 0) - (Number(a) || 0));
    return years;
  }, [projects]);

  const technologiesListAr = useMemo(() => splitList(form.technologiesAr), [form.technologiesAr]);
  const technologiesListEn = useMemo(() => splitList(form.technologiesEn), [form.technologiesEn]);

  const getMainCategory = (value?: string) => mainCategories.find((cat: any) => cat.value === value);
  const getSubCategory = (mainValue?: string, subValue?: string) =>
    mainCategories
      .find((cat: any) => cat.value === mainValue)
      ?.subcategories?.find((sub: any) => sub.value === subValue);

  const addToken = (field: keyof FormState, value: string, clearKey?: keyof FormState) => {
    if (!value.trim()) return;
    const list = splitList((form as any)[field]);
    const next = Array.from(new Set([...list, value.trim()]));
    setForm((prev) => ({
      ...prev,
      [field]: next.join(', '),
      ...(clearKey ? { [clearKey]: '' } : {}),
    }) as FormState);
  };

  const removeToken = (field: keyof FormState, value: string) => {
    const list = splitList((form as any)[field]).filter((item) => item !== value);
    setForm((prev) => ({ ...prev, [field]: list.join(', ') }));
  };

  const addImageRow = () => {
    if (!form.newImageUrl.trim()) return;
    const current = parseImages(form.imagesRaw);
    const next = [
      ...current,
      { url: form.newImageUrl.trim(), altAr: form.newImageAltAr.trim() || null, altEn: form.newImageAltEn.trim() || null },
    ];
    setForm((prev) => ({
      ...prev,
      imagesRaw: next.map((img) => `${img.url}${img.altAr ? `|${img.altAr}` : ''}${img.altEn ? `|${img.altEn}` : ''}`).join('\n'),
      newImageUrl: '',
      newImageAltAr: '',
      newImageAltEn: '',
    }));
  };

  const removeImageRow = (url: string) => {
    const next = parseImages(form.imagesRaw).filter((img) => img.url !== url);
    setForm((prev) => ({
      ...prev,
      imagesRaw: next.map((img) => `${img.url}${img.altAr ? `|${img.altAr}` : ''}${img.altEn ? `|${img.altEn}` : ''}`).join('\n'),
    }));
  };

  const payloadPreview = useMemo(
    () => ({
      slug: form.slug || '(بدون)',
      mainCategory: form.mainCategory,
      designType: form.designType || null,
      title_ar: form.titleAr,
      title_en: form.titleEn,
      short_desc_ar: form.shortDescAr,
      short_desc_en: form.shortDescEn,
      long_desc_ar: form.longDescAr || null,
      long_desc_en: form.longDescEn || null,
      year: form.year || null,
      completion_date: form.completionDate || null,
      client_name: form.clientName || null,
      technologies_ar: splitList(form.technologiesAr),
      technologies_en: splitList(form.technologiesEn),
      tags_ar: splitList(form.tagsAr),
      tags_en: splitList(form.tagsEn),
      cover_image: form.coverImage || null,
      external_url: form.externalUrl || null,
      role: form.role || null,
      images: parseImages(form.imagesRaw),
      is_featured: form.isFeatured,
      is_hidden: form.isHidden,
      sort_order: Number(form.sortOrder) || 0,
      type_label_ar: form.typeLabelAr || null,
      type_label_en: form.typeLabelEn || null,
      type_label: form.typeLabelAr || form.typeLabelEn || form.typeLabel || null,
    }),
    [form],
  );

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getProjects({ includeHidden: true });
      setProjects(data.map(parseProject).sort(compareProjects));
    } catch (err) {
      toast.error('فشل في جلب المشاريع');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!form.mainCategory && mainCategories.length) {
      setForm((prev) => ({ ...prev, mainCategory: prev.mainCategory || mainCategories[0].value }));
    }
  }, [form.mainCategory, mainCategories]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const buildPayloadFromProject = (project: Project, overrides: Partial<Project> = {}) => {
    const base = parseProject(project);
    const overrideHidden = overrides.isHidden ?? overrides.is_hidden;
    const hidden = overrideHidden ?? base.isHidden ?? false;
    return {
      slug: base.slug,
      titleAr: base.titleAr,
      titleEn: base.titleEn,
      shortDescAr: base.shortDescAr,
      shortDescEn: base.shortDescEn,
      longDescAr: base.longDescAr || '',
      longDescEn: base.longDescEn || '',
      mainCategory: base.mainCategory,
      designType: base.designType || '',
      year: base.year ?? null,
      completionDate: base.completionDate || '',
      clientName: base.clientName || '',
      typeLabel: base.typeLabel || base.typeLabelAr || base.typeLabelEn || '',
      typeLabelAr: base.typeLabelAr || '',
      typeLabelEn: base.typeLabelEn || '',
      type_label: base.typeLabel || base.typeLabelAr || base.typeLabelEn || '',
      type_label_ar: base.typeLabelAr || '',
      type_label_en: base.typeLabelEn || '',
      technologiesAr: base.technologiesAr || [],
      technologiesEn: base.technologiesEn || [],
      tagsAr: base.tagsAr || [],
      tagsEn: base.tagsEn || [],
      coverImage: base.coverImage || '',
      externalUrl: base.externalUrl || '',
      role: base.role || '',
      images: base.images || [],
      isFeatured: base.isFeatured || false,
      isHidden: hidden,
      is_hidden: hidden,
      sortOrder: base.sortOrder || 0,
      ...overrides,
    };
  };

  const fillForm = (project: any) => {
    setEditingId(project.id);
    setForm({
      slug: project.slug,
      titleAr: project.titleAr,
      titleEn: project.titleEn,
      shortDescAr: project.shortDescAr,
      shortDescEn: project.shortDescEn,
      longDescAr: project.longDescAr || '',
      longDescEn: project.longDescEn || '',
      mainCategory: project.mainCategory,
      designType: project.designType || '',
      year: project.year ? String(project.year) : '',
      completionDate: project.completionDate || '',
      clientName: project.clientName || '',
      technologiesAr: project.technologiesAr?.join(', ') || '',
      technologiesEn: project.technologiesEn?.join(', ') || '',
      tagsAr: project.tagsAr?.join(', ') || '',
      tagsEn: project.tagsEn?.join(', ') || '',
      coverImage: project.coverImage || '',
      externalUrl: project.externalUrl || '',
      role: project.role || '',
      typeLabelAr: project.typeLabelAr || '',
      typeLabelEn: project.typeLabelEn || '',
      typeLabel: project.typeLabel || project.typeLabelAr || project.typeLabelEn || '',
      imagesRaw: joinImages(project.images),
      newImageUrl: '',
      newImageAltAr: '',
      newImageAltEn: '',
      newTechAr: '',
      newTechEn: '',
      newTagAr: '',
      newTagEn: '',
      isFeatured: !!project.isFeatured,
      isHidden: !!project.isHidden,
      sortOrder: project.sortOrder || 0,
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
        shortDescAr: form.shortDescAr,
        shortDescEn: form.shortDescEn,
        longDescAr: form.longDescAr,
        longDescEn: form.longDescEn,
        mainCategory: form.mainCategory,
        designType: form.designType || null,
        year: form.year ? Number(form.year) : null,
        completionDate: form.completionDate || null,
      clientName: form.clientName || null,
        typeLabelAr: form.typeLabelAr || '',
        typeLabelEn: form.typeLabelEn || '',
        typeLabel: form.typeLabelAr || form.typeLabelEn || '',
        technologiesAr: splitList(form.technologiesAr),
      technologiesEn: splitList(form.technologiesEn),
      tagsAr: splitList(form.tagsAr),
      tagsEn: splitList(form.tagsEn),
      coverImage: form.coverImage,
      externalUrl: form.externalUrl,
      role: form.role,
      images: parseImages(form.imagesRaw),
      isFeatured: form.isFeatured,
      isHidden: form.isHidden,
      sortOrder: Number(form.sortOrder) || 0,
    } as any;

      if (editingId) {
        await api.updateProject(editingId, payload);
        toast.success('تم تحديث المشروع');
      } else {
        await api.createProject(payload);
        toast.success('تم إضافة المشروع');
      }
      setOpen(false);
      resetForm();
      load();
    } catch (err) {
      toast.error('فشل في الحفظ، تأكد من البيانات وحاول مرة أخرى');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (project: Project) => {
    setActionProject(project);
    setActionType('delete');
  };

  const handleHideToggle = (project: Project) => {
    setActionProject(project);
    setActionType('hide');
  };

  const closeActionDialog = () => {
    setActionProject(null);
    setActionType(null);
    setActionLoading(false);
  };

  const handleConfirmAction = async () => {
    if (!actionProject || !actionType) return;
    setActionLoading(true);
    try {
      if (actionType === 'delete') {
        await api.deleteProject(actionProject.id);
        toast.success('تم الحذف');
        setProjects((prev) => prev.filter((p) => p.id !== actionProject.id));
        closeActionDialog();
        load();
      } else {
        const nextHidden = !actionProject.isHidden;
        const payload = buildPayloadFromProject(actionProject, { isHidden: nextHidden, is_hidden: nextHidden });
        // Optimistic update
        const prevProjects = projects;
        setProjects((prev) => prev.map((p) => (p.id === actionProject.id ? { ...p, isHidden: nextHidden } : p)));
        setActionProject((prev) => (prev ? { ...prev, isHidden: nextHidden } : prev));

        const updated = await api.updateProject(actionProject.id, payload);
        const parsedUpdated = parseProject(updated);
        const hasHiddenField =
          Object.prototype.hasOwnProperty.call(updated || {}, 'isHidden') ||
          Object.prototype.hasOwnProperty.call(updated || {}, 'is_hidden');
        const updatedHidden = hasHiddenField ? parsedUpdated.isHidden ?? nextHidden : nextHidden;
        setProjects((prev) =>
          prev.map((p) => (p.id === actionProject.id ? { ...parsedUpdated, isHidden: updatedHidden } : p)),
        );
        setActionProject({ ...parsedUpdated, isHidden: updatedHidden });
        toast.success(updatedHidden ? 'تم إخفاء المشروع' : 'تم إظهار المشروع');
        closeActionDialog();
        return;
      }
    } catch (err) {
      // rollback optimistic update on error
      setProjects((prev) =>
        prev.map((p) => (p.id === actionProject?.id ? { ...p, isHidden: actionProject?.isHidden ?? false } : p)),
      );
      toast.error('تعذر تنفيذ العملية');
      setActionLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return projects
      .filter((p) => {
        if (filterMain !== 'all' && p.mainCategory !== filterMain) return false;
        if (filterSub !== 'all' && p.designType !== filterSub) return false;
        if (filterFeatured === 'featured' && !p.isFeatured) return false;
        if (filterFeatured === 'normal' && p.isFeatured) return false;
        if (filterYear !== 'all' && String(p.year) !== filterYear) return false;
        if (!term) return true;
        const haystack = [
          p.titleAr,
          p.titleEn,
          p.typeLabel,
          p.slug,
          p.clientName,
          (p.tagsAr || []).join(' '),
          (p.tagsEn || []).join(' '),
          (p.technologiesAr || []).join(' '),
          (p.technologiesEn || []).join(' '),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(term);
      })
      .sort(compareProjects);
  }, [projects, search, filterMain, filterSub, filterFeatured, filterYear]);

  return (
    <>
    <div className="space-y-8" dir="rtl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent border border-blue-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
              <Briefcase className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                إدارة المشاريع
              </h1>
              <p className="text-muted-foreground mt-1">إدارة المشاريع، الصور، التصنيفات والتقنيات بكفاءة عالية</p>
            </div>
          </div>

          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { resetForm(); } }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> مشروع جديد
            </Button>
          </DialogTrigger>
          <DialogContent
            className="max-h-[95vh] max-w-6xl !flex min-h-0 flex-col overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 shadow-2xl backdrop-blur-xl p-0"
            dir="rtl"
          >
            <DialogHeader className="relative border-b border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent opacity-50"></div>
              <div className="relative z-10 flex flex-row items-center justify-between gap-6 w-full">
                <div className="flex flex-row items-center gap-4">
                  <div className="flex flex-col items-start text-left">
                    <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-200 to-white bg-clip-text text-transparent flex items-center gap-3">
                      <FileText className="w-7 h-7 text-blue-300" />
                      {editingId ? 'تعديل المشروع' : 'إضافة مشروع'}
                    </DialogTitle>
                    <DialogDescription className="text-base text-slate-300 leading-relaxed mt-1">
                      {editingId ? 'قم بتحديث معلومات المشروع بسهولة ودقة' : 'أدخل تفاصيل مشروعك الجديد.'}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-600">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  <span>{editingId ? 'وضع التعديل' : 'وضع الإضافة'}</span>
                </div>
              </div>
            </DialogHeader>

            {/* Form Content (sections) */}
            <form
              className="overflow-y-auto flex-1 min-h-0 px-8 py-8 mt-0 space-y-12 text-right [&_input]:text-right [&_textarea]:text-right [&_input::placeholder]:text-right [&_textarea::placeholder]:text-right"
              onSubmit={handleSubmit}
            >
              {/* Basic Section */}
              <section className="space-y-8 relative">
                <header className="relative z-10 space-y-3 pb-4 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-900/30 border border-blue-700/50">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    المعلومات الأساسية
                  </h3>
                  <p className="text-base text-slate-400 leading-relaxed">العنوان، الروابط، والتصنيف الأساسي للمشروع.</p>
                </header>

                <div className="relative z-10 space-y-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="slug" className="font-bold text-slate-200 text-base">الرابط (slug)</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                        <Input
                          id="slug"
                          value={form.slug}
                          onChange={(e) => setForm({ ...form, slug: e.target.value })}
                          placeholder="my-awesome-project"
                          required
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          slug
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>يُستخدم في رابط صفحة المشروع (URL)</span>
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="year" className="font-bold text-slate-200 text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>السنة</span>
                        </Label>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">اختياري</div>
                      </div>
                      <div className="relative">
                        <Input
                          id="year"
                          type="number"
                          value={form.year}
                          onChange={(e) => setForm({ ...form, year: e.target.value })}
                          placeholder={new Date().getFullYear().toString()}
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span className="text-[11px]">year</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="mainCategory" className="font-bold text-slate-200 text-base">التصنيف الرئيسي</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                      <Select
                        value={form.mainCategory || undefined}
                        onValueChange={(v) => setForm({ ...form, mainCategory: v, designType: '' })}
                        disabled={loadingCategories}
                        dir="rtl"
                      >
                        <SelectTrigger
                          id="mainCategory"
                          className="h-12 rounded-xl border-slate-600 bg-slate-800/50 text-slate-100 text-right"
                        >
                          <SelectValue
                            placeholder="اختر التصنيف الرئيسي"
                            className="text-right"
                          />
                        </SelectTrigger>

                        <SelectContent
                          className="bg-slate-800 border-slate-600 text-right"
                          position="popper"
                        >
                          {safeMainCategories.length === 0 && (
                            <SelectItem value="no-main" disabled className="text-right">
                              لا توجد تصنيفات
                            </SelectItem>
                          )}

                          {safeMainCategories.map((opt: CategoryOption) => (
                            <SelectItem
                              key={opt.value}
                              value={opt.value}
                              className="text-right"
                            >
                              {opt.labelAr}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="designType" className="font-bold text-slate-200 text-base">التصنيف الفرعي</Label>
                        <div className="text-xs bg-blue-900/30 text-blue-300 px-2 py-1 rounded-full border border-blue-700/50">اختياري</div>
                      </div>
                      <div className="relative">
                    <Select
                      value={form.designType || undefined}
                      onValueChange={(v) => setForm({ ...form, designType: v })}
                      disabled={loadingCategories || !designOptions.length}
                      dir="rtl"
                    >
                      <SelectTrigger
                        id="designType"
                        className="h-12 rounded-xl border-slate-600 bg-slate-800/50 text-slate-100 text-right"
                      >
                        <SelectValue
                          placeholder="اختر التصنيف الفرعي"
                          className="text-right"
                        />
                      </SelectTrigger>

                      <SelectContent
                        className="bg-slate-800 border-slate-600 text-right"
                        position="popper"
                      >
                        {designOptions.length === 0 && (
                          <SelectItem value="no-sub" disabled className="text-right">
                            لا توجد تصنيفات فرعية
                          </SelectItem>
                        )}

                        {designOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="text-right"
                          >
                            {opt.labelAr}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="titleAr" className="font-bold text-slate-200 text-base">عنوان المشروع</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50">العربية</span>
                        <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                        <Input
                          id="titleAr"
                          value={form.titleAr}
                          onChange={(e) => setForm({ ...form, titleAr: e.target.value })}
                          placeholder="اسم المشروع بالعربية"
                          required
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇸🇦
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="titleEn" className="font-bold text-slate-200 text-base">Project Title</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <span className="text-xs bg-green-900/30 text-green-300 px-3 py-1 rounded-full border border-green-700/50">English</span>
                        <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                        <Input
                          id="titleEn"
                          value={form.titleEn}
                          onChange={(e) => setForm({ ...form, titleEn: e.target.value })}
                          placeholder="Project name in English"
                          required
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇬🇧
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="typeLabelAr" className="font-bold text-slate-200 text-base">بادئة قبل الاسم (عربي)</Label>
                        <span className="text-xs bg-amber-900/30 text-amber-300 px-3 py-1 rounded-full border border-amber-700/50">اختياري</span>
                      </div>
                      <Input
                        id="typeLabelAr"
                        value={form.typeLabelAr}
                        onChange={(e) => setForm({ ...form, typeLabelAr: e.target.value, typeLabel: e.target.value || form.typeLabelEn })}
                        placeholder="مثال: إنستقرام | أو موقع | أو برنامج |"
                        className="h-11 rounded-xl border-amber-600/50 focus:border-amber-400 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-sm"
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="typeLabelEn" className="font-bold text-slate-200 text-base">Prefix before name (EN)</Label>
                        <span className="text-xs bg-amber-900/30 text-amber-300 px-3 py-1 rounded-full border border-amber-700/50">Optional</span>
                      </div>
                      <Input
                        id="typeLabelEn"
                        value={form.typeLabelEn}
                        onChange={(e) => setForm({ ...form, typeLabelEn: e.target.value, typeLabel: form.typeLabelAr || e.target.value })}
                        placeholder="e.g. Instagram | Site | App"
                        className="h-11 rounded-xl border-amber-600/50 focus:border-amber-400 bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="shortDescAr" className="font-bold text-slate-200 text-base">الوصف المختصر</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50">العربية</span>
                        <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                        <Textarea
                          id="shortDescAr"
                          value={form.shortDescAr}
                          onChange={(e) => setForm({ ...form, shortDescAr: e.target.value })}
                          placeholder="وصف قصير وجذاب للمشروع..."
                          rows={4}
                          required
                          className="rounded-xl border-slate-600 focus:border-blue-500 resize-none bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-3 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇸🇦
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="shortDescEn" className="font-bold text-slate-200 text-base">Short Description</Label>
                        <span className="text-red-400 font-bold text-lg">*</span>
                        <span className="text-xs bg-green-900/30 text-green-300 px-3 py-1 rounded-full border border-green-700/50">English</span>
                        <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                      </div>
                      <div className="relative">
                        <Textarea
                          id="shortDescEn"
                          value={form.shortDescEn}
                          onChange={(e) => setForm({ ...form, shortDescEn: e.target.value })}
                          placeholder="Brief and engaging project description..."
                          rows={4}
                          required
                          className="rounded-xl border-slate-600 focus:border-blue-500 resize-none bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-3 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇬🇧
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="longDescAr" className="font-bold text-slate-200 text-base">الوصف التفصيلي</Label>
                        <span className="text-xs bg-blue-900/30 text-blue-300 px-3 py-1 rounded-full border border-blue-700/50">العربية</span>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">اختياري</div>
                      </div>
                      <div className="relative">
                        <Textarea
                          id="longDescAr"
                          value={form.longDescAr}
                          onChange={(e) => setForm({ ...form, longDescAr: e.target.value })}
                          placeholder="وصف تفصيلي شامل للمشروع..."
                          rows={5}
                          className="rounded-xl border-slate-600 focus:border-blue-500 resize-none bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-3 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇸🇦
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="longDescEn" className="font-bold text-slate-200 text-base">Detailed Description</Label>
                        <span className="text-xs bg-green-900/30 text-green-300 px-3 py-1 rounded-full border border-green-700/50">English</span>
                        <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">اختياري</div>
                      </div>
                      <div className="relative">
                        <Textarea
                          id="longDescEn"
                          value={form.longDescEn}
                          onChange={(e) => setForm({ ...form, longDescEn: e.target.value })}
                          placeholder="Comprehensive project description..."
                          rows={5}
                          className="rounded-xl border-slate-600 focus:border-blue-500 resize-none bg-slate-800/50 text-slate-100 placeholder:text-slate-500 text-base"
                        />
                        <div className="absolute left-3 top-3 text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                          🇬🇧
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Details Section */}
              <section className="space-y-8 relative">
                <div className="relative z-10 space-y-8">
                  <header className="space-y-3 pb-4 border-b border-slate-700">
                    <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-grey-900/30 border border-grey-700/50">
                        <Tag className="w-5 h-5 text-grey-400" />
                      </div>
                      التفاصيل والتقنيات
                    </h3>
                    <p className="text-base text-slate-400 leading-relaxed">المواعيد، العميل، التقنيات، التاجات.</p>
                  </header>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="completionDate" className="font-bold text-slate-200 text-base flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>تاريخ الإنجاز</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="completionDate"
                            type="date"
                            value={form.completionDate}
                            onChange={(e) => setForm({ ...form, completionDate: e.target.value })}
                            className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="clientName" className="font-bold text-slate-200 text-base flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <span>اسم العميل</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="clientName"
                            value={form.clientName}
                            onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                            placeholder="اسم العميل أو الشركة"
                            className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="role" className="font-bold text-slate-200 text-base flex items-center gap-2">
                          <Target className="w-4 h-4 text-slate-400" />
                          <span>الدور أو المسؤولية</span>
                        </Label>
                        <div className="relative">
                          <Input
                            id="role"
                            value={form.role}
                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                            placeholder="مثال: UI/UX Designer"
                            className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="technologiesAr" className="font-bold text-slate-200 text-base">التقنيات (عربي)</Label>
                        <div className="flex gap-3">
                          <Input
                            id="technologiesAr"
                            value={form.newTechAr}
                            onChange={(e) => setForm({ ...form, newTechAr: e.target.value })}
                            placeholder="React أو تقنية"
                            className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                          />
                          <Button type="button" onClick={() => addToken('technologiesAr', form.newTechAr, 'newTechAr')} className="h-11 px-4 bg-blue-600">
                            إضافة
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[44px] items-center">
                          {technologiesListAr.length === 0 && <span className="text-sm text-slate-500">لا توجد تقنيات مضافة</span>}
                          {technologiesListAr.map((tech) => (
                            <span key={tech} className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-200 text-sm flex items-center gap-2">
                              {tech}
                              <button type="button" onClick={() => removeToken('technologiesAr', tech)} className="text-red-400 hover:text-red-200">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="technologiesEn" className="font-bold text-slate-200 text-base">Technologies (English)</Label>
                        <div className="flex gap-3">
                          <Input
                            id="technologiesEn"
                            value={form.newTechEn}
                            onChange={(e) => setForm({ ...form, newTechEn: e.target.value })}
                            placeholder="React or Tech"
                            className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                          />
                          <Button type="button" onClick={() => addToken('technologiesEn', form.newTechEn, 'newTechEn')} className="h-11 px-4 bg-blue-600">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 min-h-[44px] items-center">
                          {technologiesListEn.length === 0 && <span className="text-sm text-slate-500">No technologies yet</span>}
                          {technologiesListEn.map((tech) => (
                            <span key={tech} className="px-3 py-1 rounded-full bg-blue-900/30 border border-blue-700/50 text-blue-200 text-sm flex items-center gap-2">
                              {tech}
                              <button type="button" onClick={() => removeToken('technologiesEn', tech)} className="text-red-400 hover:text-red-200">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
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
                            <span>عرض في الرئيسية</span>
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label htmlFor="tagsAr" className="font-bold text-slate-200 text-base">التاجات (عربي)</Label>
                        <div className="flex gap-3">
                          <Input
                            id="tagsAr"
                            value={form.newTagAr}
                            onChange={(e) => setForm({ ...form, newTagAr: e.target.value })}
                            placeholder="ويب، تطبيق..."
                            className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                          />
                          <Button type="button" onClick={() => addToken('tagsAr', form.newTagAr, 'newTagAr')} className="h-11 px-4 bg-blue-600">
                            إضافة
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {splitList(form.tagsAr).map((tag) => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-100 text-sm flex items-center gap-2">
                              {tag}
                              <button type="button" onClick={() => removeToken('tagsAr', tag)} className="text-red-400 hover:text-red-200">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="tagsEn" className="font-bold text-slate-200 text-base">Tags (English)</Label>
                        <div className="flex gap-3">
                          <Input
                            id="tagsEn"
                            value={form.newTagEn}
                            onChange={(e) => setForm({ ...form, newTagEn: e.target.value })}
                            placeholder="Web, App..."
                            className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                          />
                          <Button type="button" onClick={() => addToken('tagsEn', form.newTagEn, 'newTagEn')} className="h-11 px-4 bg-blue-600">
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {splitList(form.tagsEn).map((tag) => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-indigo-900/30 border border-indigo-700/50 text-indigo-100 text-sm flex items-center gap-2">
                              {tag}
                              <button type="button" onClick={() => removeToken('tagsEn', tag)} className="text-red-400 hover:text-red-200">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Media Section */}
              <section className="space-y-8 relative">
                <header className="relative z-10 space-y-3 pb-4 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-green-900/30 border border-green-700/50">
                      <Image className="w-5 h-5 text-green-400" />
                    </div>
                    الصور والوسائط
                  </h3>
                  <p className="text-base text-slate-400 leading-relaxed">الغلاف، الروابط الخارجية، والوسائط الإضافية.</p>
                </header>

                <div className="relative z-10 space-y-6">
                <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-900/10 border border-blue-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="coverImage" className="font-bold text-lg text-slate-200 flex items-center gap-2">
                      <Image className="w-5 h-5 text-blue-300" />
                      <span>صورة الغلاف الرئيسية</span>
                    </Label>
                    <span className="text-red-400 font-bold text-lg">*</span>
                    <div className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded-full border border-amber-700/50">مطلوب</div>
                  </div>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <Input
                          id="coverImage"
                          value={form.coverImage}
                          onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                          placeholder="https://example.com/image.webp"
                          className="h-12 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                        />
                      </div>
                      <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-300" />
                        <span>يفضل استخدام WebP لأداء أفضل</span>
                      </p>
                    </div>

                    {form.coverImage && (
                      <div className="mt-6 space-y-3">
                        <p className="text-base font-semibold text-slate-200">معاينة الصورة:</p>
                        <div className="relative rounded-xl overflow-hidden border border-slate-600 bg-slate-800/50 backdrop-blur-sm">
                          <img
                            src={form.coverImage}
                            alt="Cover"
                            className="w-full h-56 object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%231e293b" width="400" height="300"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="18"%3E❌ فشل تحميل الصورة%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none"></div>
                        </div>
                      </div>
                    )}
                </div>

                <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-amber-900/20 to-amber-900/10 border border-amber-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="externalUrl" className="font-bold text-lg text-slate-200 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-amber-300" />
                      <span>رابط المشروع</span>
                    </Label>
                    <div className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded-full border border-green-700/50">اختياري</div>
                  </div>
                  
                  <div className="relative">
                    <Input
                      id="externalUrl"
                      value={form.externalUrl}
                      onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                      placeholder="https://example.com"
                      className="h-12 rounded-xl border-slate-600 focus:border-amber-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-amber-300" />
                    <span>رابط للموقع الحي أو مستودع GitHub</span>
                  </p>
                </div>

                <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-indigo-900/20 to-indigo-900/10 border border-indigo-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <h4 className="font-bold text-lg text-slate-200 flex items-center gap-2">
                      <Image className="w-5 h-5 text-indigo-300" />
                      <span>الصور الإضافية</span>
                    </h4>
                    <span className="text-xs bg-indigo-900/30 text-indigo-300 px-3 py-1 rounded-full border border-indigo-700/50">متقدم</span>
                  </div>
                  <p className="text-base text-slate-400 mb-4">أضف روابط الصور مع النص البديل لكل لغة بسهولة.</p>

                  <div className="grid md:grid-cols-3 gap-3">
                    <Input
                      id="newImageUrl"
                      value={form.newImageUrl}
                      onChange={(e) => setForm({ ...form, newImageUrl: e.target.value })}
                      placeholder="https://example.com/img.webp"
                      className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                    />
                    <Input
                      id="newImageAltAr"
                      value={form.newImageAltAr}
                      onChange={(e) => setForm({ ...form, newImageAltAr: e.target.value })}
                      placeholder="النص البديل (عربي)"
                      className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                    />
                    <Input
                      id="newImageAltEn"
                      value={form.newImageAltEn}
                      onChange={(e) => setForm({ ...form, newImageAltEn: e.target.value })}
                      placeholder="Alt text (English)"
                      className="h-11 rounded-xl border-slate-600 focus:border-blue-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button type="button" onClick={addImageRow} className="h-10 px-4 bg-blue-600 text-white">
                      + إضافة صورة
                    </Button>
                  </div>

                  {form.imagesRaw && (
                    <div className="space-y-4 mt-6">
                      <p className="text-base font-semibold text-slate-200">معاينة الصور:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {form.imagesRaw.split('\n').filter(Boolean).map((line, idx) => {
                          const [url] = line.split('|');
                          return url ? (
                            <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-600 bg-slate-800/50 group backdrop-blur-sm">
                              <img
                                src={url.trim()}
                                alt={`Preview ${idx + 1}`}
                                className="w-full h-28 object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%231e293b" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="10"%3E❌%3C/text%3E%3C/svg%3E';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold bg-slate-900/80 px-2 py-1 rounded">#{idx + 1}</span>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-7 px-2 text-xs border-slate-600 text-white bg-slate-900/70 hover:bg-slate-800"
                                  onClick={() => removeImageRow(url.trim())}
                                >
                                  حذف
                                </Button>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

              {/* Settings Section */}
              <section className="space-y-8 relative">
                <header className="relative z-10 space-y-3 pb-4 border-b border-slate-700">
                  <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-900/30 border border-orange-700/50">
                      <Settings className="w-5 h-5 text-orange-400" />
                    </div>
                    الإعدادات والترتيب
                  </h3>
                  <p className="text-base text-slate-400 leading-relaxed">الترتيب والملخص النهائي للبيانات.</p>
                </header>

                <div className="relative z-10 space-y-6">
                  <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-orange-900/20 to-orange-900/10 border border-orange-700/50 backdrop-blur-sm">
                    <Label htmlFor="sortOrder" className="font-bold text-slate-200 text-base">📊 ترتيب العرض</Label>
                    <div className="relative">
                      <Input
                        id="sortOrder"
                        type="number"
                        value={form.sortOrder}
                        onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                        placeholder="0"
                        className="h-12 rounded-xl border-slate-600 focus:border-orange-500 bg-slate-800/50 text-slate-100 placeholder:text-slate-500"
                      />
                    </div>
                    <p className="text-sm text-slate-400 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                      <span className="inline-flex items-center gap-2">
                        <Info className="w-4 h-4 text-amber-300" />
                        <span>الأرقام الأقل تظهر أولاً</span>
                      </span>
                    </p>
                  </div>

                  <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Label htmlFor="isHidden" className="font-bold text-slate-200 text-base flex items-center gap-2">
                          <EyeOff className="w-4 h-4 text-slate-400" />
                          <span>إخفاء المشروع عن الموقع</span>
                        </Label>
                        <div className="text-xs bg-slate-800/80 text-slate-300 px-2 py-1 rounded-full border border-slate-600/70">لن يظهر في البورتفوليو</div>
                      </div>
                      <Switch
                        id="isHidden"
                        checked={form.isHidden}
                        onCheckedChange={(v) => setForm({ ...form, isHidden: v })}
                        className="data-[state=checked]:bg-red-500"
                      />
                    </div>
                    <p className="text-sm text-slate-400">يمكنك إخفاء المشروع مؤقتاً دون حذفه أو فقدان البيانات.</p>
                  </div>

                  <div className="space-y-4 p-6 rounded-xl bg-gradient-to-br from-cyan-900/20 to-cyan-900/10 border border-cyan-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <h4 className="font-bold text-lg text-slate-200">📋 ملخص البيانات</h4>
                      <span className="text-xs bg-cyan-900/30 text-cyan-300 px-3 py-1 rounded-full border border-cyan-700/50">معاينة</span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600 space-y-2 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">العنوان (عربي)</p>
                        <p className="text-sm font-semibold text-slate-200">{form.titleAr || '❌ لم يتم إدخاله'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600 space-y-2 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">العنوان (إنجليزي)</p>
                        <p className="text-sm font-semibold text-slate-200">{form.titleEn || '❌ Not entered'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600 space-y-2 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">التصنيف</p>
                        <p className="text-sm font-semibold text-slate-200">{getMainCategory(form.mainCategory)?.labelAr || form.mainCategory || 'غير محدد'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600 space-y-2 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">الحالة</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${form.isFeatured ? 'bg-green-400' : 'bg-grey-400'}`}></span>
                            <p className={`text-sm font-semibold flex items-center gap-2 ${form.isFeatured ? 'text-green-400' : 'text-grey-400'}`}>
                              {form.isFeatured ? <Star className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                              {form.isFeatured ? 'مميز' : 'عادي'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span className={`w-2 h-2 rounded-full ${form.isHidden ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
                            <span className={`flex items-center gap-2 ${form.isHidden ? 'text-red-300' : 'text-emerald-300'}`}>
                              {form.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              {form.isHidden ? 'مخفي' : 'ظاهر'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600 space-y-2 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">السنة</p>
                        <p className="text-sm font-semibold text-slate-200">{form.year || '❌ لم يتم إدخالها'}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-600 space-y-2 backdrop-blur-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">اسم العميل</p>
                        <p className="text-sm font-semibold text-slate-200">{form.clientName || '❌ لم يتم إدخاله'}</p>
                      </div>
                    </div>

                    <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-amber-900/20 to-amber-900/10 border border-amber-700/50 backdrop-blur-sm">
                      <p className="text-sm text-amber-300 flex items-start gap-2">
                        <Lightbulb className="w-4 h-4 mt-0.5" />
                        <span>تأكد من ملء جميع الحقول المطلوبة (*) قبل الحفظ.</span>
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </form>

            {/* Footer */}
            <div className="border-t border-slate-700 bg-gradient-to-r from-slate-800/50 to-slate-800/30 px-8 py-6 flex items-center justify-between gap-3 backdrop-blur-sm">
              <div className="text-sm text-slate-400">
                {editingId ? 'تحديث المشروع' : 'إضافة مشروع جديد'}
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="h-11 px-5 border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
                >
                  إلغاء
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  onClick={handleSubmit}
                  className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70"
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

      {/* Filters */}
      <Card className="border-slate-700/60 bg-slate-900/60 backdrop-blur-xl shadow-lg shadow-blue-500/10">
        <div className="p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <FilterIcon className="w-4 h-4 text-blue-400" />
            <span>تصفية واستكشاف المشاريع</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-slate-300 text-sm">بحث</Label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالعنوان، العميل، التاجات..."
                  className="pl-9 bg-slate-800/50 border-slate-700/80 text-slate-100 placeholder:text-slate-500 rounded-xl h-11"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-slate-300 text-sm">التصنيف الرئيسي</Label>
              {/* Mobile: كل فئة في صف لوحدها */}
              <div className="lg:hidden overflow-hidden rounded-xl border border-slate-700/80 bg-slate-800/40 divide-y divide-slate-700/70">
                <button
                  type="button"
                  onClick={() => {
                    setFilterMain('all');
                    setFilterSub('all');
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                    filterMain === 'all'
                      ? 'bg-blue-600/20 text-blue-100'
                      : 'text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>الكل</span>
                  <span className={`h-2 w-2 rounded-full ${filterMain === 'all' ? 'bg-blue-400' : 'bg-slate-600'}`} />
                </button>
                {safeMainCategories.map((opt: any) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setFilterMain(opt.value);
                      setFilterSub('all');
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
                      filterMain === opt.value
                        ? 'bg-blue-600/20 text-blue-100'
                        : 'text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{opt.labelAr}</span>
                    <span className={`h-2 w-2 rounded-full ${filterMain === opt.value ? 'bg-blue-400' : 'bg-slate-600'}`} />
                  </button>
                ))}
              </div>

              {/* Desktop */}
              <div className="hidden lg:block">
                <Select value={filterMain} onValueChange={(v) => { setFilterMain(v); setFilterSub('all'); }}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/80 text-slate-100 rounded-xl h-11">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-right">
                    <SelectItem value="all">الكل</SelectItem>
                    {safeMainCategories.map((opt: any) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.labelAr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-slate-300 text-sm">التصنيف الفرعي</Label>
              <Select value={filterSub} onValueChange={(v) => setFilterSub(v)} disabled={filterSubOptions.length === 0}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700/80 text-slate-100 rounded-xl h-11 disabled:opacity-60">
                  <SelectValue placeholder="الكل" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-right">
                  <SelectItem value="all">الكل</SelectItem>
                  {filterSubOptions.map((opt: any) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.labelAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <Label className="text-slate-300 text-sm">الحالة</Label>
                <Select value={filterFeatured} onValueChange={(v: 'all' | 'featured' | 'normal') => setFilterFeatured(v)}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/80 text-slate-100 rounded-xl h-11">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-right">
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="featured">مميز</SelectItem>
                    <SelectItem value="normal">عادي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-slate-300 text-sm">السنة</Label>
                <Select value={filterYear} onValueChange={(v) => setFilterYear(v)} disabled={yearOptions.length === 0}>
                  <SelectTrigger className="bg-slate-800/50 border-slate-700/80 text-slate-100 rounded-xl h-11 disabled:opacity-60">
                    <SelectValue placeholder="الكل" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-right">
                    <SelectItem value="all">الكل</SelectItem>
                    {yearOptions.map((y: any) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-6">
          <LoadingSpinner message="جاري تحميل المشاريع..." size="lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className={`group relative overflow-hidden transition-all duration-500 flex flex-col h-full
              ${project.isFeatured 
                ? 'border-2 border-amber-500/80 shadow-xl shadow-amber-500/20 bg-gradient-to-br from-amber-950/30 via-slate-900/95 to-slate-800/95' 
                : 'border border-slate-600/60 bg-slate-900/80 hover:border-slate-500/70'
              }
              ${project.isHidden ? 'opacity-50 grayscale-[40%] saturate-50 border-slate-700/80 bg-slate-900/70 hover:-translate-y-0 hover:shadow-none' : 'hover:-translate-y-2 hover:shadow-2xl'}
              rounded-2xl backdrop-blur-sm`}
          >
            {/* Simple Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-transparent to-slate-700/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Simple Status Line */}
            <div className={`absolute top-0 right-0 h-full w-1 ${
              project.isFeatured 
                ? 'bg-gradient-to-b from-amber-400 to-amber-600' 
                : 'bg-gradient-to-b from-slate-600 to-slate-700'
            }`} />

            {/* Featured Badge */}
            {project.isFeatured && (
              <div className="absolute top-3 left-3 z-30">
                <Badge className="px-3 py-1 bg-amber-400/30 text-amber-100 border border-amber-300/40 shadow-lg shadow-amber-500/20 backdrop-blur-sm rounded-full text-xs flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current text-amber-200" />
                  مشروع مميز
                </Badge>
              </div>
            )}

            {/* Project Number */}
            <div className="absolute top-3 right-3 z-20">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                project.isFeatured 
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300' 
                  : 'bg-slate-700/50 border-slate-500/50 text-slate-300'
              }`}>
                {filteredProjects.findIndex(p => p.id === project.id) + 1}
              </div>
            </div>
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800/20 via-transparent to-slate-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className={`absolute top-0 right-0 h-full w-1.5 ${
              project.isFeatured 
                ? 'bg-gradient-to-b from-amber-400 to-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                : 'bg-gradient-to-b from-slate-600 to-slate-700'
            }`} />

            <div className={`relative z-10 flex flex-col h-full ${project.isFeatured ? 'pt-8' : 'pt-6'}`}>
              {/* Main Image Section */}
              {project.coverImage && (
                <div className="relative mx-4 mb-4 rounded-xl overflow-hidden border-2 border-slate-600/60 h-32 group-hover:border-slate-500/80 transition-all duration-300">
                  <img
                    src={project.coverImage}
                    alt={project.titleAr}
                    className="w-full h-full object-cover transform transition-all duration-500 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23475569" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3E❌%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-xs font-bold text-white bg-black/50 backdrop-blur-sm px-2 py-1 rounded">
                    <Image className="w-3 h-3" />
                    {project.images?.length || 0}
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 px-4 pb-4 space-y-3">
                {/* Project Title & Client */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white leading-tight group-hover:text-blue-200 transition-colors duration-300">
                    {project.typeLabelAr || project.typeLabelEn || project.typeLabel ? (
                      <span
                        className="inline-flex items-center align-middle me-2 rounded-full border border-slate-500/30 bg-slate-900/40 px-2.5 py-1 text-[11px] font-semibold text-slate-200 backdrop-blur"
                      >
                        {project.typeLabelAr || project.typeLabelEn || project.typeLabel}
                      </span>
                    ) : null}
                    {project.titleAr}
                  </h3>
                  
                  {project.clientName && (
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-blue-400" />
                      <span className="font-medium">{project.clientName}</span>
                    </div>
                  )}
                </div>

                {/* Category Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/80 to-blue-500/80 border border-blue-400/40 text-white text-sm font-medium">
                    {getMainCategory(project.mainCategory)?.labelAr || project.mainCategory}
                  </div>
                  {project.designType && (
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-grey-600/80 to-grey-500/80 border border-grey-400/40 text-white text-sm font-medium">
                      {getSubCategory(project.mainCategory, project.designType)?.labelAr || project.designType}
                    </div>
                  )}
                  {project.year && (
                    <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-600/80 to-amber-500/80 border border-amber-400/40 text-white text-sm font-medium">
                      {project.year}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                  {project.shortDescAr}
                </p>

                {/* Secondary Info Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {project.slug && (
                    <div className="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-600/60 text-slate-300 text-xs overflow-hidden">
                      <LinkIcon className="w-3 h-3 inline mr-1" />
                      <span className="truncate max-w-[100px]">{project.slug}</span>
                    </div>
                  )}
                  <div className="px-2 py-1 rounded-full bg-slate-800/70 border border-slate-600/60 text-slate-300 text-xs">
                    ترتيب: {project.sortOrder ?? 0}
                  </div>
                  {project.isHidden && (
                    <div className="px-2 py-1 rounded-full bg-red-800/60 border border-red-600/60 text-red-100 text-xs">
                      مخفي
                    </div>
                  )}
                  {project.technologiesAr?.length > 0 && (
                    <div className="px-2 py-1 rounded-full bg-blue-800/60 border border-blue-600/50 text-blue-200 text-xs">
                      تقنيات: {project.technologiesAr.length}
                    </div>
                  )}
                  {project.tagsAr?.length > 0 && (
                    <div className="px-2 py-1 rounded-full bg-cyan-800/60 border border-cyan-600/50 text-cyan-200 text-xs">
                      تاجات: {project.tagsAr.length}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 px-4 pb-4">
                <Button
                  variant="outline"
                  onClick={() => fillForm(project)}
                  className="flex-1 border-blue-600/50 hover:bg-blue-600/20 hover:text-blue-300 transition-all duration-300 rounded-lg h-10"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  تعديل
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleHideToggle(project)}
                  className={`flex-1 transition-all duration-300 rounded-lg h-10 border-slate-600/60 ${project.isHidden ? 'bg-slate-800/60 text-slate-200 hover:bg-slate-700' : 'hover:bg-amber-600/20 hover:text-amber-300'}`}
                >
                  {project.isHidden ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
                  {project.isHidden ? 'إظهار' : 'إخفاء'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDelete(project)}
                  className="flex-1 border-red-600/50 hover:bg-red-600/20 hover:text-red-300 transition-all duration-300 rounded-lg h-10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  حذف
                </Button>
              </div>
            </div>

            {/* Bottom Line Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>
          ))}
          {filteredProjects.length === 0 && (
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-900/90 via-slate-800/95 to-slate-900/90 border-2 border-dashed border-slate-600/60 p-12 text-center flex flex-col items-center justify-center gap-4 col-span-full rounded-2xl backdrop-blur-sm">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-600/50">
              <Sparkles className="w-12 h-12 text-slate-400" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">لا توجد مشاريع بعد</h3>
              <p className="text-slate-400">ابدأ بإضافة مشروعك الأول واستمتع بإدارة أعمالك</p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-grey-500 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-150" />
              </div>
            </div>
          </Card>
        )}
        </div>
      )}
    </div>

    <AlertDialog open={!!actionType} onOpenChange={(open) => { if (!open) closeActionDialog(); }}>
      <AlertDialogContent dir="rtl" className="bg-slate-900 border border-slate-700 text-right">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
            {actionType === 'delete' ? (
              <>
                <Trash2 className="w-5 h-5 text-red-400" />
                تأكيد الحذف
              </>
            ) : (
              <>
                {actionProject?.isHidden ? <Eye className="w-5 h-5 text-emerald-400" /> : <EyeOff className="w-5 h-5 text-amber-400" />}
                تأكيد التغيير
              </>
            )}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300">
            {actionType === 'delete'
              ? `سيتم حذف المشروع "${actionProject?.titleAr || ''}" نهائياً.`
              : `سيتم ${actionProject?.isHidden ? 'إظهار' : 'إخفاء'} المشروع "${actionProject?.titleAr || ''}" عن الموقع.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={actionLoading} className="border-slate-600 text-slate-200">
            إلغاء
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={actionLoading}
            onClick={handleConfirmAction}
            className={`flex items-center gap-2 ${actionType === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {actionType === 'delete' ? 'تأكيد الحذف' : actionProject?.isHidden ? 'إظهار' : 'إخفاء'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
