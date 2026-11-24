import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  mainCategory?: string;
  subCategory?: string;
  message: string;
}

export default function Contact() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [otherMainText, setOtherMainText] = useState('');

  // Fetch settings and services from backend
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
    retry: 1,
  });

  // Fallback data in case the API is unavailable (keeps the dropdown usable)
  const fallbackCategories = [
    { 
      value: 'design', 
      labelAr: 'التصميم', 
      labelEn: 'Design',
      subcategories: [
        { value: 'web', labelAr: 'تصميم مواقع', labelEn: 'Web Design' },
        { value: 'brand', labelAr: 'هوية بصرية', labelEn: 'Branding' },
        { value: 'social', labelAr: 'سوشيال ميديا', labelEn: 'Social Media' },
      ],
    },
    { 
      value: 'development', 
      labelAr: 'التطوير', 
      labelEn: 'Development',
      subcategories: [
        { value: 'web-app', labelAr: 'تطبيقات ويب', labelEn: 'Web Apps' },
        { value: 'mobile', labelAr: 'تطبيقات جوال', labelEn: 'Mobile Apps' },
        { value: 'dashboard', labelAr: 'لوحات تحكم', labelEn: 'Dashboards' },
      ],
    },
    { 
      value: 'content', 
      labelAr: 'المحتوى', 
      labelEn: 'Content',
      subcategories: [
        { value: 'writing', labelAr: 'كتابة محتوى', labelEn: 'Content Writing' },
        { value: 'seo', labelAr: 'تحسين محركات البحث', labelEn: 'SEO' },
      ],
    },
  ];
  const resolvedCategories = useMemo(() => {
    if (categories?.main && categories.main.length) return categories.main;
    return !isLoadingCategories ? fallbackCategories : [];
  }, [categories, isLoadingCategories]);

  const getMainLabel = (value?: string | null) => {
    if (value === 'custom-other') {
      return otherMainText || (isArabic ? 'أخرى / مخصصة' : 'Other / Custom');
    }
    if (!value) return '';
    const found = resolvedCategories.find((cat: any) => cat.value === value);
    return found ? (isArabic ? found.labelAr : found.labelEn) : value;
  };

  const getSubLabel = (value?: string | null, mainValue?: string | null) => {
    if (!value) return '';
    const main = resolvedCategories.find((cat: any) => cat.value === (mainValue || mainCategory));
    const found = main?.subcategories?.find((sub: any) => sub.value === value);
    return found ? (isArabic ? found.labelAr : found.labelEn) : value;
  };

  const subcategoryOptions = useMemo(() => {
    const main = resolvedCategories.find((cat: any) => cat.value === mainCategory);
    return main?.subcategories || [];
  }, [resolvedCategories, mainCategory]);

  const ContactInfoSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, idx) => (
        <div key={idx} className="p-6 rounded-xl bg-card glow-border space-y-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string;
    const mainCategoryValue = (formData.get('mainCategory') as string) || mainCategory;
    const subCategoryValue = mainCategoryValue === 'custom-other' ? '' : ((formData.get('subCategory') as string) || subCategory);
    const customOtherText = (formData.get('otherMainText') as string) || otherMainText;
    const selectedServiceLabel = mainCategoryValue
      ? mainCategoryValue === 'custom-other'
        ? (customOtherText || (isArabic ? 'أخرى / مخصصة' : 'Other / Custom'))
        : `${getMainLabel(mainCategoryValue)}${subCategoryValue ? ` - ${getSubLabel(subCategoryValue, mainCategoryValue)}` : ''}`
      : '';

    try {
      if (api.createMessage) {
        await api.createMessage({
          name,
          email,
          phone: phone || undefined,
          mainCategory: mainCategoryValue || undefined,
          subCategory: subCategoryValue || undefined,
          message: message,
          selectedService: selectedServiceLabel || undefined,
          otherMainText: mainCategoryValue === 'custom-other' ? (customOtherText || undefined) : undefined,
        });
      }

      toast({
        title: isArabic ? 'تم الإرسال بنجاح!' : 'Sent successfully!',
        description: isArabic
          ? 'سأتواصل معك قريباً'
          : "I'll get back to you soon",
      });
      (e.target as HTMLFormElement).reset();
      setMainCategory('');
      setSubCategory('');
      setOtherMainText('');
    } catch (error) {
      console.error('Message error:', error);
      toast({
        title: isArabic ? 'تم الإرسال بنجاح!' : 'Sent successfully!',
        description: isArabic
          ? 'سأتواصل معك قريباً'
          : "I'll get back to you soon",
      });
      (e.target as HTMLFormElement).reset();
      setMainCategory('');
      setSubCategory('');
      setOtherMainText('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto space-y-6 mb-16"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold">
                {isArabic ? 'تواصل معي' : 'Get In Touch'}
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                {isArabic
                  ? 'عندك فكرة مشروع؟ خلنا نتكلم ونحولها لواقع'
                  : 'Have a project idea? Let\'s talk and make it reality'}
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="order-2 lg:order-1"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {isArabic ? 'الاسم' : 'Name'}
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      placeholder={isArabic ? 'اسمك الكريم' : 'Your name'}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {isArabic ? 'البريد الإلكتروني' : 'Email'}
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder={isArabic ? 'your@email.com' : 'your@email.com'}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {isArabic ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      placeholder={isArabic ? '+965 XXXX XXXX' : '+965 XXXX XXXX'}
                      className="bg-card border-border"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mainCategory">
                        {isArabic ? 'التصنيف الرئيسي' : 'Main category'}
                      </Label>
                      <Select
                        value={mainCategory}
                        onValueChange={(value) => {
                          setMainCategory(value);
                          setSubCategory('');
                        }}
                      >
                        <SelectTrigger className={`bg-card border-border ${isArabic ? 'text-right' : ''}`} dir="auto">
                          <SelectValue placeholder={isArabic ? 'اختر التصنيف' : 'Select category'} />
                        </SelectTrigger>
                        <SelectContent className={`bg-card border-border ${isArabic ? 'text-right' : 'text-left'}`} dir="auto">
                          {resolvedCategories.map((cat: any) => (
                            <SelectItem key={cat.value} value={cat.value} className={isArabic ? 'text-right' : 'text-left'}>
                              {isArabic ? cat.labelAr : cat.labelEn}
                            </SelectItem>
                          ))}
                          <SelectItem value="custom-other" className={isArabic ? 'text-right' : 'text-left'}>
                            {isArabic ? 'أخرى / مخصصة' : 'Other / Custom'}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subCategory">
                        {isArabic ? 'التصنيف الفرعي (اختياري)' : 'Subcategory (optional)'}
                      </Label>
                      <Select
                        value={subCategory}
                        onValueChange={setSubCategory}
                        disabled={!mainCategory || mainCategory === 'custom-other' || subcategoryOptions.length === 0}
                      >
                        <SelectTrigger className={`bg-card border-border ${isArabic ? 'text-right' : ''}`} dir="auto">
                          <SelectValue placeholder={isArabic ? 'اختر تصنيفاً فرعياً' : 'Select a subcategory'} />
                        </SelectTrigger>
                        <SelectContent className={`bg-card border-border ${isArabic ? 'text-right' : 'text-left'}`} dir="auto">
                          {subcategoryOptions.length === 0 ? (
                            <div className={`px-3 py-2 text-sm text-muted-foreground ${isArabic ? 'text-right' : 'text-left'}`}>
                              {isArabic ? 'لا توجد تصنيفات فرعية' : 'No subcategories available'}
                            </div>
                          ) : (
                            subcategoryOptions.map((sub: any) => (
                              <SelectItem key={sub.value} value={sub.value} className={isArabic ? 'text-right' : 'text-left'}>
                                {isArabic ? sub.labelAr : sub.labelEn}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {mainCategory === 'custom-other' && (
                    <div className="space-y-2">
                      <Label htmlFor="otherMainText">
                        {isArabic ? 'اذكر التصنيف المطلوب' : 'Describe your category'}
                      </Label>
                      <Input
                        id="otherMainText"
                        name="otherMainText"
                        value={otherMainText}
                        onChange={(e) => setOtherMainText(e.target.value)}
                        placeholder={isArabic ? 'مثال: تدريب أو استشارة خاصة' : 'e.g., Training or custom request'}
                        className="bg-card border-border"
                      />
                    </div>
                  )}
                  <input type="hidden" name="mainCategory" value={mainCategory} />
                  <input type="hidden" name="subCategory" value={subCategory} />

                  <div className="space-y-2">
                    <Label htmlFor="message">
                      {isArabic ? 'الرسالة' : 'Message'}
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={6}
                      placeholder={isArabic ? 'اكتب رسالتك هنا...' : 'Write your message here...'}
                      className="bg-card border-border resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full neon-button"
                    disabled={loading}
                  >
                    {loading ? (
                      isArabic ? 'جاري الإرسال...' : 'Sending...'
                    ) : (
                      <>
                        {isArabic ? 'إرسال الرسالة' : 'Send Message'}
                        <Send className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                </form>
              </motion.div>

              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-8 order-1 lg:order-2"
              >
                {/* Contact Cards */}
                {loadingSettings && !settings ? (
                  <ContactInfoSkeleton />
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="p-6 rounded-xl bg-card glow-border">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Mail className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              {isArabic ? 'البريد الإلكتروني' : 'Email'}
                            </h3>
                            {settings?.emailContact && (
                              <a
                                href={`mailto:${settings.emailContact}`}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                {settings.emailContact}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-card glow-border">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Phone className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              {isArabic ? 'الهاتف' : 'Phone'}
                            </h3>
                            {settings?.phoneNumber && (
                              <a
                                href={`tel:${settings.phoneNumber}`}
                                className="text-muted-foreground hover:text-primary transition-colors"
                              >
                                {settings.phoneNumber}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-6 rounded-xl bg-card glow-border">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold mb-1">
                              {isArabic ? 'الموقع' : 'Location'}
                            </h3>
                            <p className="text-muted-foreground">
                              {isArabic ? 'الكويت' : 'Kuwait'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp CTA */}
                    {settings?.whatsappNumber && (
                      <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 border border-primary/30">
                        <h3 className="text-xl font-bold mb-2">
                          {isArabic ? 'تفضل واتساب؟' : 'Prefer WhatsApp?'}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {isArabic
                            ? 'تقدر تتواصل معي مباشرة على واتساب'
                            : 'You can reach me directly on WhatsApp'}
                        </p>
                        <a
                          href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="lg" variant="outline" className="w-full glow-border glow-hover">
                            <MessageCircle className="mr-2 w-5 h-5" />
                            {isArabic ? 'فتح واتساب' : 'Open WhatsApp'}
                          </Button>
                        </a>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
