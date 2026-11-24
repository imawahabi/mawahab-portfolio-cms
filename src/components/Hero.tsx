import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Send, MapPin } from 'lucide-react';
import { DirectionalArrow } from '@/components/ui/directional-arrow';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getDisplayProjectCount } from '@/constants/projectCount';
import profileImage from '@/assets/profile.png';
import { HeroSkeleton } from './LoadingPlaceholders';

export const Hero = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  // Fetch settings from backend
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => api.getSettings(),
  });

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
  });

  const { data: testimonials = [], isLoading: loadingTestimonials } = useQuery({
    queryKey: ['testimonials', 'approved'],
    queryFn: () => api.getTestimonials({ status: 'approved' }),
  });


  if (loadingSettings && !settings) {
    return <HeroSkeleton />;
  }

  const projectCount = projects.length;
  const clientCount = testimonials.length;
  const statsLoading = loadingProjects || loadingTestimonials;
  const displayProjectCount = statsLoading ? null : getDisplayProjectCount(projectCount);
  const displayClientCount = statsLoading ? null : clientCount;
  const numberSkeleton = (
    <div className="h-7 w-12 bg-muted/40 rounded animate-pulse mx-auto lg:mx-0" />
  );

  const stats = [
    { number: '14+', label: t('statsExperience') },
    {
      number: displayProjectCount !== null ? `${displayProjectCount}+` : numberSkeleton,
      label: t('statsProjects'),
    },
    {
      number: displayClientCount !== null ? `${displayClientCount || 0}+` : numberSkeleton,
      label: isArabic ? 'تقييمات العملاء' : 'Client Reviews',
    },
  ];

  // Use settings data if available, otherwise use translations
  const heroTitle = isArabic ? settings?.heroTitleAr : settings?.heroTitleEn;
  const heroSubtitle = isArabic ? settings?.heroSubtitleAr : settings?.heroSubtitleEn;
  const availabilityStatus = settings?.availabilityStatus || 'available';
  const isAvailable = availabilityStatus === 'available';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28 sm:pt-32 lg:pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Profile Image - Mobile First */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative flex justify-center lg:order-2"
          >
            <div className="relative group cursor-pointer">
              {/* Animated Rings */}
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -inset-6 border-2 border-primary/30 rounded-full group-hover:border-primary/50 transition-colors duration-500"
              />
              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 25,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -inset-10 border-2 border-accent/15 rounded-full group-hover:border-accent/25 transition-colors duration-500"
              />
              <motion.div
                animate={{
                  rotate: 360,
                }}
                transition={{
                  duration: 30,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -inset-14 border border-primary/10 rounded-full group-hover:border-primary/20 transition-colors duration-500"
              />
              <motion.div
                animate={{
                  rotate: -360,
                }}
                transition={{
                  duration: 35,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute -inset-18 border border-accent/5 rounded-full group-hover:border-accent/15 transition-colors duration-500"
              />

              {/* Additional decorative rings on hover */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute -inset-22 border border-primary/8 rounded-full"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="absolute -inset-26 border border-primary/4 rounded-full"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.0, ease: "easeOut", delay: 0.2 }}
                className="absolute -inset-30 border border-primary/2 rounded-full"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="absolute -inset-34 border border-primary/1 rounded-full"
              />

              {/* Profile Image */}
              <motion.div
                animate={{
                  scale: [1, 1.03, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                whileHover={{
                  scale: 1.05,
                  rotate: [0, -2, 2, 0],
                  rotateY: [0, 5, -5, 0],
                }}
                className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full overflow-hidden"
                style={{
                  boxShadow: '0 0 60px hsl(195 100% 50% / 0.4), 0 0 120px hsl(195 100% 50% / 0.2), 0 0 200px hsl(195 100% 50% / 0.1)',
                  border: '3px solid hsl(195 100% 50% / 0.5)',
                }}
              >
                <motion.img
                  src={profileImage}
                  alt="Abu Rakan"
                  className="w-full h-full object-cover"
                  whileHover={{
                    scale: 1.1,
                    filter: 'brightness(1.15) contrast(1.1) saturate(1.2) hue-rotate(5deg)',
                  }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />

                {/* Overlay gradient on hover */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"
                />

                {/* Shine effect */}
                <motion.div
                  initial={{ x: '-100%', opacity: 0 }}
                  whileHover={{ x: '100%', opacity: 1 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />

                {/* Dynamic glow pulse */}
                <motion.div
                  animate={{
                    boxShadow: [
                      'inset 0 0 20px hsl(195 100% 50% / 0.1)',
                      'inset 0 0 40px hsl(195 100% 50% / 0.2)',
                      'inset 0 0 20px hsl(195 100% 50% / 0.1)',
                    ],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-full"
                />

                {/* Enhanced shine with multiple layers */}
                <motion.div
                  initial={{ x: '-150%', opacity: 0 }}
                  whileHover={{ x: '150%', opacity: 0.6 }}
                  transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm"
                />
              </motion.div>

              {/* Floating particles on hover */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{
                      x: '50%',
                      y: '50%',
                      scale: 0,
                      opacity: 0
                    }}
                    animate={{
                      x: `${50 + (Math.random() - 0.5) * 200}%`,
                      y: `${50 + (Math.random() - 0.5) * 200}%`,
                      scale: [0, 1, 0],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="absolute w-2 h-2 bg-primary/40 rounded-full blur-sm"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                    }}
                  />
                ))}
              </motion.div>

              {/* Floating geometric shapes */}
              <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute inset-0 pointer-events-none"
              >
                {[...Array(8)].map((_, i) => {
                  const shapes = ['square', 'circle', 'triangle'];
                  const shape = shapes[i % shapes.length];
                  const size = 8 + Math.random() * 12;
                  return (
                    <motion.div
                      key={`shape-${i}`}
                      initial={{
                        x: '50%',
                        y: '50%',
                        scale: 0,
                        rotate: 0,
                        opacity: 0
                      }}
                      animate={{
                        x: `${30 + Math.random() * 40}%`,
                        y: `${30 + Math.random() * 40}%`,
                        scale: [0, 1.2, 0],
                        rotate: [0, 180, 360],
                        opacity: [0, 0.8, 0]
                      }}
                      transition={{
                        duration: 3,
                        delay: i * 0.3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                      className={`absolute bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20`}
                      style={{
                        width: `${size}px`,
                        height: `${size}px`,
                        borderRadius: shape === 'circle' ? '50%' : shape === 'triangle' ? '0' : '4px',
                        clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                        left: `${15 + Math.random() * 70}%`,
                        top: `${15 + Math.random() * 70}%`,
                        boxShadow: '0 0 10px hsl(195 100% 50% / 0.3)',
                      }}
                    />
                  );
                })}
              </motion.div>

              {/* Background effect on hover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileHover={{ opacity: 1, scale: 1.1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute -inset-8 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, hsl(195 100% 50% / 0.1) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />

              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-card/90 backdrop-blur-lg px-6 py-3 rounded-full border border-primary/30 shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <span
                      className={`inline-block w-3 h-3 rounded-full shadow ${isAvailable ? 'bg-green-500 shadow-green-500/50' : 'bg-red-500 shadow-red-500/50'}`}
                    />
                    <div
                      className={`absolute w-3 h-3 rounded-full animate-ping opacity-50 ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">
                    {isAvailable ? t('heroAvailability') : t('heroUnavailable')}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-center lg:text-start lg:order-1"
          >

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
            >
              <span className="gradient-text shadow-lg">
                {heroTitle || t('heroTitle')}
              </span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <p className="text-lg sm:text-xl font-semibold">
                <span className="text-white">
                  {heroSubtitle || t('heroSubtitle')}
                </span>
              </p>
              <p className="text-base sm:text-md text-muted-foreground max-w-2xl mx-auto lg:mx-0">
              {isArabic
                ? 'دقّة واهتمام بأدق التفاصيل… أحوّل فكرتك لواقع بجودة واحترافية عالية.'
                : 'Precision and attention to the finest details… I turn your idea into reality with high quality and professionalism.'
              }              
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4"
            >
              <Link to="/portfolio">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 group w-full sm:w-auto text-base px-8 py-3 font-semibold">
                  {t('viewWork')}
                  <DirectionalArrow className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-2 border-primary/50 hover:border-primary hover:bg-primary/5 text-foreground hover:text-primary shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto text-base px-8 py-3 font-semibold">
                  <Send className="w-5 h-5" />
                  {t('letsWorkTogether')}
                </Button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-3 gap-4 pt-8 max-w-md mx-auto lg:mx-0"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-start">
                  <div className="text-2xl sm:text-3xl font-bold gradient-text">{stat.number}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
