import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Target, Trophy, Upload } from 'lucide-react';

const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/courses', icon: BookOpen, label: 'Courses' },
    { to: '/upload', icon: Upload, label: 'Upload' },
    { to: '/skills', icon: Target, label: 'Skills' },
    { to: '/progress', icon: Trophy, label: 'Progress' },
  ];

  return (
    <nav className="bg-[#F5F7FA] border-r border-[#CBD5E1] w-64 h-full fixed left-0 top-16 z-40">
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
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#3CA7E0] text-white shadow-lg shadow-[#AEEBF9]/30'
                      : 'text-[#2E3A59] hover:bg-[#5ED3F3]/20 hover:text-[#3CA7E0]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : ''}`} />
                    <span className="font-medium">{item.label}</span>
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