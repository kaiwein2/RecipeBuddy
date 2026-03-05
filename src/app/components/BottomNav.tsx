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
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-6 pt-3 safe-area-bottom shadow-lg z-50">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          const isRestricted = isGuest && (item.id === 'bookmarks' || item.id === 'profile');
          
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center gap-1 relative"
            >
              <div className={`relative transition-colors ${
                isActive ? 'text-primary' : isRestricted ? 'text-gray-300' : 'text-gray-400'
              }`}>
                <Icon className="w-6 h-6" />
                {isRestricted && (
                  <Lock className="w-3 h-3 text-gray-400 absolute -top-1 -right-1 bg-white rounded-full" />
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-2 bg-orange-50 rounded-xl -z-10"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
              <span className={`text-xs font-medium ${
                isActive ? 'text-primary' : isRestricted ? 'text-gray-300' : 'text-gray-400'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}