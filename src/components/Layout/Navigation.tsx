import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Target, Trophy, Upload } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const Navigation: React.FC = () => {
  const { theme } = useTheme();
  
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/skills', icon: Target, label: 'Skills' },
    { to: '/progress', icon: Trophy, label: 'Progress' },
  ];

  return (
    <nav className={`
      w-64 h-full fixed left-0 top-16 z-40 border-r transition-all duration-300
      ${theme === 'dark' 
        ? 'bg-gradient-to-b from-gray-900 via-blue-900 to-gray-900 border-blue-500/30 space-bg' 
        : 'bg-white border-gray-200'
      }
    `}>
      <div className="p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => (
            <motion.li
              key={item.to}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) => {
                  if (theme === 'dark') {
                    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 sw-button ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg neon-glow'
                        : 'text-blue-200 hover:text-white'
                    }`;
                  } else {
                    return `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                        : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                    }`;
                  }
                }}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 ${
                      theme === 'dark' 
                        ? (isActive ? 'text-white' : 'text-blue-300')
                        : (isActive ? 'text-indigo-700' : 'text-gray-500')
                    }`} />
                    <span className="font-medium orbitron">{item.label}</span>
                  </>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;