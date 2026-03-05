import { Heart, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface RecipeCardProps {
  id: string;
  title: string;
  image: string;
  time?: string;
  servings?: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onClick?: () => void;
  description?: string;
  isGuest?: boolean;
}

export function RecipeCard({ 
  title, 
  image, 
  time, 
  servings, 
  isFavorite = false, 
  onToggleFavorite,
  onClick,
  description,
  isGuest = false
}: RecipeCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer flex flex-col p-4"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-gray-100 relative rounded-[24px] mb-3">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />
        
        {!isGuest && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="absolute top-3 right-3 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
          >
            <Heart 
              className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
            />
          </button>
        )}
        
        {time && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-white rounded-full flex items-center gap-1.5 shadow-md">
            <Clock className="w-4 h-4 text-gray-700" />
            <span className="text-sm font-semibold text-gray-900">{time}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 px-1">
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1.5">
          {title}
        </h3>
        
        {description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {description}
          </p>
        )}
        
        <div className="mt-auto space-y-3">
          {servings && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span className="font-medium">{servings}</span>
            </div>
          )}
          
          <button 
            className="w-full py-2.5 bg-[#1a1a2e] text-white rounded-[20px] text-sm font-semibold hover:bg-gray-900 transition-all duration-300 flex items-center justify-center gap-2 group/btn shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <span>See Complete Recipe</span>
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}