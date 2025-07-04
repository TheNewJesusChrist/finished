import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [clickCount, setClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Youngling': return 'text-gray-400';
      case 'Padawan': return 'neon-text';
      case 'Knight': return 'neon-text-green';
      case 'Master': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const playLightsaberSound = () => {
    try {
      const audio = new Audio('/starwars/lightsaber-on.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        console.log('Audio playback failed - user interaction required');
      });
    } catch (error) {
      console.log('Audio not available');
    }
  };

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    playLightsaberSound();
    
    if (clickCount === 4) { // 5th click (0-indexed)
      setShowEasterEgg(true);
      setClickCount(0);
      
      // Hide easter egg after 8 seconds
      setTimeout(() => {
        setShowEasterEgg(false);
      }, 8000);
    }
  };

  const handleLogoHover = () => {
    setIsHovering(true);
    if (clickCount === 0) { // Only play on first hover to avoid spam
      playLightsaberSound();
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
      <header className="bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 border-b border-blue-500/30 sticky top-0 z-50 backdrop-blur-md space-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-3 cursor-pointer select-none"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              onClick={handleLogoClick}
              onMouseEnter={handleLogoHover}
              onMouseLeave={() => setIsHovering(false)}
            >
              <motion.div
                className="lightsaber-glow"
                animate={{
                  rotate: isHovering ? [0, 5, -5, 0] : 0,
                }}
                transition={{ duration: 0.6 }}
              >
                <img 
                  src="/starwars/lightsaber.svg" 
                  alt="Lightsaber" 
                  className="h-8 w-8"
                />
              </motion.div>
              <span className="text-xl font-bold neon-text orbitron">
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
                  <p className="text-sm text-blue-200 font-medium">{user.name}</p>
                  <p className={`text-xs font-semibold ${getRankColor(user.jedi_rank)}`}>
                    {user.jedi_rank}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full flex items-center justify-center pulse-glow">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <motion.button
                    onClick={handleSignOut}
                    className="p-2 text-blue-200 hover:text-red-400 transition-colors sw-button rounded-lg"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
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
              className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 rounded-2xl p-8 shadow-2xl max-w-md mx-auto hologram"
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
                  className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-blue-400/50 shadow-xl"
                  animate={{ 
                    boxShadow: [
                      '0 0 20px rgba(59, 130, 246, 0.5)',
                      '0 0 40px rgba(59, 130, 246, 0.8)',
                      '0 0 20px rgba(59, 130, 246, 0.5)'
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
                      target.parentElement!.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-6xl">🤖</div>';
                    }}
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-2xl font-bold mb-3 neon-text orbitron">
                    🎉 Surprise Jedi! 🎉
                  </h2>
                  <p className="text-lg mb-2 font-semibold neon-text-green">
                    You've unlocked a secret!
                  </p>
                  <p className="text-sm opacity-90 mb-4 share-tech">
                    "The Force is strong with those who seek hidden knowledge."
                  </p>
                  <p className="text-xs opacity-75 share-tech">
                    - Master of Secrets
                  </p>
                </motion.div>
              </div>
              
              {/* Animated sparkles around the avatar */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-blue-300 text-2xl"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    top: `${20 + Math.random() * 60}%`,
                  }}
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{ 
                    rotate: { duration: 3 + Math.random() * 2, repeat: Infinity },
                    scale: { duration: 2 + Math.random(), repeat: Infinity },
                    opacity: { duration: 1.5 + Math.random(), repeat: Infinity }
                  }}
                >
                  ✨
                </motion.div>
              ))}

              {/* Floating particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-blue-400 rounded-full"
                  style={{
                    left: `${10 + Math.random() * 80}%`,
                    top: `${10 + Math.random() * 80}%`,
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