import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Calendar, Users, User } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: Home, label: 'Pano', color: 'from-blue-500 to-blue-600' },
  { path: '/tasks', icon: CheckSquare, label: 'Görevler', color: 'from-green-500 to-green-600' },
  { path: '/calendar', icon: Calendar, label: 'Takvim', color: 'from-purple-500 to-purple-600' },
  { path: '/family', icon: Users, label: 'Aile', color: 'from-orange-500 to-orange-600' },
  { path: '/profile', icon: User, label: 'Profil', color: 'from-pink-500 to-pink-600' },
];

export const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden"
    >
      <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center flex-1 py-2"
              whileTap={{ scale: 0.9 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 rounded-xl`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative"
              >
                <div
                  className={`p-2 rounded-xl transition-colors ${
                    isActive
                      ? `bg-gradient-to-br ${item.color} shadow-lg`
                      : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`}
                  />
                </div>
              </motion.div>

              <span
                className={`text-xs mt-1 font-medium transition-colors ${
                  isActive ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="indicator"
                  className={`absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${item.color} rounded-full`}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

