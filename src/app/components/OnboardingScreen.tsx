import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Clock, ShoppingCart, ChevronRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 0,
    icon: BookOpen,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    circleBg: 'bg-orange-50',
    gradientFrom: 'from-orange-50',
    accentColor: '#f97316',
    emojis: ['🍝', '🥗', '🍜', '🥘', '🍛'],
    title: 'Discover Recipes',
    subtitle: 'Browse thousands of curated recipes across every cuisine, dietary preference, and occasion — and save your all-time favorites with one tap.',
  },
  {
    id: 1,
    icon: Clock,
    iconColor: 'text-rose-500',
    iconBg: 'bg-rose-100',
    circleBg: 'bg-rose-50',
    gradientFrom: 'from-rose-50',
    accentColor: '#f43f5e',
    emojis: ['👨‍🍳', '🔥', '⏱️', '🥄', '✨'],
    title: 'Cook with Confidence',
    subtitle: 'Follow step-by-step instructions with built-in timers for every step. Auto-advance keeps you moving so you never lose your place mid-cook.',
  },
  {
    id: 2,
    icon: ShoppingCart,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-100',
    circleBg: 'bg-emerald-50',
    gradientFrom: 'from-emerald-50',
    accentColor: '#10b981',
    emojis: ['🛒', '🥦', '🧄', '🍋', '🏪'],
    title: 'Find Every Ingredient',
    subtitle: 'See exactly where to buy each ingredient nearby. Smart alternatives are always suggested for anything hard to find.',
  },
];

// Positions for floating emoji badges
const emojiPositions = [
  { top: '8%', left: '10%' },
  { top: '12%', right: '8%' },
  { bottom: '18%', left: '6%' },
  { bottom: '12%', right: '10%' },
  { top: '45%', right: '4%' },
];

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const goNext = () => {
    if (current < slides.length - 1) {
      setDirection(1);
      setCurrent(current + 1);
    } else {
      onComplete();
    }
  };

  const goTo = (index: number) => {
    setDirection(index > current ? 1 : -1);
    setCurrent(index);
  };

  const slide = slides[current];
  const Icon = slide.icon;

  return (
    <div className={`fixed inset-0 bg-gradient-to-b ${slide.gradientFrom} to-white flex flex-col items-center justify-between z-40 select-none overflow-hidden transition-all duration-500`}>
      {/* Skip button */}
      {current < slides.length - 1 && (
        <div className="w-full flex justify-end px-6 pt-14">
          <button
            onClick={onComplete}
            className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
          >
            Skip
          </button>
        </div>
      )}
      {current === slides.length - 1 && <div className="pt-14" />}

      {/* Illustration area */}
      <div className="flex-1 flex items-center justify-center w-full px-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center text-center max-w-xs w-full"
          >
            {/* Floating emoji badges */}
            <div className="relative w-52 h-52 mb-8">
              {slide.emojis.map((emoji, i) => (
                <motion.div
                  key={`${current}-${i}`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute w-10 h-10 rounded-2xl bg-white shadow-md flex items-center justify-center text-xl z-10"
                  style={emojiPositions[i]}
                >
                  {emoji}
                </motion.div>
              ))}

              {/* Main circle + icon */}
              <div className={`w-full h-full rounded-full ${slide.circleBg} flex items-center justify-center`}>
                <div className="absolute inset-4 rounded-full bg-white/60" />
                <div className={`relative w-24 h-24 rounded-full ${slide.iconBg} flex items-center justify-center shadow-sm`}>
                  <Icon size={44} className={slide.iconColor} strokeWidth={1.5} />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
              {slide.title}
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed px-2">
              {slide.subtitle}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="w-full px-6 pb-12 flex flex-col items-center gap-6 max-w-sm mx-auto">
        {/* Dot indicators */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-300 rounded-full"
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                backgroundColor: i === current ? slide.accentColor : '#e5e7eb',
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Next / Get Started button */}
        <button
          onClick={goNext}
          className="w-full py-4 rounded-2xl text-white font-semibold text-base transition-colors flex items-center justify-center gap-2 shadow-lg"
          style={{ backgroundColor: slide.accentColor }}
        >
          {current === slides.length - 1 ? (
            'Get Started 🎉'
          ) : (
            <>
              Next
              <ChevronRight size={18} />
            </>
          )}
        </button>

        {/* Skip below button */}
        {current < slides.length - 1 && (
          <button
            onClick={onComplete}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors pb-1"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
