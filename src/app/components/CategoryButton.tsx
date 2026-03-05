import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface CategoryButtonProps {
  icon: LucideIcon;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export function CategoryButton({ icon: Icon, label, isActive = false, onClick }: CategoryButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center gap-2.5 px-5 py-3 rounded-full transition-all duration-300 whitespace-nowrap font-medium text-sm
        ${
          isActive 
            ? 'bg-gray-900 text-white shadow-lg' 
            : 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md border border-gray-200'
        }
      `}
    >
      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-600'}`} />
      <span>{label}</span>
    </motion.button>
  );
}