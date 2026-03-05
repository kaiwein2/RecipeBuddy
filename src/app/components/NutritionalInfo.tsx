import { Flame, Activity } from 'lucide-react';

interface NutritionalInfoProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

export function NutritionalInfo({ calories, protein, carbs, fat, fiber, sugar }: NutritionalInfoProps) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">Nutritional Info</h3>
          <span className="text-sm text-gray-500">Per Serving</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-5 border border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Calories</span>
            <span className="text-3xl font-bold text-primary">{calories}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Protein</span>
            <span className="text-lg font-semibold text-gray-900">{protein}g</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Carbohydrates</span>
            <span className="text-lg font-semibold text-gray-900">{carbs}g</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <span className="text-sm text-gray-600">Fat</span>
            <span className="text-lg font-semibold text-gray-900">{fat}g</span>
          </div>
          {fiber !== undefined && (
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Fiber</span>
              <span className="text-lg font-semibold text-gray-900">{fiber}g</span>
            </div>
          )}
          {sugar !== undefined && (
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-gray-600">Sugars</span>
              <span className="text-lg font-semibold text-gray-900">{sugar}g</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}