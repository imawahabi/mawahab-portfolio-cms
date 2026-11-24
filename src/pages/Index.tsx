import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { FeaturedWork } from '@/components/FeaturedWork';
import { ServicesSection } from '@/components/ServicesSection';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { motion } from 'framer-motion';

const Index = () => {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen">
      <Header />
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.18 }}
        className="space-y-0"
      >
        <motion.div variants={fadeUp}>
          <Hero />
        </motion.div>
        <motion.div variants={fadeUp}>
          <FeaturedWork />
        </motion.div>
        <motion.div variants={fadeUp}>
          <ServicesSection />
        </motion.div>
        <motion.div variants={fadeUp}>
          <CTASection />
        </motion.div>
      </motion.div>
      <Footer />
    </div>
  );
};

export default Index;
