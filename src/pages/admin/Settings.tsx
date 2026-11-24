import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Settings, Globe, Mail, Palette, Link2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import LoadingSpinner from '@/components/admin/LoadingSpinner';

const emptySettings = {
  siteNameAr: '',
  siteNameEn: '',
  heroTitleAr: '',
  heroTitleEn: '',
  heroSubtitleAr: '',
  heroSubtitleEn: '',
  aboutShortAr: '',
  aboutShortEn: '',
  aboutLongAr: '',
  aboutLongEn: '',
  emailContact: '',
  phoneNumber: '',
  whatsappNumber: '',
  instagramUrl: '',
  behanceUrl: '',
  githubUrl: '',
  linkedinUrl: '',
  cvUrl: '',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E40AF',
  availabilityStatus: 'available',
};

type SettingsState = typeof emptySettings;

export default function AdminSettings() {
  const [settings, setSettings] = useState<SettingsState>(emptySettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      if (data) {
        setSettings({ ...emptySettings, ...data });
      }
    } catch {
      toast.error('فشل في جلب الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleChange = (key: keyof SettingsState, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings({
        siteNameAr: settings.siteNameAr,
        siteNameEn: settings.siteNameEn,
        heroTitleAr: settings.heroTitleAr,
        heroTitleEn: settings.heroTitleEn,
        heroSubtitleAr: settings.heroSubtitleAr,
        heroSubtitleEn: settings.heroSubtitleEn,
        aboutShortAr: settings.aboutShortAr,
        aboutShortEn: settings.aboutShortEn,
        aboutLongAr: settings.aboutLongAr,
        aboutLongEn: settings.aboutLongEn,
        emailContact: settings.emailContact,
        phoneNumber: settings.phoneNumber,
        whatsappNumber: settings.whatsappNumber,
        instagramUrl: settings.instagramUrl,
        behanceUrl: settings.behanceUrl,
        githubUrl: settings.githubUrl,
        linkedinUrl: settings.linkedinUrl,
        cvUrl: settings.cvUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        availabilityStatus: settings.availabilityStatus,
      });
      toast.success('تم حفظ الإعدادات');
    } catch {
      toast.error('فشل حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-transparent border border-slate-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-500/20 to-gray-500/20 border border-slate-500/30">
              <Settings className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-400 to-gray-400 bg-clip-text text-transparent">
                إعدادات الموقع
              </h1>
              <p className="text-muted-foreground mt-1">إدارة بيانات الموقع والتواصل والألوان بكفاءة عالية</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <LoadingSpinner message="جاري تحميل الإعدادات..." size="lg" />
          <div className="grid gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6 animate-pulse">
                <div className="space-y-4">
                  <div className="h-6 bg-slate-700/50 rounded w-1/4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-4 bg-slate-700/30 rounded w-full" />
                    <div className="h-10 bg-slate-700/50 rounded w-full" />
                    <div className="h-4 bg-slate-700/30 rounded w-full" />
                    <div className="h-10 bg-slate-700/50 rounded w-full" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <>
      {/* Availability */}
      <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-foreground">الحالة</h2>
        </div>
        <div className="flex items-center justify-between bg-background/50 border border-border/50 rounded-xl p-4">
          <div>
            <p className="font-semibold text-foreground">متاح للعمل</p>
            <p className="text-sm text-muted-foreground">اضبط حالتك للزائرين</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant={settings.availabilityStatus === 'available' ? 'default' : 'outline'}
              className={settings.availabilityStatus === 'available' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              onClick={() => handleChange('availabilityStatus', 'available')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              متاح
            </Button>
            <Button
              type="button"
              variant={settings.availabilityStatus === 'unavailable' ? 'default' : 'outline'}
              className={settings.availabilityStatus === 'unavailable' ? 'bg-rose-600 hover:bg-rose-700' : ''}
              onClick={() => handleChange('availabilityStatus', 'unavailable')}
            >
              <XCircle className="w-4 h-4 mr-2" />
              غير متاح
            </Button>
          </div>
        </div>
      </Card>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Identity Section */}
        <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">🌐 الهوية والنصوص الأساسية</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteNameAr" className="font-bold text-foreground">اسم الموقع (عربي)</Label>
              <Input 
                id="siteNameAr"
                value={settings.siteNameAr} 
                onChange={(e) => handleChange('siteNameAr', e.target.value)} 
                placeholder="اسم موقعك"
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteNameEn" className="font-bold text-foreground">Site Name (English)</Label>
              <Input 
                id="siteNameEn"
                value={settings.siteNameEn} 
                onChange={(e) => handleChange('siteNameEn', e.target.value)} 
                placeholder="Your site name"
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroTitleAr" className="font-bold text-foreground">عنوان الصفحة الرئيسية (عربي)</Label>
              <Input 
                id="heroTitleAr"
                value={settings.heroTitleAr} 
                onChange={(e) => handleChange('heroTitleAr', e.target.value)} 
                placeholder="عنوان مثير"
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroTitleEn" className="font-bold text-foreground">Hero Title (English)</Label>
              <Input 
                id="heroTitleEn"
                value={settings.heroTitleEn} 
                onChange={(e) => handleChange('heroTitleEn', e.target.value)} 
                placeholder="Catchy title"
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitleAr" className="font-bold text-foreground">وصف الصفحة الرئيسية (عربي)</Label>
              <Textarea 
                id="heroSubtitleAr"
                value={settings.heroSubtitleAr} 
                onChange={(e) => handleChange('heroSubtitleAr', e.target.value)} 
                placeholder="وصف جذاب"
                rows={2}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroSubtitleEn" className="font-bold text-foreground">Hero Description (English)</Label>
              <Textarea 
                id="heroSubtitleEn"
                value={settings.heroSubtitleEn} 
                onChange={(e) => handleChange('heroSubtitleEn', e.target.value)} 
                placeholder="Engaging description"
                rows={2}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* About Section */}
        <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-500/30">
              <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">📖 حول الموقع</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="aboutShortAr" className="font-bold text-foreground">نبذة قصيرة (عربي)</Label>
              <Textarea 
                id="aboutShortAr"
                value={settings.aboutShortAr} 
                onChange={(e) => handleChange('aboutShortAr', e.target.value)} 
                placeholder="نبذة قصيرة عنك"
                rows={2}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutShortEn" className="font-bold text-foreground">Short Bio (English)</Label>
              <Textarea 
                id="aboutShortEn"
                value={settings.aboutShortEn} 
                onChange={(e) => handleChange('aboutShortEn', e.target.value)} 
                placeholder="Brief bio about you"
                rows={2}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutLongAr" className="font-bold text-foreground">نبذة مطولة (عربي)</Label>
              <Textarea 
                id="aboutLongAr"
                value={settings.aboutLongAr} 
                onChange={(e) => handleChange('aboutLongAr', e.target.value)} 
                placeholder="نبذة مفصلة عنك"
                rows={4}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aboutLongEn" className="font-bold text-foreground">Long Bio (English)</Label>
              <Textarea 
                id="aboutLongEn"
                value={settings.aboutLongEn} 
                onChange={(e) => handleChange('aboutLongEn', e.target.value)} 
                placeholder="Detailed bio about you"
                rows={4}
                className="rounded-lg border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>
          </div>
        </Card>

        {/* Contact Section */}
        <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30">
              <Link2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">📞 التواصل والروابط</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emailContact" className="font-bold text-foreground">📧 البريد الإلكتروني</Label>
              <Input 
                id="emailContact"
                type="email"
                value={settings.emailContact} 
                onChange={(e) => handleChange('emailContact', e.target.value)} 
                placeholder="your@email.com"
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="font-bold text-foreground">📱 الهاتف</Label>
              <Input 
                id="phoneNumber"
                value={settings.phoneNumber} 
                onChange={(e) => handleChange('phoneNumber', e.target.value)} 
                placeholder="+966..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="font-bold text-foreground">💬 واتساب</Label>
              <Input 
                id="whatsappNumber"
                value={settings.whatsappNumber} 
                onChange={(e) => handleChange('whatsappNumber', e.target.value)} 
                placeholder="+966..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl" className="font-bold text-foreground">📸 Instagram</Label>
              <Input 
                id="instagramUrl"
                value={settings.instagramUrl} 
                onChange={(e) => handleChange('instagramUrl', e.target.value)} 
                placeholder="https://instagram.com/..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="behanceUrl" className="font-bold text-foreground">🎨 Behance</Label>
              <Input 
                id="behanceUrl"
                value={settings.behanceUrl} 
                onChange={(e) => handleChange('behanceUrl', e.target.value)} 
                placeholder="https://behance.net/..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="githubUrl" className="font-bold text-foreground">💻 Github</Label>
              <Input 
                id="githubUrl"
                value={settings.githubUrl} 
                onChange={(e) => handleChange('githubUrl', e.target.value)} 
                placeholder="https://github.com/..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl" className="font-bold text-foreground">💼 LinkedIn</Label>
              <Input 
                id="linkedinUrl"
                value={settings.linkedinUrl} 
                onChange={(e) => handleChange('linkedinUrl', e.target.value)} 
                placeholder="https://linkedin.com/..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvUrl" className="font-bold text-foreground">📄 السيرة الذاتية</Label>
              <Input 
                id="cvUrl"
                value={settings.cvUrl} 
                onChange={(e) => handleChange('cvUrl', e.target.value)} 
                placeholder="https://..."
                className="h-11 rounded-lg border-primary/20 focus:border-primary/50"
              />
            </div>
          </div>
        </Card>

        {/* Colors Section */}
        <Card className="relative overflow-hidden backdrop-blur-xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-pink-500/20 border border-pink-500/30">
              <Palette className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground">🎨 الألوان</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label htmlFor="primaryColor" className="font-bold text-foreground">اللون الأساسي</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="primaryColor"
                  type="color" 
                  value={settings.primaryColor} 
                  onChange={(e) => handleChange('primaryColor', e.target.value)} 
                  className="h-11 w-20 rounded-lg cursor-pointer"
                />
                <Input 
                  type="text"
                  value={settings.primaryColor} 
                  onChange={(e) => handleChange('primaryColor', e.target.value)} 
                  placeholder="#3B82F6"
                  className="h-11 flex-1 rounded-lg border-primary/20 focus:border-primary/50 font-mono text-sm"
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label htmlFor="secondaryColor" className="font-bold text-foreground">اللون الثانوي</Label>
              <div className="flex items-center gap-3">
                <Input 
                  id="secondaryColor"
                  type="color" 
                  value={settings.secondaryColor} 
                  onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                  className="h-11 w-20 rounded-lg cursor-pointer"
                />
                <Input 
                  type="text"
                  value={settings.secondaryColor} 
                  onChange={(e) => handleChange('secondaryColor', e.target.value)} 
                  placeholder="#1E40AF"
                  className="h-11 flex-1 rounded-lg border-primary/20 focus:border-primary/50 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={load} 
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" /> إعادة التحميل
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
            className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {saving ? '⏳ جاري الحفظ...' : '💾 حفظ الإعدادات'}
          </Button>
        </div>
      </form>
    </>
      )}
    </div>
  );
}


