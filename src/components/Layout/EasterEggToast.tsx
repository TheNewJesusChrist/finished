import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface EasterEggToastProps {
  show: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

const EasterEggToast: React.FC<EasterEggToastProps> = ({ show, onClose, theme }) => {
  // Auto-close after 4 seconds
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 30,
            duration: 0.5 
          }}
          className={`
            fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] 
            max-w-sm w-full mx-4 cursor-pointer
          `}
          onClick={onClose}
        >
          <div className={`
            flex items-center space-x-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm
            transition-all duration-300 hover:scale-105
            ${theme === 'dark' 
              ? 'bg-gradient-to-r from-blue-900/90 to-purple-900/90 border-blue-400/50 text-white' 
              : 'bg-white/95 border-indigo-200 text-gray-900 shadow-xl'
            }
          `}>
            {/* Avatar */}
            <div className={`
              w-12 h-12 rounded-full overflow-hidden border-2 flex-shrink-0
              ${theme === 'dark' ? 'border-blue-400/50' : 'border-indigo-300'}
            `}>
              <img 
                src="https://i.postimg.cc/bJ9qXwnv/Copilot-20250703-132642.png"
                alt="Star Wars Ally"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to emoji if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.parentElement!.innerHTML = `<div class="w-full h-full ${theme === 'dark' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-indigo-500 to-purple-500'} flex items-center justify-center text-2xl">🤖</div>`;
                }}
              />
            </div>

            {/* Message */}
            <div className="flex-1 min-w-0">
              <p className={`
                text-sm font-medium orbitron
                ${theme === 'dark' ? 'text-blue-200' : 'text-indigo-700'}
              `}>
                You've unlocked a secret Star Wars ally!
              </p>
            </div>

            {/* Close button */}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={`
                w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0
                transition-colors duration-200
                ${theme === 'dark' 
                  ? 'text-blue-300 hover:text-white hover:bg-blue-700/50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Subtle glow effect for dark theme */}
          {theme === 'dark' && (
            <motion.div
              className="absolute inset-0 rounded-lg bg-blue-400/20 -z-10"
              animate={{ 
                opacity: [0, 0.5, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EasterEggToast;