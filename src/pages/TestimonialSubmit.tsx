import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function TestimonialSubmit() {
  const { token } = useParams();
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [form, setForm] = useState({ name: '', clientName: '', logoUrl: '', rating: 5, message: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('الرابط غير صالح');
      return;
    }
    setSaving(true);
    try {
      await api.submitTestimonial({ inviteToken: token, ...form, rating: Number(form.rating) });
      toast.success('تم إرسال رأيك، شكراً لك');
      setForm({ name: '', clientName: '', logoUrl: '', rating: 5, message: '' });
    } catch (err: any) {
      toast.error(err?.message || 'تعذر إرسال الرأي');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 px-4" dir="rtl">
      <div className="max-w-xl w-full bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="space-y-2 text-right">
          <p className="text-sm text-slate-400">ماذا يقول عملائي عني</p>
          <h1 className="text-3xl font-bold text-white">أرسل تقييمك</h1>
          <p className="text-sm text-slate-400">أكتب رأيك بكل وضوح، والتقييم من 1 إلى 5 نجوم.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">اسمك</label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="اسمك الكامل"
              required
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">اسم مشروعك (اختياري)</label>
            <Input
              value={form.clientName}
              onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              placeholder="مثال: خالد - متجر النجاح"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">رابط الشعار (اختياري)</label>
            <Input
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              placeholder="https://example.com/logo.png"
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">التقييم</label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-200">رسالتك</label>
            <Textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder={isArabic ? 'كيف كانت تجربتك؟' : 'How was your experience?'}
              rows={4}
              required
              className="text-right"
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-primary">
            {saving ? 'جارٍ الإرسال...' : 'إرسال الرأي'}
          </Button>
        </form>
      </div>
    </div>
  );
}
