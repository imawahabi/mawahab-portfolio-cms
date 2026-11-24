import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Code2, Palette, Zap, Award, Users, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import profileImage from '@/assets/profile.png';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getDisplayProjectCount } from '@/constants/projectCount';

export default function About() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const { data: aboutProjects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    retry: 2,
    retryDelay: 800,
  });
  const { data: aboutTestimonials = [], isLoading: loadingTestimonials } = useQuery({
    queryKey: ['testimonials', 'approved'],
    queryFn: () => api.getTestimonials({ status: 'approved' }),
    retry: 1,
  });
  const statsLoading = loadingProjects || loadingTestimonials;
  const displayProjects = statsLoading ? null : getDisplayProjectCount(aboutProjects.length);
  const displayClients = statsLoading ? null : aboutTestimonials.length;
  const statSkeleton = <div className="h-6 w-16 bg-muted/40 rounded animate-pulse" />;
  const aboutStats = {
    projects: displayProjects,
    clients: displayClients,
    years: '14+',
  };

  const skills = [
    { icon: Code2, titleAr: 'تطوير الويب', titleEn: 'Web Development', descAr: 'React, TypeScript, Node.js', descEn: 'React, TypeScript, Node.js' },
    { icon: Palette, titleAr: 'تصميم الواجهات', titleEn: 'UI/UX Design', descAr: 'Figma, Tailwind CSS, Animation', descEn: 'Figma, Tailwind CSS, Animation' },
    { icon: Zap, titleAr: 'الأداء والسرعة', titleEn: 'Performance', descAr: 'تحسين الأداء والـ SEO', descEn: 'Optimization & SEO' },
    { icon: Award, titleAr: 'الجودة', titleEn: 'Quality', descAr: 'كود نظيف وقابل للصيانة', descEn: 'Clean & maintainable code' },
  ];

  const experiences = [
    {
      yearAr: 'من 2010',
      yearEn: 'Since 2010',
      titleAr: 'مصمم ومطور ويب',
      titleEn: 'Web Designer & Dev',
      descAr: 'تصميم وتطوير المواقع والمنتديات، وانضمامي لفريق ترايدنت السعودي كمصمم ومطور.',
      descEn: 'Built sites and forums; joined Traidnt\'s design/dev team.',
    },
    {
      yearAr: 'من 2015',
      yearEn: 'Since 2015',
      titleAr: 'إدارة محتوى وتصميم جرافيك',
      titleEn: 'Content & Graphic Design',
      descAr: 'دخلت عالم السوشيال بإدارة المحتوى والتصميم اليومي للحسابات.',
      descEn: 'Handled social content and daily graphics for brands.',
    },
    {
      yearAr: 'من 2020',
      yearEn: 'Since 2020',
      titleAr: 'تطوير وبرمجة وSEO',
      titleEn: 'Dev & SEO',
      descAr: 'برمجة ويب أبلكيشن، تحسين السرعة والـ SEO، واختيار الستاك الأنسب.',
      descEn: 'Built web apps, tuned speed & SEO, and picked the right stack per project.',
    },
    {
      yearAr: 'من 2023',
      yearEn: 'Since 2023',
      titleAr: 'Full Stack',
      titleEn: 'Full Stack',
      descAr: 'مصمم ومبرمج ومدير محتوى؛ أشتغل على الباك والفرونت والجرافيك ككل متكامل.',
      descEn: 'Full-stack with design chops—frontend, backend, and content as one package.',
    },
  ];
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center overflow-hidden">


          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-16 items-center min-h-screen py-20">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mt-20">
                    <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                      {isArabic ? 'خلني أعرفك ' : 'Let me introduce '}
                    </span>
                    <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      {isArabic ? 'علي شوي' : 'myself'}
                    </span>
                  </h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    className="text-xl sm:text-2xl text-primary font-semibold leading-relaxed"
                  >
                    {isArabic
                      ? 'أنا مصمم ومطور ويب من مواليد الكويت، أحب وأشتغل بمجال التصميم والتطوير من أكثر من 10 سنين.'
                      : "I'm a web designer & developer from Kuwait, been designing and building for 10+ years."}
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="space-y-4 text-lg text-muted-foreground leading-relaxed"
                >
                  <p>
                    {isArabic
                      ? 'أحاول دايم أطلع بأفكار جديدة ومختلفة وأحرص ترضي ذوقك وتكون مرتبة واحترافية.'
                      : "I'm always trying fresh ideas that fit your style—kept clean and professional."}
                  </p>
                  <p>
                    {isArabic
                      ? 'أتطور باستمرار في البرمجة والتصميم ومع دخول الذكاء الصناعي، وأقدر أساعدك توظف الأدوات المناسبة لموقعك أو مشروعك.'
                      : "I keep leveling up in dev, design, and AI tools so we can use the right stack for your project."}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm p-6 shadow-lg"
                >
                  <p className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                    <Code2 className="w-4 h-4" />
                    {isArabic ? 'التقنيات والأدوات اللي أشتغل فيها' : 'Tools & stack I work with'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'React', 'Next.js', 'TypeScript', 'Tailwind CSS', 
                      'Node.js', 'Databases', 'Figma', 'Adobe Photoshop',
                      'Adobe Illustrator', 'Visual Studio Code', 'AI Tools'
                    ].map((tech, index) => (
                      <motion.div
                        key={tech}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                      >
                        <Badge className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                          {tech}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 pt-6"
                >
                  <Link to="/contact">
                    <Button size="lg" className="group relative overflow-hidden text-lg px-12 py-8 shadow-2xl hover:shadow-primary/50 transition-all duration-500 bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/80 hover:via-primary/90 hover:to-primary/80 transform hover:scale-105 hover:-translate-y-1 w-full sm:w-auto border-2 border-primary/20 hover:border-primary">
                      <span className="relative z-10 flex items-center justify-center font-bold tracking-wide text-white">
                        {isArabic ? 'عندك استفسار معين؟' : 'Got a question?'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </Link>
                  <Link to="/portfolio">
                    <Button size="lg" variant="outline" className="group relative overflow-hidden text-lg px-12 py-8 shadow-2xl hover:shadow-primary/50 transition-all duration-300 w-full sm:w-auto border-2 border-primary hover:bg-primary/10 hover:border-primary transform hover:scale-105 hover:-translate-y-1 font-bold tracking-wide">
                      <span className="relative z-10 flex items-center justify-center text-white">
                        {isArabic ? 'مشاريع أنجزتها' : 'Work I\'s shipped'}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Profile Image */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="flex justify-center lg:justify-end"
              >
                <div className="relative">
                  {/* Decorative rings */}
                  <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-pulse" />
                  <div className="absolute inset-4 rounded-full border border-primary/10 animate-pulse delay-500" />
                  
                  {/* Profile image container */}
                  <div className="relative w-80 h-80 sm:w-96 sm:h-96 rounded-full overflow-hidden border-4 border-primary/30 shadow-2xl shadow-primary/20 backdrop-blur-sm">
                    <motion.img
                      src={profileImage}
                      alt="Abu Rakan"
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                  </div>
                  
                  {/* Floating stats */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="absolute -right-8 top-8 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg"
                  >
                    <div className="text-2xl font-bold text-primary">{aboutStats.years}</div>
                    <div className="text-sm text-muted-foreground">
                      {isArabic ? 'سنوات خبرة' : 'Years Experience'}
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.7, duration: 0.6 }}
                    className="absolute -left-8 bottom-8 bg-card/90 backdrop-blur-sm border border-border/50 rounded-xl p-4 shadow-lg"
                  >
                    <div className="text-2xl font-bold text-primary">
                      {aboutStats.projects !== null ? `${aboutStats.projects}+` : statSkeleton}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {isArabic ? 'مشروع مكتمل' : 'Projects Done'}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>

        </section>

        {/* Skills Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {isArabic ? 'المهارات اللي أشتغل عليها' : 'What I\'m good at'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isArabic
                  ? 'أحب أمزج التصميم مع البرمجة عشان النتيجة تكون مرتبة وتشتغل بسلاسة.'
                  : 'I like mixing design with dev so the result looks great and runs smooth.'}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill, index) => {
                const Icon = skill.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 space-y-4 h-full bg-card/70 border border-border/60 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">
                          {isArabic ? skill.titleAr : skill.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {isArabic ? skill.descAr : skill.descEn}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {isArabic ? 'خبرتي' : 'My Experience'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isArabic
                  ? 'رحلتي المهنية من البداية للحين'
                  : 'My professional journey From the start till now.'}
              </p>
            </motion.div>

            <div className="relative max-w-3xl mx-auto space-y-6 before:absolute before:left-4 before:top-0 before:bottom-0 before:w-px before:bg-primary/20">
              {experiences.map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isArabic ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="relative pl-8 p-6 bg-card/70 border border-border/60 shadow-sm hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 transition-all duration-300">
                    <span className="absolute left-2 top-6 h-3 w-3 rounded-full bg-primary shadow-primary/50 shadow-sm" />
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-xl font-semibold">
                          {isArabic ? exp.titleAr : exp.titleEn}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {isArabic ? exp.descAr : exp.descEn}
                        </p>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {isArabic ? exp.yearAr : exp.yearEn}
                      </Badge>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {[
                { number: aboutStats.projects !== null ? `${aboutStats.projects || 0}+` : statSkeleton, label: isArabic ? 'مشروع مكتمل' : 'Projects Completed' },
                { number: aboutStats.clients !== null ? `${aboutStats.clients || 0}+` : statSkeleton, label: isArabic ? 'تقييمات العملاء' : 'Client Reviews' },
                { number: aboutStats.years, label: isArabic ? 'سنوات خبرة' : 'Years Experience' },
                { number: '100%', label: isArabic ? 'التزام بالجودة' : 'Quality Committed' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <p className="text-muted-foreground text-lg">
                    {stat.label}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl sm:text-4xl font-bold">
                {isArabic ? 'حاب نبلش مع بعض بمشروعك؟' : 'Ready to kick off your project together?'}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {isArabic
                  ? 'تواصل معاي نبتكر شيء جديد ومختلف، ونخطط ونرسم لكل شيء ببالك.'
                  : "Ping me and let's craft something fresh—map out everything you've got in mind."}
              </p><br />
              <Link to="/contact">
                <Button size="lg" className="neon-button">
                  {isArabic ? 'تواصل معاي' : 'Let\'s talk'}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
