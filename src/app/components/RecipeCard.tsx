import { Heart, Clock, Users, ArrowRight, Edit2, Trash2 } from 'lucide-react';
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
  isAuthored?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
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
  isGuest = false,
  isAuthored = false,
  onEdit,
  onDelete
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
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {!isGuest && !isAuthored && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="absolute top-2 right-2 w-7 h-7 sm:top-3 sm:right-3 sm:w-10 sm:h-10 bg-white/95 rounded-full flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all duration-300 z-10"
          >
            <Heart 
              className={`w-3.5 h-3.5 sm:w-5 sm:h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
            />
          </button>
        )}

        {isAuthored && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 z-20">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-white/95 rounded-full flex items-center justify-center shadow hover:bg-white hover:scale-110 transition-all duration-300"
            >
              <Edit2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/90 rounded-full flex items-center justify-center shadow hover:bg-red-500 hover:scale-110 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        )}
        
        {time && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 sm:top-3 sm:left-3 sm:px-3 sm:py-1.5 bg-white/95 rounded-full flex items-center gap-1 sm:gap-1.5 shadow max-w-[45%] sm:max-w-[50%] overflow-hidden">
            <Clock className="w-2.5 h-2.5 sm:w-4 sm:h-4 text-gray-800 flex-shrink-0" />
            <span className="text-[10px] sm:text-sm font-bold text-gray-900 truncate tracking-tight">{time}</span>
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-1 px-1 min-w-0">
        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-1.5 line-clamp-2 break-words text-ellipsis">
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
            className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-[20px] text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:from-orange-600 hover:to-amber-600 transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 group/btn px-2"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <span className="truncate max-w-[80%]">View Recipe</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover/btn:translate-x-1 transition-transform flex-shrink-0" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}