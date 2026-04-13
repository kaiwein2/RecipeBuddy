import { motion } from 'motion/react';
import { Heart, User, Sparkles, X } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface GuestBannerProps {
  onSignUp: () => void;
}

export function GuestBanner({ onSignUp }: GuestBannerProps) {
  const [isDismissed, setIsDismissed] = useState(() => {
    return sessionStorage.getItem('guestBannerDismissed') === 'true';
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    sessionStorage.setItem('guestBannerDismissed', 'true');
    setIsDismissed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative bg-gradient-to-r from-orange-500 via-primary to-amber-500 text-white rounded-2xl p-5 mb-6 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
      </div>

      {/* Close button */}
      <button
        type="button"
        onPointerDown={(e) => { e.preventDefault(); handleDismiss(); }}
        onClick={handleDismiss}
        className="absolute top-1 right-1 p-3 z-20 hover:bg-white/20 active:bg-white/30 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
          <Sparkles className="w-6 h-6" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-bold text-base mb-1">Browsing as Guest</h3>
          <p className="text-sm text-white/90 leading-snug">
            Sign up to save recipes, set dietary preferences, and get personalized recommendations!
          </p>
        </div>

        {/* CTA */}
        <Button
          onClick={onSignUp}
          size="sm"
          className="flex-shrink-0 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg"
        >
          Sign Up Free
        </Button>
      </div>

      {/* Feature icons */}
      <div className="relative flex items-center gap-4 mt-4 pt-4 border-t border-white/20">
        <div className="flex items-center gap-2 text-sm">
          <Heart className="w-4 h-4" />
          <span className="text-white/90">Save Favorites</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <User className="w-4 h-4" />
          <span className="text-white/90">Personalized Feed</span>
        </div>
      </div>
    </motion.div>
  );
}
