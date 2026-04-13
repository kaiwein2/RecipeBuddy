import { ShoppingBag, Store, MapPin } from 'lucide-react';
import { Badge } from './ui/badge';

interface IngredientStore {
  ingredient: string;
  stores: string[];
}

interface StoreLocatorProps {
  ingredient: string;
  stores: IngredientStore[];
  onOpenMap?: (ingredient: string, stores: string[]) => void;
}

export function StoreLocator({ ingredient, stores, onOpenMap }: StoreLocatorProps) {
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
        Tap a store to instantly locate branches in Metro Manila, Philippines
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
                  <p className="text-xs text-blue-600 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Select to view map tracking:
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 ml-11">
                {item.stores.map((store, storeIndex) => (
                  <button
                    key={storeIndex}
                    onClick={() => {
                      if (onOpenMap) onOpenMap(item.ingredient, [store]);
                    }}
                    className="inline-block bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 px-3 py-1.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                  >
                    {store}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}