import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        relative p-2 rounded-lg transition-all duration-300 
        ${theme === 'dark' 
          ? 'bg-blue-900/50 text-blue-200 hover:bg-blue-800/50 border border-blue-500/30' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === 'dark' ? 0 : 180,
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 0.3 }}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </motion.div>
      
      {/* Glow effect for dark theme */}
      {theme === 'dark' && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-blue-400/20"
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.button>
  );
};

export default ThemeToggle;