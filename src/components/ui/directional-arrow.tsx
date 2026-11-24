import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface DirectionalArrowProps {
  className?: string;
}

export const DirectionalArrow = ({ className }: DirectionalArrowProps) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  return isArabic ? (
    <ArrowLeft className={className} />
  ) : (
    <ArrowRight className={className} />
  );
};
