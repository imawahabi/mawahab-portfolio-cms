import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Check, Copy, Loader2, RefreshCw, Star, StarOff, Trash2, X, Link as LinkIcon } from 'lucide-react';

type Testimonial = {
  id: string;
  inviteToken: string;
  name: string;
  clientName?: string | null;
  logoUrl?: string | null;
  rating: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
};

type Invite = {
  id: string;
  token: string;
  createdAt: string;
  usedAt?: string | null;
  used: boolean;
};

const statusLabels: Record<Testimonial['status'], string> = {
  pending: 'بانتظار الموافقة',
  approved: 'مقبول',
  rejected: 'مرفوض',
};

const statusColors: Record<Testimonial['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  approved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  rejected: 'bg-red-500/15 text-red-400 border-red-500/30',
};

const formatDate = (value?: string) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('ar-UK', { year: 'numeric', month: 'short', day: 'numeric' });
};

const emptyEdit = {
  id: '',
  name: '',
  clientName: '',
  logoUrl: '',
  rating: 5,
  message: '',
  status: 'pending' as Testimonial['status'],
};

const Rating = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1 justify-end">
    {Array.from({ length: 5 }).map((_, idx) => {
      const filled = idx < Math.round(Number(value) || 0);
      return (
        <Star
          key={idx}
          className={`w-4 h-4 ${filled ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`}
        />
      );
    })}
  </div>
);

export default function AdminTestimonials() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<'all' | Testimonial['status']>('all');
  const [search, setSearch] = useState('');
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ ...emptyEdit });

  const { data: testimonials = [], isLoading, isFetching } = useQuery({
    queryKey: ['testimonials', statusFilter],
    queryFn: () =>
      api.getTestimonials(
        statusFilter === 'all'
          ? undefined
          : {
              status: statusFilter,
            },
      ),
  });

  const { data: invites = [], isFetching: fetchingInvites } = useQuery({
    queryKey: ['testimonial-invites'],
    queryFn: () => api.getTestimonialInvites(),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return testimonials;
    const term = search.toLowerCase();
    return testimonials.filter(
      (t: Testimonial) => t.name?.toLowerCase().includes(term) || t.message?.toLowerCase().includes(term),
    );
  }, [search, testimonials]);

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Testimonial['status'] }) => api.updateTestimonialStatus(id, status),
    onSuccess: () => {
      toast.success('تم تحديث الحالة');
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('فشل تحديث الحالة'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.deleteTestimonial(id),
    onSuccess: () => {
      toast.success('تم الحذف');
      qc.invalidateQueries({ queryKey: ['testimonials'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('فشل الحذف'),
  });

  const inviteMut = useMutation({
    mutationFn: () => api.createTestimonialInvite(),
    onSuccess: (data) => {
      const link = `${window.location.origin}/testimonial/${data.token}`;
      navigator.clipboard?.writeText(link).catch(() => {});
      toast.success('تم إنشاء رابط الدعوة ونسخه', { description: link });
      setLastLink(link);
      qc.invalidateQueries({ queryKey: ['testimonial-invites'] });
    },
    onError: () => toast.error('فشل إنشاء رابط الدعوة'),
  });

  const deleteInviteMut = useMutation({
    mutationFn: (id: string) => api.deleteTestimonialInvite(id),
    onSuccess: () => {
      toast.success('تم حذف الرابط');
      qc.invalidateQueries({ queryKey: ['testimonial-invites'] });
    },
    onError: (err: any) => toast.error(err?.message || 'لا يمكن حذف الرابط'),
  });

  const empty = filtered.length === 0;

  const startEdit = (t: Testimonial) => {
    setEditForm({
      id: t.id,
      name: t.name || '',
      clientName: t.clientName || '',
      logoUrl: t.logoUrl || '',
      rating: Number(t.rating) || 5,
      message: t.message || '',
      status: t.status,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!editForm.id) return;
    try {
      await api.updateTestimonial(editForm.id, {
        name: editForm.name,
        clientName: editForm.clientName || null,
        logoUrl: editForm.logoUrl || null,
        rating: Number(editForm.rating) || 5,
        message: editForm.message,
        status: editForm.status,
      });
      toast.success('تم تحديث الرأي');
      setEditOpen(false);
      qc.invalidateQueries({ queryKey: ['testimonials'] });
    } catch (err: any) {
      toast.error(err?.message || 'فشل التحديث');
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-transparent border border-amber-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-amber-500/30">
              <Star className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                آراء العملاء
              </h1>
              <p className="text-muted-foreground mt-1">إدارة تقييمات عملائي والتحكم في نشرها بكفاءة عالية</p>
            </div>
          </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="ابحث بالاسم أو المحتوى"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Button onClick={() => inviteMut.mutate()} disabled={inviteMut.isPending} className="gap-2">
            {inviteMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Copy className="w-4 h-4" />}
            إنشاء رابط دعوة
          </Button>
          <Button variant="ghost" onClick={() => qc.invalidateQueries({ queryKey: ['testimonials'] })}>
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((key) => (
          <Button
            key={key}
            size="sm"
            variant={statusFilter === key ? 'default' : 'outline'}
            onClick={() => setStatusFilter(key)}
            className="capitalize"
          >
            {key === 'all' ? 'الكل' : statusLabels[key]}
          </Button>
        ))}
      </div>

      {lastLink && (
        <Card className="p-4 flex flex-wrap items-center gap-3 border border-emerald-500/30 bg-emerald-900/10">
          <div className="text-sm text-slate-200 flex-1 text-right break-all">{lastLink}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigator.clipboard
                ?.writeText(lastLink)
                .then(() => toast.success('تم النسخ'))
                .catch(() => toast.error('فشل النسخ'))
            }
            className="gap-2"
          >
            <Copy className="w-4 h-4" />
            نسخ الرابط
          </Button>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6 border border-slate-700/60 bg-slate-900/70">
          <div className="flex items-center gap-3 text-slate-200">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="font-semibold">جاري تحميل الآراء...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="rounded-xl border border-slate-700/50 bg-slate-800/60 p-4 space-y-3 animate-pulse">
                <div className="h-4 w-24 bg-slate-700/70 rounded" />
                <div className="h-5 w-32 bg-slate-700/70 rounded" />
                <div className="h-4 w-full bg-slate-700/70 rounded" />
                <div className="h-4 w-3/4 bg-slate-700/70 rounded" />
                <div className="flex gap-2">
                  <div className="h-8 w-16 bg-slate-700/70 rounded" />
                  <div className="h-8 w-16 bg-slate-700/70 rounded" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : empty ? (
        <Card className="p-10 text-center space-y-3 border-dashed border-2 border-primary/30">
          <p className="text-lg font-semibold text-foreground">لا توجد آراء بعد</p>
          <p className="text-muted-foreground">أنشئ رابط دعوة وأرسله لعميلك ليكتب رأيه</p>
          <Button onClick={() => inviteMut.mutate()} className="gap-2">
            <Copy className="w-4 h-4" />
            إنشاء رابط دعوة
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t: Testimonial) => (
            <Card
              key={t.id}
              className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/60 p-6 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-right flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Badge className={statusColors[t.status]} variant="outline">
                      {statusLabels[t.status]}
                    </Badge>
                    <Rating value={t.rating} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{t.name}</h3>
                  {t.clientName && <p className="text-sm text-slate-400">{t.clientName}</p>}
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-4">{t.message}</p>
                  <p className="text-xs text-slate-500 mt-2">أضيفت في {formatDate(t.createdAt)}</p>
                </div>
                {t.logoUrl && (
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 bg-slate-800 flex-shrink-0">
                    <img src={t.logoUrl} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                )}
                {!t.logoUrl && (
                  <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
                    {t.name?.charAt(0) || 'م'}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-end">
                {t.status !== 'approved' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => statusMut.mutate({ id: t.id, status: 'approved' })}
                    disabled={statusMut.isPending}
                    className="gap-1 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/15"
                  >
                    <Check className="w-4 h-4" />
                    قبول
                  </Button>
                )}
                {t.status !== 'rejected' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => statusMut.mutate({ id: t.id, status: 'rejected' })}
                    disabled={statusMut.isPending}
                    className="gap-1 border-red-500/40 text-red-400 hover:bg-red-500/15"
                  >
                    <X className="w-4 h-4" />
                    رفض
                  </Button>
                )}
                {t.status !== 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => statusMut.mutate({ id: t.id, status: 'pending' })}
                    disabled={statusMut.isPending}
                    className="gap-1 border-amber-500/40 text-amber-400 hover:bg-amber-500/15"
                  >
                    انتظار
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => startEdit(t)}
                  className="gap-1 border-blue-500/40 text-blue-300 hover:bg-blue-500/15"
                >
                  <StarOff className="w-4 h-4" />
                  تعديل
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (confirm('حذف هذا الرأي؟')) deleteMut.mutate(t.id);
                  }}
                  disabled={deleteMut.isPending}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invites list at bottom */}
      <Card className="p-5 border border-slate-700/50 bg-slate-900/60" dir="rtl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">روابط الدعوة</h3>
            <p className="text-sm text-slate-400">أحدث ٥ روابط وهل تم استخدامها أم لا</p>
          </div>
          <Button variant="ghost" onClick={() => qc.invalidateQueries({ queryKey: ['testimonial-invites'] })}>
            <RefreshCw className={`w-4 h-4 ${fetchingInvites ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {invites.length === 0 ? (
          <p className="text-sm text-slate-400">لا توجد روابط دعوة بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-right text-sm" dir="rtl">
              <thead className="text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="py-2 text-right">الرابط</th>
                  <th className="py-2 text-right">التاريخ</th>
                  <th className="py-2 text-right">الحالة</th>
                  <th className="py-2 text-right">نسخ</th>
                  <th className="py-2 text-right">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {invites.map((inv: Invite) => {
                  const link = `${window.location.origin}/testimonial/${inv.token}`;
                  return (
                    <tr key={inv.id}>
                      <td className="py-3 max-w-xs text-right">
                        <div className="flex items-center gap-2 justify-end text-right">
                          <LinkIcon className="w-4 h-4 text-slate-500" />
                          <span className="text-slate-200 truncate">{link}</span>
                        </div>
                      </td>
                      <td className="py-3 text-slate-400 text-right">{formatDate(inv.createdAt)}</td>
                      <td className="py-3 text-right">
                        <Badge className={inv.used ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'}>
                          {inv.used ? 'تم الاستخدام' : 'لم يُستخدم'}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard?.writeText(link).then(() => toast.success('تم النسخ')).catch(() => toast.error('فشل النسخ'));
                          }}
                          className="gap-2"
                        >
                          <Copy className="w-4 h-4" />
                          نسخ
                        </Button>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={inv.used || deleteInviteMut.isPending}
                          onClick={() => {
                            if (inv.used) return;
                            if (confirm('حذف هذا الرابط؟')) deleteInviteMut.mutate(inv.id);
                          }}
                          className="text-red-400 hover:text-red-300 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditForm({ ...emptyEdit }); }}>
        <DialogContent className="max-w-xl bg-slate-900 border-slate-700 text-right" dir="rtl">
          <DialogHeader className="text-right flex flex-col gap-1 sm:flex-row-reverse sm:items-center sm:justify-between">
            <div>
              <DialogTitle>تعديل رأي عميل</DialogTitle>
              <DialogDescription>يمكنك تعديل بيانات الرأي والحالة.</DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">الاسم</Label>
                <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                        <Label htmlFor="edit-company">العميل</Label>
                <Input id="edit-company" value={editForm.clientName} onChange={(e) => setEditForm({ ...editForm, clientName: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-logo">رابط اللوجو</Label>
              <Input id="edit-logo" value={editForm.logoUrl} onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-rating">التقييم (1-5)</Label>
                <Input
                  id="edit-rating"
                  type="number"
                  min={1}
                  max={5}
                  value={editForm.rating}
                  onChange={(e) => setEditForm({ ...editForm, rating: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">الحالة</Label>
                <select
                  id="edit-status"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Testimonial['status'] })}
                  className="w-full rounded-md border border-slate-700 bg-slate-800 text-white h-10 px-3"
                >
                  <option value="pending">بانتظار الموافقة</option>
                  <option value="approved">مقبول</option>
                  <option value="rejected">مرفوض</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-message">المحتوى</Label>
              <Textarea
                id="edit-message"
                value={editForm.message}
                onChange={(e) => setEditForm({ ...editForm, message: e.target.value })}
                rows={4}
                className="border-slate-700 bg-slate-800"
              />
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setEditOpen(false)}>إلغاء</Button>
            <Button onClick={saveEdit}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
