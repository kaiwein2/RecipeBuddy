import { ChefHat } from 'lucide-react';
import { motion } from 'motion/react';

interface RelatedRecipe {
  id: string;
  title: string;
  image: string;
  time: string;
  similarity: number;
}

interface RelatedRecipesProps {
  recipes: RelatedRecipe[];
  onRecipeClick: (id: string) => void;
}

export function RelatedRecipes({ recipes, onRecipeClick }: RelatedRecipesProps) {
  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">
        Related <span className="text-primary">Recipes</span>
      </h3>
      <p className="text-gray-600 mb-6 text-sm">You might also like these similar recipes</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {recipes.map((recipe, index) => (
          <motion.div
            key={recipe.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onRecipeClick(recipe.id)}
            className="cursor-pointer group bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="aspect-video overflow-hidden bg-gray-100">
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-4">
              <h4 className="font-semibold text-base text-gray-900 line-clamp-2 mb-2">
                {recipe.title}
              </h4>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{recipe.time}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}