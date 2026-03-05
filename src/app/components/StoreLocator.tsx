import { ShoppingBag, Store } from 'lucide-react';
import { Badge } from './ui/badge';

interface IngredientStore {
  ingredient: string;
  stores: string[];
}

interface StoreLocatorProps {
  ingredient: string;
  stores: IngredientStore[];
}

export function StoreLocator({ ingredient, stores }: StoreLocatorProps) {
  // Safety check: ensure stores is an array
  if (!stores || !Array.isArray(stores) || stores.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-bold text-gray-900">Where to Buy</h3>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Find these ingredients at stores near you in the Philippines
      </p>

      <div className="space-y-4">
        {stores.map((item, index) => {
          // Safety check: ensure item and item.stores exist
          if (!item || !item.stores || !Array.isArray(item.stores)) {
            return null;
          }

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Store className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{item.ingredient}</h4>
                  <p className="text-xs text-gray-500">Available at:</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 ml-11">
                {item.stores.map((store, storeIndex) => (
                  <Badge
                    key={storeIndex}
                    className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1"
                  >
                    {store}
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}