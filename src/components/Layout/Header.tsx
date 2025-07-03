import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sword, User, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);

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
      setShowEasterEgg(true);
      setClickCount(0);
      
      // Play sound effect (if available)
      try {
        const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav');
        audio.volume = 0.3;
        audio.play().catch(() => {
          console.log('Audio playback failed');
        });
      } catch (error) {
        console.log('Audio not available');
      }
      
      // Hide easter egg after 8 seconds
      setTimeout(() => {
        setShowEasterEgg(false);
      }, 8000);
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

  const closeEasterEgg = () => {
    setShowEasterEgg(false);
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

      {/* Enhanced Easter Egg with Custom Avatar */}
      <AnimatePresence>
        {showEasterEgg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
            onClick={closeEasterEgg}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                y: [0, -10, 0],
              }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ 
                duration: 0.8,
                y: { repeat: Infinity, duration: 2 }
              }}
              className="relative bg-gradient-to-br from-[#3CA7E0] to-[#5ED3F3] rounded-2xl p-8 shadow-2xl max-w-md mx-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <motion.button
                onClick={closeEasterEgg}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-4 w-4 text-white" />
              </motion.button>

              <div className="text-center text-white">
                {/* Custom Avatar */}
                <motion.div
                  className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-white/30 shadow-xl"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(255,255,255,0.3)',
                      '0 0 40px rgba(255,255,255,0.6)',
                      '0 0 20px rgba(255,255,255,0.3)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <img 
                    src="/easter/my-easter-avatar.png" 
                    alt="Secret Jedi Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-6xl">🤖</div>';
                    }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-3">
                    🎉 Surprise Jedi! 🎉
                  </h2>
                  <p className="text-lg mb-2 font-semibold">
                    You've unlocked a secret!
                  </p>
                  <p className="text-sm opacity-90 mb-4">
                    "The Force is strong with those who seek hidden knowledge."
                  </p>
                  <p className="text-xs opacity-75">
                    - Master of Secrets
                  </p>
                </motion.div>
              </div>
              
              {/* Animated sparkles around the avatar */}
              <motion.div
                className="absolute top-16 left-16 text-yellow-300 text-2xl"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, repeat: Infinity },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute top-20 right-20 text-yellow-300 text-xl"
                animate={{ 
                  rotate: -360,
                  scale: [1, 1.3, 1]
                }}
                transition={{ 
                  rotate: { duration: 2.5, repeat: Infinity },
                  scale: { duration: 1.8, repeat: Infinity, delay: 0.5 }
                }}
              >
                ⭐
              </motion.div>
              <motion.div
                className="absolute bottom-20 left-20 text-yellow-300 text-lg"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 4, repeat: Infinity },
                  scale: { duration: 2, repeat: Infinity, delay: 1 }
                }}
              >
                💫
              </motion.div>
              <motion.div
                className="absolute bottom-24 right-16 text-yellow-300 text-xl"
                animate={{ 
                  rotate: -360,
                  scale: [1, 1.4, 1]
                }}
                transition={{ 
                  rotate: { duration: 3.5, repeat: Infinity },
                  scale: { duration: 1.2, repeat: Infinity, delay: 0.8 }
                }}
              >
                🌟
              </motion.div>

              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white/60 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;