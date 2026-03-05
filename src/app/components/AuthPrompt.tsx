import { motion } from 'motion/react';
import { Lock, Heart, User, PlusCircle } from 'lucide-react';
import { Button } from './ui/button';

interface AuthPromptProps {
  onLogin: () => void;
  onSignUp: () => void;
  onSkip: () => void; // Add skip option
  feature: 'bookmarks' | 'profile' | 'addRecipe';
}

export function AuthPrompt({ onLogin, onSignUp, onSkip, feature }: AuthPromptProps) {
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
