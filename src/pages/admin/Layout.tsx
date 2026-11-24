import { useEffect, useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Briefcase, Settings, MessageSquare, Wrench, LogOut, Menu, X, BadgePercent, StickyNote, ChevronRight, Home, Settings2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!api.getToken()) {
        navigate('/admin/login');
        return;
      }
      await api.getMe();
      setLoading(false);
    } catch (error) {
      api.clearToken();
      toast.error('غير مصرح لك بالدخول');
      navigate('/admin/login');
    }
  };

  const handleLogout = async () => {
    api.clearToken();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/admin/login');
  };

  const navItems = [
    { path: '/admin/dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { path: '/admin/projects', label: 'أعمالي', icon: Briefcase },
    { path: '/admin/services', label: 'خدماتي', icon: Wrench },
    { path: '/admin/categories', label: 'إدارة التصنيفات', icon: Settings2 },
    { path: '/admin/testimonials', label: 'آراء العملاء', icon: Star },
    { path: '/admin/messages', label: 'الرسائل', icon: MessageSquare },
    { path: '/admin/notes', label: 'الملاحظات', icon: StickyNote },
    { path: '/admin/settings', label: 'الإعدادات', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/70 p-8 text-center shadow-2xl">
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-32 left-0 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
          />

          <div className="relative space-y-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 shadow-inner shadow-primary/20">
              <LayoutDashboard className="h-7 w-7 text-primary" />
            </div>

            <div className="space-y-2">
              <p className="text-lg font-semibold text-white">نجهز لوحة التحكم</p>
              <p className="text-sm text-slate-300/80">لحظات ونكون معك…</p>
            </div>

            <div className="space-y-4">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/60">
                <div className="absolute inset-y-0 w-1/3 bg-primary/70 animate-pulse" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="h-10 rounded-xl bg-slate-800/40 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-800/40 animate-pulse" />
                <div className="h-10 rounded-xl bg-slate-800/40 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-x-hidden w-screen" dir="rtl">
      {/* Background effects (خفيفة ومعطّلة على الموبايل لتقليل الثقل) */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-24 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-24 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
      </div>
      {/* Mobile Header */}
      <header className="lg:hidden backdrop-blur-xl bg-background/80 border-b border-primary/10 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold">لوحة التحكم</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="hover:bg-primary/10"
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
        
        {mobileMenuOpen && (
          <nav className="border-t border-primary/10 p-4 space-y-2 bg-gradient-to-b from-primary/5 to-transparent">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'hover:bg-primary/10 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 mr-auto" />}
                </Link>
              );
            })}
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 mt-4"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </Button>
          </nav>
        )}
      </header>

      <div className="flex w-full max-w-[100vw] overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 min-h-screen backdrop-blur-xl bg-gradient-to-b from-background/95 to-background/80 border-l border-primary/10 flex-col sticky left-0 top-0">
          {/* Logo Section */}
          <div className="p-6 border-b border-primary/10 bg-gradient-to-b from-primary/10 to-transparent">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center overflow-hidden shadow-inner shadow-primary/20">
                <img
                  src="/favicon.ico"
                  alt={settings?.siteNameEn || settings?.siteNameAr || 'Site'}
                  className="h-full w-full object-contain"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-right leading-tight">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  لوحة التحكم
                </h1>
                <p className="text-xs text-muted-foreground">
                  {settings?.siteNameAr || settings?.siteNameEn || ''}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-primary/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
                  <span className="font-semibold flex-1">{item.label}</span>
                  {isActive && (
                    <>
                      <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      <div className="absolute inset-0 bg-primary/5 -z-10 rounded-lg"></div>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-primary/10 bg-gradient-to-t from-primary/5 to-transparent space-y-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-red-500 hover:bg-red-500/10 hover:text-red-600 font-semibold"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto overflow-x-hidden relative w-full">
          {/* خففنا طبقة الخلفية لتقليل الـ blur على التمرير */}
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
