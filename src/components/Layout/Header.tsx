import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from './ThemeToggle';
import EasterEggToast from './EasterEggToast';
import toast from 'react-hot-toast';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const { theme } = useTheme();
  const [clickCount, setClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [easterEggShown, setEasterEggShown] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const getRankColor = (rank: string) => {
    if (theme === 'dark') {
      switch (rank) {
        case 'Youngling': return 'text-gray-400';
        case 'Padawan': return 'neon-text';
        case 'Knight': return 'neon-text-green';
        case 'Master': return 'text-yellow-400';
        default: return 'text-gray-400';
      }
    } else {
      switch (rank) {
        case 'Youngling': return 'text-gray-500';
        case 'Padawan': return 'text-blue-600';
        case 'Knight': return 'text-green-600';
        case 'Master': return 'text-yellow-600';
        default: return 'text-gray-500';
      }
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

  const playEasterEggSound = () => {
    try {
      // Create a soft ping sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Web Audio API not available');
    }
  };

  const handleLogoClick = () => {
    const currentTime = Date.now();
    
    // Reset if more than 10 seconds have passed since last click
    if (currentTime - lastClickTime > 10000) {
      setClickCount(1);
    } else {
      setClickCount(prev => prev + 1);
    }
    
    setLastClickTime(currentTime);
    
    if (theme === 'dark') {
      playLightsaberSound();
    }
    
    // Trigger easter egg on 5th click within 10 seconds
    if (clickCount === 4 && !easterEggShown) { // 5th click (0-indexed)
      setShowEasterEgg(true);
      setEasterEggShown(true);
      setClickCount(0);
      playEasterEggSound();
    }
  };

  const handleLogoHover = () => {
    setIsHovering(true);
    if (clickCount === 0 && theme === 'dark') { // Only play on first hover to avoid spam
      playLightsaberSound();
    }
  };

  // Reset click count after 10 seconds of inactivity
  useEffect(() => {
    if (clickCount > 0) {
      const timer = setTimeout(() => {
        setClickCount(0);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [lastClickTime]);

  // Reset easter egg on page reload
  useEffect(() => {
    setEasterEggShown(false);
  }, []);

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
      <header className={`
        sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300
        ${theme === 'dark' 
          ? 'bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 border-blue-500/30 space-bg' 
          : 'bg-white/80 border-gray-200'
        }
      `}>
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
              <span className={`
                text-xl font-bold orbitron transition-colors duration-300
                ${theme === 'dark' ? 'neon-text' : 'text-gray-900'}
              `}>
                Force Skill Tracker
              </span>
            </motion.div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              {user && (
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="text-right">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-200' : 'text-gray-700'}`}>
                      {user.name}
                    </p>
                    <p className={`text-xs font-semibold ${getRankColor(user.jedi_rank)}`}>
                      {user.jedi_rank}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                      ${theme === 'dark' 
                        ? 'bg-gradient-to-br from-blue-500 to-cyan-400 pulse-glow' 
                        : 'bg-gradient-to-br from-indigo-500 to-purple-500'
                      }
                    `}>
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <motion.button
                      onClick={handleSignOut}
                      className={`
                        p-2 rounded-lg transition-colors sw-button
                        ${theme === 'dark' 
                          ? 'text-blue-200 hover:text-red-400' 
                          : 'text-gray-600 hover:text-red-500'
                        }
                      `}
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
        </div>
      </header>

      {/* Easter Egg Toast Notification */}
      <EasterEggToast 
        show={showEasterEgg} 
        onClose={() => setShowEasterEgg(false)}
        theme={theme}
      />
    </>
  );
};

export default Header;