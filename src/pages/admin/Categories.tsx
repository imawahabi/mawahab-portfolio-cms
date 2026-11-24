import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, FolderOpen, RefreshCw, ChevronDown, ChevronUp, Tag, Folder, Grid3X3, List, Eye, EyeOff } from 'lucide-react';
import { CategoryCardSkeleton } from '@/components/admin/LoadingSpinner';

type Category = {
  id: string;
  value: string;
  labelAr: string;
  labelEn: string;
  parentId?: string | null;
  sortOrder?: number;
  subcategories?: Category[];
  count?: number;
};

type ViewMode = 'tree' | 'cards';

const emptyForm = {
  slug: '',
  nameAr: '',
  nameEn: '',
  parentId: '__root__',
  sortOrder: 0,
};

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('tree');

  const { data: categoriesData, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: api.getCategories,
  });
  const categories = (categoriesData as any)?.main || [];

  const { parentMap, categoryMap } = useMemo(() => {
    const mapParent = new Map<string, string | null>();
    const mapCategory = new Map<string, Category>();

    const traverse = (cats: Category[], parentId: string | null = null) => {
      cats.forEach(cat => {
        mapCategory.set(cat.id, cat);
        mapParent.set(cat.id, parentId);
        if (cat.subcategories?.length) traverse(cat.subcategories, cat.id);
      });
    };

    traverse(categories);
    return { parentMap: mapParent, categoryMap: mapCategory };
  }, [categories]);

  // Debug logging to understand data structure
  console.log('📊 Categories Data:', categoriesData);
  console.log('📊 Categories Array:', categories);

  // Expand categories when data loads
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      const allMainCategoryIds = categories.map((cat: Category) => cat.id);
      setExpandedCategories(new Set(allMainCategoryIds));
    }
  }, [categories, expandedCategories.size]);

  const resolveParentId = (category: Category) => category.parentId ?? parentMap.get(category.id) ?? null;

  // Function to get all categories including subcategories for parent selection
  const getAllCategories = (): Category[] => {
    const result: Category[] = [];
    
    const addCategoryWithChildren = (cat: Category) => {
      result.push({
        ...cat,
        parentId: resolveParentId(cat),
      });
      if (cat.subcategories) {
        cat.subcategories.forEach(sub => addCategoryWithChildren(sub));
      }
    };
    
    categories.forEach(cat => addCategoryWithChildren(cat));
    return result;
  };

  // Function to get parent category name for display
  const getParentName = (category: Category): string => {
    console.log('🎯 Looking for parent of:', category.labelAr, 'with parentId:', category.parentId);
    
    const targetParentId = resolveParentId(category);

    if (!targetParentId) {
      console.log('🎯 No parentId, returning "تصنيف رئيسي"');
      return 'تصنيف رئيسي';
    }
    
    const parent = categoryMap.get(targetParentId);
    
    console.log('🎯 Searching in main categories for ID:', targetParentId);
    console.log('🎯 Found parent:', parent ? `${parent.labelAr} (ID: ${parent.id})` : 'NOT FOUND');
    
    return parent ? `${parent.labelAr}` : 'تصنيف رئيسي';
  };

  // Effect to populate form when modal opens for editing
  useEffect(() => {
    if (open) {
      if (editingId) {
        let categoryToEdit: Category | undefined;
        
        // Search in main categories and their subcategories
        const findCategory = (cats: Category[]): Category | undefined => {
          for (const cat of cats) {
            if (cat.id === editingId) return cat;
            if (cat.subcategories) {
              const found = findCategory(cat.subcategories);
              if (found) return found;
            }
          }
          return undefined;
        };
        
        categoryToEdit = findCategory(categories);
        
        if (categoryToEdit) {
          const parentId = resolveParentId(categoryToEdit);
          setForm({
            slug: categoryToEdit.value,
            nameAr: categoryToEdit.labelAr,
            nameEn: categoryToEdit.labelEn,
            parentId: parentId || '__root__',
            sortOrder: categoryToEdit.sortOrder || 0,
          });
        }
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, editingId, categories]);

  const mutation = useMutation({
    mutationFn: (payload: any) => 
      editingId 
        ? api.updateCategory(editingId, payload) 
        : api.createCategory(payload),
    onSuccess: () => {
      toast.success(`تم ${editingId ? 'تحديث' : 'إضافة'} التصنيف بنجاح`);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.message || `فشل في ${editingId ? 'تحديث' : 'إضافة'} التصنيف`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      toast.success('تم حذف التصنيف بنجاح');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error?.message || 'فشل في حذف التصنيف. قد يكون مرتبطًا بخدمات.');
    },
  });

  const handleOpenForEdit = (category: Category) => {
    setEditingId(category.id);
    setOpen(true);
  };
  
  const handleOpenForNew = () => {
    setEditingId(null);
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.slug.trim();
    if (!slug) {
      toast.error('الرجاء إدخال رابط صالح (slug)');
      return;
    }
    const payload = { ...form, parentId: form.parentId === '__root__' ? null : form.parentId };
    mutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      deleteMutation.mutate(id);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Tree View Component
  const renderTreeView = () => {
    const renderCategoryCard = (category: Category, isSub: boolean = false) => {
      const hasSubcategories = !isSub && category.subcategories && category.subcategories.length > 0;
      const isExpanded = expandedCategories.has(category.id);

      return (
        <motion.div key={category.id} layout="position" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
          <Card className={`p-4 transition-all duration-300 hover:shadow-lg ${isSub ? 'mr-8 bg-slate-800/50 border-slate-700 hover:bg-slate-800/70' : 'bg-slate-900/70 border-slate-700/80 hover:bg-slate-900/90'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {isSub ? <Tag className="w-4 h-4 text-cyan-400" /> : <Folder className="w-5 h-5 text-blue-400" />}
                <div className="font-bold text-white">{category.labelAr} | <span className="text-sm font-normal text-slate-400">{category.labelEn}</span></div>
                {hasSubcategories && (
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                    {category.subcategories?.length || 0} فرعي
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasSubcategories && (
                  <Button variant="ghost" size="icon" onClick={() => toggleExpand(category.id)}>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => handleOpenForEdit(category)} className="gap-2 border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-300">
                  <Pencil className="w-4 h-4" /> تعديل
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)} disabled={deleteMutation.isPending} className="gap-2">
                  <Trash2 className="w-4 h-4" /> حذف
                </Button>
              </div>
            </div>
          </Card>
          <AnimatePresence>
            {hasSubcategories && isExpanded && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                {category.subcategories?.map(sub => renderCategoryCard(sub, true))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      );
    };

    return (
      <div className="space-y-2">
        <AnimatePresence>
          {categories.map(category => renderCategoryCard(category))}
        </AnimatePresence>
      </div>
    );
  };

  // Cards View Component
  const renderCardsView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {categories.map(category => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/80 hover:border-blue-500/50 hover:shadow-xl transition-all duration-300 group">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{category.labelAr}</h3>
                        <p className="text-slate-400 text-sm">{category.labelEn}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 text-xs">
                      {category.subcategories?.length || 0} فرعي
                    </Badge>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                      ترتيب: {category.sortOrder || 0}
                    </Badge>
                  </div>

                  {/* Subcategories */}
                  {category.subcategories && category.subcategories.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-slate-400 text-sm">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="w-4 h-4" />
                          <span>التصنيفات الفرعية</span>
                        </div>
                        <Badge variant="outline" className="border-blue-500/50 text-blue-300">
                          {category.subcategories.length} عنصر
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {category.subcategories.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between rounded-lg border border-slate-700/70 bg-slate-800/60 px-3 py-2">
                            <div className="flex items-center gap-3">
                              <Tag className="w-4 h-4 text-cyan-400" />
                              <div>
                                <div className="text-white text-sm font-medium">{sub.labelAr}</div>
                                <div className="text-xs text-slate-400">{sub.labelEn}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenForEdit(sub)} className="hover:bg-blue-500/20 hover:text-blue-300">
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(sub.id)} disabled={deleteMutation.isPending} className="hover:bg-destructive/20 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-slate-700/60 bg-slate-800/40 p-3 text-center text-sm text-slate-500">
                      لا توجد تصنيفات فرعية بعد
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end pt-2 border-t border-slate-700/50 gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenForEdit(category)} className="gap-2 border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-300">
                      <Pencil className="w-4 h-4" /> تعديل
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(category.id)} disabled={deleteMutation.isPending} className="gap-2">
                      <Trash2 className="w-4 h-4" /> حذف
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header Card */}
      <Card className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/60">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">إدارة التصنيفات</h1>
              <p className="text-slate-400">إدارة التصنيفات الرئيسية والفرعية لمشاريعك وخدماتك.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-1">
              <Button
                variant={viewMode === 'tree' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className={`gap-2 ${viewMode === 'tree' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
                شجري
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={`gap-2 ${viewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
              >
                <Grid3X3 className="w-4 h-4" />
                كروت
              </Button>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenForNew} className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200">
                  <Plus className="w-4 h-4" /> إضافة تصنيف
                </Button>
              </DialogTrigger>
              
              {/* Enhanced Modal */}
              <DialogContent dir="rtl" className="sm:max-w-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/80 text-white shadow-2xl backdrop-blur-sm">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.2 }}>
                  <DialogHeader className="text-right items-end pb-6 border-b border-slate-700/50">
                    <motion.div 
                      className="flex items-center gap-3 flex-row-reverse"
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className={`p-2 rounded-lg ${editingId ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-blue-600 to-cyan-500'} shadow-lg`}>
                        {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                      </div>
                      <div className="text-right">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                          {editingId ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 mt-1">
                          {editingId ? 'قم بتحديث معلومات التصنيف أدناه' : 'أضف تصنيفًا جديدًا للنظام'}
                        </DialogDescription>
                      </div>
                    </motion.div>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-6 pt-6">
                    {/* Parent Category Selection - Fixed for subcategories */}
                    <motion.div 
                      className="space-y-3 text-right"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                    >
                      <Label htmlFor="parentId" className="text-slate-300 font-medium flex items-center gap-2">
                        <FolderOpen className="w-4 h-4 text-blue-400" />
                        التصنيف الرئيسي
                      </Label>
                      <Select value={form.parentId} onValueChange={(value) => setForm(f => ({ ...f, parentId: value }))}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 transition-colors text-right justify-between">
                          <SelectValue placeholder="اختر التصنيف الرئيسي" className="text-right w-full" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-600 text-right" dir="rtl">
                          <SelectItem value="__root__" className="text-slate-300 hover:bg-slate-700 text-right justify-end">-- تصنيف رئيسي (بدون) --</SelectItem>
                          {getAllCategories()
                            .filter(cat => cat.id !== editingId) // Exclude the category being edited
                            .map((cat) => (
                              <SelectItem key={cat.id} value={cat.id} className="text-slate-300 hover:bg-slate-700 text-right justify-end">
                                <span className="font-medium">{cat.parentId ? ' - ' : ''}{cat.labelAr}</span>
                                {cat.subcategories && cat.subcategories.length > 0 && ` (${cat.subcategories.length} فرعي)`}
                                <span className="text-xs text-slate-500">
                                  {' '}| {cat.parentId ? `فرعي من ${getParentName(cat)}` : 'تصنيف رئيسي'}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Names Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div 
                        className="space-y-3 text-right"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Label htmlFor="nameAr" className="text-slate-300 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-xs text-white">ع</span>
                          الاسم (عربي)
                        </Label>
                        <Input 
                          id="nameAr" 
                          value={form.nameAr} 
                          onChange={(e) => setForm(f => ({ ...f, nameAr: e.target.value }))} 
                          required 
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 focus:bg-slate-800 transition-colors text-right"
                          placeholder="أدخل الاسم بالعربية"
                        />
                      </motion.div>
                      <motion.div 
                        className="space-y-3 text-right"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.25 }}
                      >
                        <Label htmlFor="nameEn" className="text-slate-300 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xs text-white">EN</span>
                          الاسم (إنجليزي)
                        </Label>
                        <Input 
                          id="nameEn" 
                          value={form.nameEn} 
                          onChange={(e) => setForm(f => ({ ...f, nameEn: e.target.value }))} 
                          required 
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 focus:bg-slate-800 transition-colors text-right"
                          placeholder="Enter name in English"
                        />
                      </motion.div>
                    </div>

                    {/* Slug and Order Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.div 
                        className="space-y-3 text-right"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Label htmlFor="slug" className="text-slate-300 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs text-white">URL</span>
                          الرابط (slug)
                        </Label>
                        <Input 
                          id="slug" 
                          value={form.slug} 
                          onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} 
                          required 
                          disabled={!!editingId}
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 focus:bg-slate-800 transition-colors text-left font-mono"
                          placeholder="category-slug"
                        />
                      </motion.div>
                      <motion.div 
                        className="space-y-3 text-right"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35 }}
                      >
                        <Label htmlFor="sortOrder" className="text-slate-300 font-medium flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 flex items-center justify-center text-xs text-white">#</span>
                          ترتيب العرض
                        </Label>
                        <Input 
                          id="sortOrder" 
                          type="number" 
                          value={form.sortOrder} 
                          onChange={(e) => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} 
                          className="bg-slate-800/50 border-slate-600 hover:bg-slate-800/70 focus:bg-slate-800 transition-colors text-right"
                          placeholder="0"
                          min="0"
                        />
                      </motion.div>
                    </div>

                    <DialogFooter className="pt-6 flex justify-between items-center border-t border-slate-700/50">
                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => setOpen(false)}
                          className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                          إلغاء
                        </Button>
                      </motion.div>
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button 
                          type="submit" 
                          disabled={mutation.isPending}
                          className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 min-w-[140px]"
                        >
                          {mutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              جارٍ الحفظ...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {editingId ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                              حفظ التغييرات
                            </div>
                          )}
                        </Button>
                      </motion.div>
                    </DialogFooter>
                  </form>
                </motion.div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Card>

      {/* Content Card */}
      <Card className="p-6 bg-slate-900/50 border-slate-700/60">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <CategoryCardSkeleton key={i} />)}
          </div>
        ) : isError ? (
          <div className="text-center text-destructive p-8">فشل في تحميل التصنيفات.</div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <FolderOpen className="w-12 h-12 mx-auto mb-4" />
            <p>لا توجد تصنيفات. ابدأ بإضافة تصنيف جديد.</p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {viewMode === 'tree' ? (
                <motion.div key="tree" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderTreeView()}
                </motion.div>
              ) : (
                <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {renderCardsView()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </Card>
    </div>
  );
}
