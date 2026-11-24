import { Home, Briefcase, PhoneCall, User, Folder } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const MobileBottomNav = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  const items = [
    { to: '/', labelAr: 'الرئيسية', labelEn: 'Home', icon: Home },
    { to: '/portfolio', labelAr: 'أعمالي', labelEn: 'Portfolio', icon: Folder },
    { to: '/about', labelAr: 'عني', labelEn: 'About', icon: User },
    { to: '/services', labelAr: 'الخدمات', labelEn: 'Services', icon: Briefcase },
    { to: '/contact', labelAr: 'تواصل', labelEn: 'Contact', icon: PhoneCall },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40">
      <div className="border-t border-primary/15 bg-gradient-to-t from-background/95 via-background/90 to-background/85 shadow-[0_-8px_24px_rgba(0,0,0,0.28)] px-3 py-2 flex items-center justify-between">
        {items.map(({ to, labelAr, labelEn, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              className={`flex-1 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition pb-5 ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
                  active
                    ? 'bg-primary/15 text-primary shadow-[0_6px_18px_rgba(30,64,175,0.25)]'
                    : 'bg-white/5 text-muted-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              <span className="leading-none">{isArabic ? labelAr : labelEn}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
