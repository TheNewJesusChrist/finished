import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles, MessageCircle, Lightbulb, Target, Trophy } from 'lucide-react';
import { JediMascotMessage } from '../../types';

interface JediMascot3DProps {
  userRank: string;
  streakDays: number;
  totalPoints: number;
}

const JediMascot3D: React.FC<JediMascot3DProps> = ({ userRank, streakDays, totalPoints }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<JediMascotMessage | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [eyePosition, setEyePosition] = useState({ x: 0, y: 0 });
  const mascotRef = useRef<HTMLDivElement>(null);

  const messages: Record<string, JediMascotMessage[]> = {
    welcome: [
      { text: "Welcome, young one. Your journey to mastery begins now.", type: 'wisdom' },
      { text: "The Force is strong with you. Let's unlock your potential!", type: 'encouragement' },
      { text: "I sense great potential in you. Ready to begin your training?", type: 'wisdom' },
    ],
    streak: [
      { text: `${streakDays} days of dedication! Your discipline grows stronger.`, type: 'achievement' },
      { text: "Consistency is the path to mastery. Well done!", type: 'encouragement' },
      { text: "Your commitment to daily practice shows true Jedi spirit.", type: 'achievement' },
    ],
    rankUp: [
      { text: `You have become a ${userRank}! Your skills have grown.`, type: 'achievement' },
      { text: "Your training pays off. Continue on this path.", type: 'wisdom' },
      { text: "I am proud of your progress, young learner.", type: 'encouragement' },
    ],
    reminder: [
      { text: "Remember your daily practice. The Force flows through consistent effort.", type: 'reminder' },
      { text: "A Jedi's strength comes from regular training. Don't forget your skills!", type: 'reminder' },
      { text: "The path to mastery requires daily dedication. Stay strong!", type: 'reminder' },
    ],
    motivation: [
      { text: "Every master was once a beginner. Keep pushing forward!", type: 'encouragement' },
      { text: "The Force will be with you, always.", type: 'wisdom' },
      { text: "Your potential is limitless. Believe in yourself!", type: 'encouragement' },
    ],
  };

  useEffect(() => {
    // Show welcome message on mount
    const timer = setTimeout(() => {
      setCurrentMessage(messages.welcome[0]);
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Mouse tracking for eye movement
    const handleMouseMove = (e: MouseEvent) => {
      if (mascotRef.current) {
        const rect = mascotRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;
        
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const maxDistance = 100;
        
        if (distance < maxDistance) {
          setEyePosition({
            x: (deltaX / maxDistance) * 3,
            y: (deltaY / maxDistance) * 3,
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const showRandomMessage = () => {
    setIsAnimating(true);
    const messageTypes = Object.keys(messages);
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const randomMessage = messages[randomType][Math.floor(Math.random() * messages[randomType].length)];
    setCurrentMessage(randomMessage);
    setIsVisible(true);
    
    setTimeout(() => setIsAnimating(false), 500);
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-100 border-green-300 text-green-800';
      case 'wisdom': return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'encouragement': return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'reminder': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4" />;
      case 'wisdom': return <Lightbulb className="h-4 w-4" />;
      case 'encouragement': return <Target className="h-4 w-4" />;
      case 'reminder': return <MessageCircle className="h-4 w-4" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* 3D Floating Mascot */}
      <motion.div
        ref={mascotRef}
        className="fixed bottom-6 right-6 z-50 cursor-pointer"
        onClick={showRandomMessage}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0],
          rotateY: [0, 5, -5, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 3 },
          rotateY: { repeat: Infinity, duration: 6 },
        }}
      >
        {/* 3D Mascot Body */}
        <div className="relative">
          {/* Shadow */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm" />
          
          {/* Main Body */}
          <motion.div
            className="w-16 h-20 bg-gradient-to-b from-[#3CA7E0] to-[#5ED3F3] rounded-2xl shadow-2xl relative overflow-hidden"
            animate={{
              boxShadow: isAnimating 
                ? '0 0 30px rgba(174, 235, 249, 0.8)' 
                : '0 10px 25px rgba(60, 167, 224, 0.3)',
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Holographic Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 animate-pulse" />
            
            {/* Face */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              {/* Eyes */}
              <div className="flex space-x-2 mb-2">
                <motion.div
                  className="w-2 h-2 bg-white rounded-full relative overflow-hidden"
                  animate={{
                    scale: isAnimating ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-1 h-1 bg-[#2E3A59] rounded-full absolute top-0.5 left-0.5"
                    animate={{
                      x: eyePosition.x,
                      y: eyePosition.y,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </motion.div>
                <motion.div
                  className="w-2 h-2 bg-white rounded-full relative overflow-hidden"
                  animate={{
                    scale: isAnimating ? [1, 1.2, 1] : 1,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="w-1 h-1 bg-[#2E3A59] rounded-full absolute top-0.5 left-0.5"
                    animate={{
                      x: eyePosition.x,
                      y: eyePosition.y,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </motion.div>
              </div>
              
              {/* Mouth */}
              <motion.div
                className="w-3 h-1 bg-white rounded-full"
                animate={{
                  scaleX: isAnimating ? [1, 1.5, 1] : 1,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            
            {/* Body Details */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-8 h-1 bg-white/30 rounded-full mb-1" />
              <div className="w-6 h-1 bg-white/20 rounded-full" />
            </div>
          </motion.div>
          
          {/* Floating Particles */}
          <motion.div
            className="absolute -top-2 -right-2 w-3 h-3 bg-[#AEEBF9] rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="h-2 w-2 text-white" />
          </motion.div>
        </div>
      </motion.div>

      {/* Message Popup */}
      <AnimatePresence>
        {isVisible && currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-28 right-6 max-w-xs z-50"
          >
            <div className={`p-4 rounded-xl border-2 shadow-xl backdrop-blur-sm ${getMessageColor(currentMessage.type)}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getMessageIcon(currentMessage.type)}
                  <span className="text-xs font-semibold">Jedi Guide</span>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-current opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm leading-relaxed">
                {currentMessage.text}
              </p>
              
              {/* Message tail */}
              <div className="absolute bottom-0 right-8 transform translate-y-full">
                <div className={`w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent ${
                  currentMessage.type === 'achievement' ? 'border-t-green-300' :
                  currentMessage.type === 'wisdom' ? 'border-t-purple-300' :
                  currentMessage.type === 'encouragement' ? 'border-t-blue-300' :
                  'border-t-yellow-300'
                }`} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JediMascot3D;