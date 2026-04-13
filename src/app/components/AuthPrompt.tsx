import { Capacitor } from '@capacitor/core';
import { motion } from 'motion/react';
import { Lock, Heart, User, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AuthPromptProps {
  onLogin: () => void;
  onSignUp: () => void;
  onSkip: () => void; // Add skip option
  onGoogleLogin?: () => void;
  feature: 'bookmarks' | 'profile' | 'addRecipe';
}

export function AuthPrompt({ onLogin, onSignUp, onSkip, onGoogleLogin, feature }: AuthPromptProps) {
  const featureInfo = {
    bookmarks: {
      icon: Heart,
      title: 'Save Your Favorite Recipes',
      description: 'Create an account to bookmark recipes and access them anytime, anywhere.',
      benefits: [
        'Save unlimited recipes',
        'Sync across all devices',
        'Get personalized recommendations',
      ],
    },
    profile: {
      icon: User,
      title: 'Personalize Your Experience',
      description: 'Sign in to customize your profile, set dietary preferences, and track your cooking journey.',
      benefits: [
        'Set dietary preferences',
        'Manage allergy restrictions',
        'Track your favorite recipes',
      ],
    },
    addRecipe: {
      icon: PlusCircle,
      title: 'Share Your Recipes',
      description: 'Create an account to add your own recipes and share your culinary creations with the community.',
      benefits: [
        'Publish unlimited recipes',
        'Upload photos and step-by-step instructions',
        'Get feedback from the community',
      ],
    },
  };

  const info = featureInfo[feature];
  const FeatureIcon = info.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 space-y-6"
        >
          {/* Icon Section */}
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full mb-4"
            >
              <div className="relative">
                <FeatureIcon className="w-10 h-10 text-primary" />
                <Lock className="w-5 h-5 text-primary absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{info.title}</h2>
            <p className="text-gray-600 text-sm">{info.description}</p>
          </div>

          {/* Benefits List */}
          <div className="space-y-3 py-4">
            {info.benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-gray-700 text-sm">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={onSignUp}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg shadow-primary/20"
            >
              Create Account
            </Button>

            <Button
              onClick={onLogin}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50"
            >
              Sign In
            </Button>

            {onGoogleLogin && (
              <Button
                onClick={onGoogleLogin}
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </Button>
            )}

            <button
              onClick={onSkip}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 pt-2"
            >
              Continue browsing as guest
            </button>
          </div>

          {/* Logo Branding */}
          <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-100">
            <img src="/rb_logo.png" className="w-5 h-5 object-contain" alt="RecipeBuddy Logo" />
            <span className="text-sm font-semibold text-gray-900">
              RECIPE <span className="text-primary">BUDDY</span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
