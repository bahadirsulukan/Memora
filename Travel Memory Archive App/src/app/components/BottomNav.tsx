import { useNavigate, useLocation } from 'react-router';
import { Globe, List, BarChart3, User, Plus } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/map', icon: Globe, label: 'World' },
    { path: '/trips', icon: List, label: 'Countries' },
    { path: '/add', icon: Plus, label: 'Add', isCenter: true },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 pb-6 pt-3 z-50">
      <div className="max-w-lg mx-auto flex items-end justify-around">
        {navItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative -mt-6"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full shadow-lg flex items-center justify-center">
                  <Plus className="text-white" size={32} strokeWidth={3} />
                </div>
              </motion.button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center gap-1 min-w-[60px] py-2"
            >
              <Icon
                size={24}
                className={`transition-colors ${
                  active ? 'text-blue-500' : 'text-gray-400'
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium transition-colors ${
                  active ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 w-1 h-1 bg-blue-500 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
