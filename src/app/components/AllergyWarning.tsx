import { AlertTriangle, X, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './ui/button';

interface AllergyWarningProps {
  allergens: string[];
  onDismiss?: () => void;
  onExit?: () => void;
}

export function AllergyWarning({ allergens, onDismiss, onExit }: AllergyWarningProps) {
  if (allergens.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4 border-2 border-red-200">
            <AlertTriangle className="w-10 h-10 text-red-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Allergy Warning</h2>
          
          <p className="text-gray-600 mb-4">
            This recipe contains ingredients you're allergic to:
          </p>
          
          <div className="flex flex-wrap gap-2 justify-center mb-6">
            {allergens.map((allergen) => (
              <span 
                key={allergen}
                className="px-4 py-2 bg-red-50 text-red-700 rounded-full font-semibold text-sm border border-red-200"
              >
                {allergen}
              </span>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 mb-8">
            Please be careful when preparing or consuming this recipe. Would you like to continue?
          </p>
          
          <div className="flex gap-3 w-full">
            <Button
              onClick={onExit}
              variant="outline"
              className="flex-1 h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Exit
            </Button>
            
            <Button
              onClick={onDismiss}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-lg"
            >
              Continue Anyway
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}