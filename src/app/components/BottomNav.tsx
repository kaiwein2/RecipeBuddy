import { Home, Compass, Bookmark, User, Lock } from 'lucide-react';
import { motion } from 'motion/react';

type NavItem = 'home' | 'explore' | 'bookmarks' | 'profile';

interface BottomNavProps {
  activeItem: NavItem;
  onNavigate: (item: NavItem) => void;
  isGuest?: boolean; // Add isGuest prop
}

export function BottomNav({ activeItem, onNavigate, isGuest = false }: BottomNavProps) {
  const navItems = [
    { id: 'home' as NavItem, icon: Home, label: 'Home' },
    { id: 'explore' as NavItem, icon: Compass, label: 'Explore' },
    { id: 'bookmarks' as NavItem, icon: Bookmark, label: 'Bookmarks' },
    { id: 'profile' as NavItem, icon: User, label: 'Profile' },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-auto sm:w-[400px] sm:ml-[calc(50vw-200px)] z-50">
      <div className="bg-white/95 shadow-lg rounded-3xl px-4 py-3 safe-area-bottom border border-gray-100">
        <div className="flex items-center justify-between">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isRestricted = isGuest && (item.id === 'bookmarks' || item.id === 'profile');
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1.5 relative p-2 min-h-[48px] touch-manipulation group"
              >
                <div className={`relative transition-all duration-300 w-12 h-8 flex items-center justify-center rounded-xl ${
                  isActive ? 'bg-orange-100/80 text-primary scale-110' : isRestricted ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  {isRestricted && (
                    <Lock className="w-3.5 h-3.5 text-gray-400 absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-sm" />
                  )}
                </div>
                <span className={`text-[10px] sm:text-xs font-bold tracking-wide transition-colors ${
                  isActive ? 'text-primary' : isRestricted ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}