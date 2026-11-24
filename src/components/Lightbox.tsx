import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Image {
  url: string;
  alt?: string;
  altAr?: string;
  altEn?: string;
}

interface LightboxProps {
  images: (string | Image)[];
  isArabic: boolean;
}

const calcVisibleThumbs = () => {
  if (typeof window === 'undefined') return 4;
  const w = window.innerWidth;
  if (w < 360) return 3;
  if (w < 480) return 4;
  if (w < 640) return 5;
  if (w < 1024) return 6;
  return 8;
};

export const Lightbox = ({ images, isArabic }: LightboxProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [thumbStart, setThumbStart] = useState(0);
  const [visibleThumbs, setVisibleThumbs] = useState(calcVisibleThumbs());

  const normalizedImages = images.map((img) =>
    typeof img === 'string' ? { url: img, alt: 'Project image' } : img
  );

  if (normalizedImages.length === 0) return null;

  const currentImage = normalizedImages[selectedIndex];
  const getAlt = (img: Image) =>
    img.altAr || img.altEn || img.alt || 'Project image';
  const currentImageUrl =
    typeof currentImage === 'string'
      ? currentImage
      : (currentImage as Image).url;

  useEffect(() => {
    const updateVisibleThumbs = () => setVisibleThumbs(calcVisibleThumbs());
    updateVisibleThumbs();
    window.addEventListener('resize', updateVisibleThumbs);
    return () => window.removeEventListener('resize', updateVisibleThumbs);
  }, []);

  const maxThumbStart = Math.max(0, normalizedImages.length - visibleThumbs);

  const clampThumbStart = (next: number) => Math.min(Math.max(next, 0), maxThumbStart);

  const jumpToIndex = (index: number) => {
    setSelectedIndex(index);
    if (index < thumbStart) {
      setThumbStart(index);
    } else if (index >= thumbStart + visibleThumbs) {
      setThumbStart(clampThumbStart(index - visibleThumbs + 1));
    }
  };

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? normalizedImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === normalizedImages.length - 1 ? 0 : prev + 1
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <div className="space-y-6 overflow-hidden">
      {/* Main Gallery View */}
      <div className="relative group">
        {/* Main Image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          key={selectedIndex}
          className="relative w-full max-w-full mx-auto aspect-[4/3] sm:aspect-video max-h-[70vh] rounded-xl overflow-hidden glow-border bg-black/80 ring-1 ring-border/50 isolate"
          onClick={() => setLightboxOpen(true)}
        >
          {/* Blurred backdrop to avoid empty bars on contain */}
          <div
            className="absolute inset-0 scale-105 blur-2xl bg-center bg-cover opacity-100 pointer-events-none"
            style={{ backgroundImage: `url(${currentImageUrl})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden />
          <img
            src={currentImageUrl}
            alt={getAlt(currentImage as Image)}
            className="relative z-10 w-full h-full object-contain max-h-[60vh] sm:max-h-[70vh] shadow-2xl"
          />

          {/* Persistent Zoom Button (refined) */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              setLightboxOpen(true);
            }}
            className="absolute top-3 right-3 inline-flex items-center justify-center gap-2 px-3 h-11 rounded-full bg-black/65 backdrop-blur text-white border border-white/10 shadow-lg hover:shadow-xl transition-all z-20 pointer-events-auto"
            title={isArabic ? 'تكبير الصورة' : 'Zoom image'}
          >
            <ZoomIn className="w-5 h-5" />
            <span className="text-sm font-semibold hidden sm:inline">
              {isArabic ? 'عرض مكبر' : 'View'}
            </span>
          </motion.button>

          {/* Navigation Arrows */}
          {normalizedImages.length > 1 && (
            <>
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                whileHover={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  isArabic ? handleNext() : handlePrevious();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex w-9 h-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100 md:opacity-100 z-20"
                aria-label={isArabic ? 'الصورة التالية' : 'Previous image'}
              >
                {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 12 }}
                whileHover={{ opacity: 1, x: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  isArabic ? handlePrevious() : handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex w-9 h-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/70 text-white transition-all opacity-0 group-hover:opacity-100 md:opacity-100 z-20"
                aria-label={isArabic ? 'الصورة السابقة' : 'Next image'}
              >
                {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </motion.button>
            </>
          )}

          {/* Image Counter */}
          {normalizedImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-white text-xs font-medium">
              {selectedIndex + 1} / {normalizedImages.length}
            </div>
          )}
        </motion.div>

          {/* Thumbnail Strip */}
          {normalizedImages.length > 1 && (
            <div className="mt-6 space-y-3 w-full overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-muted-foreground">
                    {isArabic ? 'المعرض' : 'Gallery'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {isArabic ? `${normalizedImages.length} صورة` : `${normalizedImages.length} images`}
                  </span>
                </div>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => {
                    const next = clampThumbStart(thumbStart - visibleThumbs);
                    setThumbStart(next);
                    const newIndex = Math.max(0, selectedIndex - 1);
                    jumpToIndex(newIndex);
                  }}
                  className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition disabled:opacity-40 flex-shrink-0"
                  disabled={thumbStart === 0}
                  aria-label={isArabic ? 'السابق' : 'Prev'}
                >
                  {isArabic ? <ChevronRight className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4 mx-auto" />}
                </button>

                <div className="flex-1 overflow-hidden min-w-0 max-w-full">
                  <div
                    className="flex gap-2 pb-2 snap-x snap-mandatory min-w-0 max-w-full"
                    style={{ maxWidth: '100%' }}
                  >
                    {normalizedImages
                      .slice(thumbStart, thumbStart + visibleThumbs)
                      .map((image, idx) => {
                        const actualIndex = thumbStart + idx;
                        return (
                          <motion.button
                            key={actualIndex}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => jumpToIndex(actualIndex)}
                            className={`relative rounded-lg overflow-hidden border transition-all snap-start flex-shrink-0 ${
                              selectedIndex === actualIndex
                                ? 'border-primary ring-2 ring-primary/50'
                                : 'border-border hover:border-primary/60'
                            }`}
                            style={{ width: 'clamp(48px, 14vw, 76px)', height: 'clamp(48px, 14vw, 76px)' }}
                          >
                            <img
                              src={
                                typeof image === 'string' ? image : (image as Image).url
                              }
                              alt={getAlt(image as Image)}
                              className="w-full h-full object-cover"
                            />
                          </motion.button>
                        );
                      })}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const next = clampThumbStart(thumbStart + visibleThumbs);
                    setThumbStart(next);
                    const newIndex = Math.min(normalizedImages.length - 1, selectedIndex + 1);
                    jumpToIndex(newIndex);
                  }}
                  className="w-8 h-8 rounded-full bg-black/50 text-white hover:bg-black/70 transition disabled:opacity-40 flex-shrink-0"
                  disabled={thumbStart >= maxThumbStart}
                  aria-label={isArabic ? 'التالي' : 'Next'}
                >
                  {isArabic ? <ChevronLeft className="w-4 h-4 mx-auto" /> : <ChevronRight className="w-4 h-4 mx-auto" />}
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Lightbox Modal - Using Portal */}
      {lightboxOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
              onClick={() => setLightboxOpen(false)}
              onKeyDown={handleKeyDown}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="relative w-full h-full max-w-full max-h-[95vh] flex flex-col items-center justify-center gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Main Image */}
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
                  <div
                    className="absolute inset-0 scale-110 blur-2xl bg-center bg-cover opacity-100 pointer-events-none"
                    style={{ backgroundImage: `url(${currentImageUrl})` }}
                    aria-hidden
                  />
                  <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden />
                  <img
                    src={currentImageUrl}
                    alt={getAlt(currentImage as Image)}
                    className="relative z-10 w-full h-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  />

                  {/* Counter */}
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg">
                    {selectedIndex + 1} / {normalizedImages.length}
                  </div>

                  {/* Close Button */}
                  <Button
                    size="icon"
                    className="absolute top-4 left-4 bg-red-500 hover:bg-red-700 text-white rounded-full z-20 w-11 h-11 shadow-lg"
                    onClick={() => setLightboxOpen(false)}
                    aria-label={isArabic ? 'إغلاق' : 'Close'}
                  >
                    <X className="w-5 h-5" />
                  </Button>

                  {/* Navigation inside modal */}
                  {normalizedImages.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          isArabic ? handleNext() : handlePrevious();
                        }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 flex w-11 h-11 items-center justify-center rounded-xl bg-black/70 border border-white/15 text-white shadow-lg z-30 pointer-events-auto"
                        aria-label={isArabic ? 'الصورة التالية' : 'Previous image'}
                      >
                        {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          isArabic ? handlePrevious() : handleNext();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 flex w-11 h-11 items-center justify-center rounded-xl bg-black/70 border border-white/15 text-white shadow-lg z-30 pointer-events-auto"
                        aria-label={isArabic ? 'الصورة السابقة' : 'Next image'}
                      >
                        {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </motion.button>
                    </>
                  )}
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
