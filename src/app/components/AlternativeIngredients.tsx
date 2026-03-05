import { ArrowRightLeft, DollarSign, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Alternative {
  original: string;
  alternative: string;
  reason: 'cheaper' | 'available' | 'healthier';
}

interface AlternativeIngredientsProps {
  alternatives: Alternative[];
}

export function AlternativeIngredients({ alternatives }: AlternativeIngredientsProps) {
  const getReasonBadge = (reason: Alternative['reason']) => {
    switch (reason) {
      case 'cheaper':
        return (
          <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            <DollarSign className="w-3 h-3" />
            Cheaper
          </span>
        );
      case 'available':
        return (
          <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            More Available
          </span>
        );
      case 'healthier':
        return (
          <span className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Healthier
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRightLeft className="w-5 h-5 text-green-500" />
        <h3 className="text-lg font-bold text-gray-900">Alternative Ingredients</h3>
      </div>

      <div className="space-y-3">
        {alternatives.map((alt, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-4 border border-gray-200"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 line-through">{alt.original}</span>
                  <ArrowRightLeft className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">{alt.alternative}</span>
                </div>
                {getReasonBadge(alt.reason)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-xl">
        <p className="text-xs text-blue-700">
          💡 Tip: These alternatives maintain the recipe's flavor while offering benefits like lower cost or better availability.
        </p>
      </div>
    </div>
  );
}
