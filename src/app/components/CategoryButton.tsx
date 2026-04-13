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
      className="flex flex-col items-center gap-2 group"
    >
      <div className={`w-[72px] h-[72px] rounded-2xl flex items-center justify-center transition-all shadow-sm ${isActive ? 'bg-[#FF6B35] text-white shadow-orange-500/20 shadow-lg border-none' : 'bg-white text-gray-700 border border-gray-100 hover:shadow-md'}`}>
        <Icon className={`w-7 h-7 stroke-[1.5] ${isActive ? 'text-white' : 'text-gray-700'}`} />
      </div>
      <span className={`text-xs font-bold transition-colors ${isActive ? 'text-[#FF6B35]' : 'text-gray-500 group-hover:text-gray-900'}`}>{label}</span>
    </motion.button>
  );
}