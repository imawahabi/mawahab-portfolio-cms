import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, StickyNote, Calendar, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const emptyForm = {
  title: '',
  description: '',
  dueDate: '',
};

type FormState = typeof emptyForm;

type Note = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  createdAt?: string;
};

export default function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getNotes();
      setNotes(data);
    } catch {
      console.error('Failed to load notes');
      toast.error('فشل في جلب الملاحظات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const fillForm = (note: Note) => {
    setEditingId(note.id);
    setForm({ title: note.title, description: note.description || '', dueDate: note.dueDate || '' });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { title: form.title, description: form.description, dueDate: form.dueDate || null };
      if (editingId) {
        await api.updateNote(editingId, payload);
        toast.success('تم التحديث');
      } else {
        await api.createNote(payload);
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
    if (!confirm('حذف الملاحظة؟')) return;
    try {
      await api.deleteNote(id);
      toast.success('تم الحذف');
      load();
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const isOverdue = (dueDate: string | undefined) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent border border-purple-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
              <StickyNote className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                الملاحظات والمهام
              </h1>
              <p className="text-muted-foreground mt-1">إدارة المهام والملاحظات مع تواريخ مستهدفة بكفاءة عالية</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-4">
            <div className="relative z-10 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">إجمالي الملاحظات</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{notes.length}</p>
            </div>
          </Card>
          <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 p-4">
            <div className="relative z-10 space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">مهام متأخرة</p>
              <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                {notes.filter(n => isOverdue(n.dueDate)).length}
              </p>
            </div>
          </Card>
        </div>

      {/* Add Button */}
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="w-4 h-4" /> ملاحظة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg backdrop-blur-xl bg-gradient-to-b from-background to-muted/20 border-primary/20 p-0" dir="rtl">
            <DialogHeader className="pb-6 border-b border-primary/10 bg-gradient-to-l from-primary/5 to-transparent px-8 py-6 -mx-8 -mt-8 flex flex-row-reverse justify-end">
              <div className="space-y-2 text-right pt-8 pr-4">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent flex items-center gap-2">
                  {editingId ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {editingId ? 'تعديل ملاحظة' : 'ملاحظة جديدة'}
                </DialogTitle>
                <DialogDescription className="text-base text-muted-foreground">
                  {editingId ? 'حدّث ملاحظتك' : 'أضف ملاحظة جديدة مع تاريخ مستهدف'}
                </DialogDescription>
              </div>
            </DialogHeader>
            <form className="space-y-6 px-8 py-6" onSubmit={handleSubmit}>
              <div className="space-y-3">
                <Label htmlFor="title" className="font-bold text-foreground flex items-center gap-2">
                  <StickyNote className="w-4 h-4 text-primary" />
                  <span>العنوان</span>
                </Label>
                <Input 
                  id="title"
                  value={form.title} 
                  onChange={(e) => setForm({ ...form, title: e.target.value })} 
                placeholder="عنوان الملاحظة"
                required 
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="font-bold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>الوصف</span>
                </Label>
                <Textarea 
                  id="description"
                  value={form.description} 
                  onChange={(e) => setForm({ ...form, description: e.target.value })} 
                placeholder="اكتب تفاصيل الملاحظة"
                rows={3}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="dueDate" className="font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>تاريخ محدد</span>
                </Label>
                <Input 
                  id="dueDate"
                  type="date" 
                value={form.dueDate} 
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
              </div>
              <div className="flex gap-3 pt-4 border-t border-primary/10">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => { setOpen(false); resetForm(); }}
                  className="flex-1 h-11 border-slate-600 text-slate-200 hover:bg-slate-800"
                >
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70 gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    'حفظ'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      {/* Notes Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="space-y-6 lg:col-span-3">
            <LoadingSpinner message="جاري تحميل الملاحظات..." size="lg" />
            <div className="grid lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 animate-pulse">
                  <div className="space-y-4">
                    <div className="h-6 bg-slate-700/50 rounded w-3/4" />
                    <div className="h-4 bg-slate-700/30 rounded w-full" />
                    <div className="h-4 bg-slate-700/30 rounded w-2/3" />
                    <div className="h-8 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : notes.length === 0 ? (
          <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 p-12 text-center flex flex-col items-center justify-center gap-4 lg:col-span-3">
            <StickyNote className="w-12 h-12 text-primary/50" />
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">لا توجد ملاحظات</p>
              <p className="text-sm text-muted-foreground">ابدأ بإضافة ملاحظتك الأولى الآن</p>
            </div>
          </Card>
        ) : (
          notes.map((note) => {
            const overdue = isOverdue(note.dueDate);
            const daysUntilDue = note.dueDate 
              ? Math.ceil((new Date(note.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;
            
            return (
              <Card 
                key={note.id} 
                className={`relative overflow-hidden backdrop-blur-xl border transition-all duration-300 group flex flex-col gap-4 p-5 ${
                  overdue 
                    ? 'bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 hover:border-red-500/40'
                    : 'bg-gradient-to-br from-slate-500/10 to-slate-600/5 border-slate-500/20 hover:border-primary/40'
                }`}
              >
                {/* Hover Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className={`absolute inset-0 ${overdue ? 'bg-red-500/5' : 'bg-primary/5'}`}></div>
                </div>

                {/* Content */}
                <div className="relative z-10 space-y-3">
                  {/* Header */}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-foreground line-clamp-2">{note.title}</h3>
                    {note.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{note.description}</p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="space-y-2 text-xs">
                    {note.dueDate && (
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${
                        overdue 
                          ? 'bg-red-500/20 text-red-300 dark:text-red-300' 
                          : 'bg-blue-500/20 text-blue-100 dark:text-blue-300'
                      }`}>
                        <Calendar className="w-4 h-4" />
                        <span>
                          {overdue
                            ? `متأخر بـ ${Math.abs(daysUntilDue || 0)} أيام`
                            : daysUntilDue === 0
                            ? 'اليوم'
                            : daysUntilDue === 1
                            ? 'غداً'
                            : `${daysUntilDue} أيام`}
                        </span>
                      </div>
                    )}
                    {note.createdAt && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Pencil className="w-3 h-3" />
                        <span>أضيف: {new Date(note.createdAt).toLocaleDateString('ar-UK')}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="relative z-10 flex items-center justify-end gap-2 pt-2 border-t border-primary/10">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => fillForm(note)} 
                    className="gap-1 hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="w-4 h-4" /> تعديل
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDelete(note.id)} 
                    className="gap-1 hover:bg-red-500/10 hover:text-red-600 text-red-500"
                  >
                    <Trash2 className="w-4 h-4" /> حذف
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
