import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send, Mail, MapPin, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CTAFormSkeleton } from './LoadingPlaceholders';
import { CategorySelector } from './CategorySelector';

export const CTASection = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const isArabic = i18n.language === 'ar';
  const loadingLabel = isArabic ? 'جاري الإرسال...' : 'Sending...';

  // Fetch settings from backend
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  // Fetch services from backend
  const { data: services = [], isLoading: isLoadingServices } = useQuery({
    queryKey: ['services'],
    queryFn: () => api.getServices(),
  });

  // Fetch categories from backend
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    retry: 1,
  });

  // Fallback categories in case API is unavailable
  const fallbackCategories = [
    { value: 'design', labelAr: 'التصميم', labelEn: 'Design' },
    { value: 'development', labelAr: 'التطوير', labelEn: 'Development' },
    { value: 'content', labelAr: 'المحتوى', labelEn: 'Content' },
  ];

  // Fallback services in case API is unavailable
  const fallbackServices = [
    {
      id: 'fallback-web',
      mainCategory: 'design',
      titleAr: 'تصميم مواقع ويب',
      titleEn: 'Web Design',
    },
    {
      id: 'fallback-social',
      mainCategory: 'design',
      titleAr: 'تصميم سوشيال ميديا',
      titleEn: 'Social Media Design',
    },
    {
      id: 'fallback-inventory',
      mainCategory: 'development',
      titleAr: 'نظام إدارة المخزون',
      titleEn: 'Inventory System',
    },
  ];

  // Group services by their main category
  const serviceGroups = useMemo(() => {
    const groups: Record<string, { label: string; services: any[] }> = {};
    const mainMap: Record<string, { labelAr?: string; labelEn?: string }> = {};

    // Create a map of category values to their labels
    (categories?.main || fallbackCategories).forEach((cat: any) => {
      mainMap[cat.value] = { labelAr: cat.labelAr, labelEn: cat.labelEn };
    });

    // Use fetched services or fallback services
    const serviceList = services.length ? services : fallbackServices;

    // Group services by their main category
    serviceList.forEach((svc: any) => {
      const key = svc.mainCategory || 'other';
      const label = isArabic
        ? svc.mainCategoryLabelAr || mainMap[key]?.labelAr || key
        : svc.mainCategoryLabelEn || mainMap[key]?.labelEn || key;

      if (!groups[key]) groups[key] = { label, services: [] };
      groups[key].services.push(svc);
    });

    return Object.values(groups);
  }, [services, isArabic, categories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('whatsapp') as string;
    const categoryId = formData.get('categoryId') as string;
    const notes = formData.get('notes') as string;

    // Find the selected category to include its name in the message
    const selectedCategory = categories?.main?.find((cat: any) => cat.value === categoryId);
    const categoryName = selectedCategory
      ? (isArabic ? selectedCategory.labelAr : selectedCategory.labelEn)
      : categoryId;

    const message = `Category: ${categoryName}${categoryId ? ` (ID: ${categoryId})` : ''}\n\nNotes: ${notes}`;

    try {
      if (api.createMessage) {
        await api.createMessage({
          name,
          email,
          phone: phone || undefined,
          message,
        });
      }

      toast({
        title: t('ctaFormSuccessTitle'),
        description: t('ctaFormSuccessDesc'),
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error('CTA Message error:', error);
      toast({
        title: t('ctaFormSuccessTitle'),
        description: t('ctaFormSuccessDesc'),
      });
      (e.target as HTMLFormElement).reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t('ctaText')}
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-card/80 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden"
          >
            {((loadingSettings && !settings) || (isLoadingServices && services.length === 0) || (isLoadingCategories && !categories)) ? (
              <CTAFormSkeleton />
            ) : (
              <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
              {/* Left Side - Contact & Visual */}
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 p-12 flex flex-col justify-center">

                <div className="relative z-10 space-y-8">
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-foreground">{t('letsConnect')}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {t('connectDescription')}
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* WhatsApp */}
                    {settings?.whatsappNumber && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <MessageCircle className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">{t('whatsapp')}</p>
                          <a
                            href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lg font-bold hover:text-green-400 transition-colors"
                          >
                            {settings.whatsappNumber}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Email */}
                    {settings?.emailContact && (
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Mail className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">{t('email')}</p>
                          <a
                            href={`mailto:${settings.emailContact}`}
                            className="text-lg font-bold hover:text-blue-400 transition-colors"
                          >
                            {settings.emailContact}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground font-medium">{t('location')}</p>
                        <p className="text-lg font-bold">{t('locationValue')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Response time badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">{t('usuallyResponds')}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="p-12 flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="cta-name" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {t('ctaFormName')}
                      </Label>
                      <Input
                        id="cta-name"
                        name="name"
                        required
                        placeholder={t('ctaFormNamePlaceholder')}
                        className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-300 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="cta-email" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {t('ctaFormEmail')}
                      </Label>
                      <Input
                        id="cta-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-300 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="cta-whatsapp" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {t('ctaFormWhatsapp')}
                      </Label>
                      <Input
                        id="cta-whatsapp"
                        name="whatsapp"
                        placeholder={t('ctaFormWhatsappPlaceholder')}
                        className="bg-background/50 border-border/50 focus:border-primary focus:bg-background transition-all duration-300 h-12 rounded-xl"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="cta-category" className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary" />
                        {t('ctaFormService')}
                      </Label>
                      <CategorySelector
                        name="categoryId"
                        value={undefined}
                        onChange={(value) => {
                          // Update the hidden input value
                          const hiddenInput = document.querySelector('input[name="categoryId"]') as HTMLInputElement;
                          if (hiddenInput) {
                            hiddenInput.value = value;
                          }
                        }}
                        placeholder={isArabic ? 'اختر فئة الخدمة' : 'Select service category'}
                        className="w-full"
                      />
                      <input type="hidden" name="categoryId" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="cta-notes" className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-primary" />
                      {t('ctaFormNotes')}
                    </Label>
                    <Textarea
                      id="cta-notes"
                      name="notes"
                      required
                      rows={4}
                      placeholder={t('ctaFormNotesPlaceholder')}
                      className="bg-background/50 border-border/50 focus:border-primary focus:bg-background resize-none transition-all duration-300 rounded-xl"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 font-semibold h-14 rounded-xl text-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {loadingLabel}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t('ctaFormSubmit')}
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
