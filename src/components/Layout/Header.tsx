import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [showYoda, setShowYoda] = useState(false);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Youngling': return 'text-gray-500';
      case 'Padawan': return 'text-blue-500';
      case 'Knight': return 'text-purple-500';
      case 'Master': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickCount === 4) { // 5th click (0-indexed)
      setShowYoda(true);
      setClickCount(0);
      
      // Play Yoda sound effect (if available)
      try {
        const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Fallback if audio fails
          console.log('Audio playback failed');
        });
      } catch (error) {
        console.log('Audio not available');
      }
      
      // Hide Yoda after 5 seconds
      setTimeout(() => {
        setShowYoda(false);
      }, 5000);
    }
  };

  // Reset click count after 3 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [clickCount]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('May the Force be with you!');
    } catch (error: any) {
      toast.error('Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  return (
    <>
      <header className="bg-[#F5F7FA] border-b border-[#CBD5E1] sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer select-none"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleLogoClick}
            >
              <Sword className="h-8 w-8 text-[#3CA7E0]" />
              <span className="text-xl font-bold text-[#2E3A59]" style={{ fontFamily: 'Orbitron, monospace' }}>
                Force Skill Tracker
              </span>
            </motion.div>

            {user && (
              <motion.div 
                className="flex items-center space-x-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-right">
                  <p className="text-sm text-[#2E3A59] font-medium">{user.name}</p>
                  <p className={`text-xs ${getRankColor(user.jedi_rank)} font-semibold`}>
                    {user.jedi_rank}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-[#3CA7E0] rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <motion.button
                    onClick={handleSignOut}
                    className="p-2 text-[#2E3A59] hover:text-[#3CA7E0] transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </header>

      {/* Yoda Easter Egg */}
      <AnimatePresence>
        {showYoda && (
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              rotate: 0,
              y: [0, -20, 0],
            }}
            exit={{ opacity: 0, scale: 0, rotate: 180 }}
            transition={{ 
              duration: 0.8,
              y: { repeat: Infinity, duration: 2 }
            }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-full p-4 shadow-2xl">
              <div className="text-white text-center">
                <div className="text-4xl mb-2">🧙‍♂️</div>
                <div className="text-sm font-bold whitespace-nowrap">
                  "Strong with the Force, you are!"
                </div>
                <div className="text-xs mt-1 opacity-80">
                  - Master Yoda
                </div>
              </div>
            </div>
            
            {/* Sparkle effects */}
            <motion.div
              className="absolute -top-2 -left-2 text-yellow-300 text-xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -top-2 -right-2 text-yellow-300 text-xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2 text-yellow-300 text-xl"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -right-2 text-yellow-300 text-xl"
              animate={{ rotate: -360 }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            >
              ✨
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;