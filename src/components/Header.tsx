import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Home, Briefcase, Users, Phone, UserCircle, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import profileImage from '@/assets/profile.png';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const isArabic = i18n.language === 'ar';
  
  // Fetch settings from backend
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const siteName = (isArabic ? settings?.siteNameAr : settings?.siteNameEn) || `${t('brandFirst')} ${t('brandLast')}`;

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    document.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navLinks = [
    { to: '/', label: t('home'), icon: Home },
    { to: '/portfolio', label: t('portfolio'), icon: Folder },
    { to: '/services', label: t('services'), icon: Briefcase },
    { to: '/about', label: t('about'), icon: UserCircle },
    { to: '/contact', label: t('contact'), icon: Phone },
  ];

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo with Profile Image */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-colors">
              <img 
                src={profileImage} 
                alt={siteName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-lg sm:text-2xl font-bold leading-tight">
                <span className="gradient-text">{siteName}</span>
              </span>
              <p className="text-[11px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 max-w-[220px] sm:max-w-none">
                {isArabic ? settings?.aboutShortAr : settings?.aboutShortEn ||
                 (isArabic ? 'مطور ويب ومصمم واجهات' : 'Web Developer & UI Designer')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 text-sm lg:text-base transition-colors duration-200 ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-muted-foreground hover:text-primary hover:font-medium'
                  }`}
                >
                  {isActive && <Icon className="w-4 h-4" />}
                  {link.label}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2 relative overflow-hidden"
            >
              <Globe className="w-4 h-4" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={i18n.language}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block w-6 text-center"
                >
                  {i18n.language === 'ar' ? 'EN' : 'AR'}
                </motion.span>
              </AnimatePresence>
            </Button>
          </nav>

          {/* Mobile: فقط زر اللغة، لا قائمة جانبية */}
          <div className="flex items-center gap-2 md:hidden">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage}
              className="relative w-10 h-10 p-0 flex items-center justify-center"
            >
              <Globe className="w-4 h-4" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={i18n.language}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute text-xs font-medium hidden"
                >
                  {i18n.language === 'ar' ? 'EN' : 'AR'}
                </motion.span>
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation hidden (bottom nav replaces it) */}
      </div>
    </motion.header>
  );
};
