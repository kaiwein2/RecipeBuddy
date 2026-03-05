import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.5, duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-background flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.img
          src="/rb_logo.png"
          alt="RecipeBuddy Logo"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1],
            delay: 0.2
          }}
          className="w-72 h-72 object-contain mx-auto block"
        />
      </div>
    </motion.div>
  );
}
