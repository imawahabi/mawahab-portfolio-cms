import { useEffect, useMemo, Suspense, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createBrowserRouter, createRoutesFromElements, Route, Outlet, Navigate } from "react-router-dom";
import { I18nextProvider, useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import i18n from "./i18n/config";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import ProjectDetail from "./pages/ProjectDetail";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/Login";
import AdminLayout from "./pages/admin/Layout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProjects from "./pages/admin/Projects";
import AdminServices from "./pages/admin/Services";
import AdminMessages from "./pages/admin/Messages";
import AdminSettings from "./pages/admin/Settings";
import AdminNotes from "./pages/admin/Notes";
import AdminCategories from "./pages/admin/Categories";
import AdminTestimonials from "./pages/admin/Testimonials";
import { ScrollToTop } from "./components/ScrollToTop";
import { RouteScrollReset } from "./components/RouteScrollReset";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { MobileBottomNav } from "./components/MobileBottomNav";
import TestimonialSubmit from "./pages/TestimonialSubmit";

const queryClient = new QueryClient();

// Wrapper component for page transitions
const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsChangingLanguage(true);
      setTimeout(() => setIsChangingLanguage(false), 1000);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={i18n.language}
        initial={{ opacity: 0 }}
        animate={{ opacity: isChangingLanguage ? 0.3 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    // Set initial direction based on language
    document.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, []);

  const router = useMemo(
    () =>
      createBrowserRouter(
        createRoutesFromElements(
          <Route element={<ScrollWrapper />}>
            <Route path="/" element={<Index />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<ProjectDetail />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonial/:token" element={<TestimonialSubmit />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="projects" element={<AdminProjects />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="testimonials" element={<AdminTestimonials />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="notes" element={<AdminNotes />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Route>,
        ),
        {},
      ),
    [],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <Suspense fallback={<LoadingSpinner fullScreen text="جاري تحميل الموقع..." />}>
            <PageTransitionWrapper>
              <RouterProvider router={router} />
            </PageTransitionWrapper>
          </Suspense>
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

export default App;

const ScrollWrapper = () => (
  <>
    <RouteScrollReset />
    <ScrollToTop />
    <MobileBottomNav />
    <Outlet />
  </>
);
