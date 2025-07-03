import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles } from 'lucide-react';
import { JediMascotMessage } from '../../types';

interface JediMascotProps {
  userRank: string;
  streakDays: number;
  totalPoints: number;
}

const JediMascot: React.FC<JediMascotProps> = ({ userRank, streakDays, totalPoints }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<JediMascotMessage | null>(null);

  const messages: Record<string, JediMascotMessage[]> = {
    welcome: [
      { text: "Welcome, young one. Your journey to mastery begins now.", type: 'wisdom' },
      { text: "The Force is strong with you. Let's unlock your potential!", type: 'encouragement' },
    ],
    streak: [
      { text: `${streakDays} days of dedication! Your discipline grows stronger.`, type: 'achievement' },
      { text: "Consistency is the path to mastery. Well done!", type: 'encouragement' },
    ],
    rankUp: [
      { text: `You have become a ${userRank}! Your skills have grown.`, type: 'achievement' },
      { text: "Your training pays off. Continue on this path.", type: 'wisdom' },
    ],
    reminder: [
      { text: "Remember your daily practice. The Force flows through consistent effort.", type: 'reminder' },
      { text: "A Jedi's strength comes from regular training. Don't forget your skills!", type: 'reminder' },
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

  const showRandomMessage = () => {
    const messageTypes = Object.keys(messages);
    const randomType = messageTypes[Math.floor(Math.random() * messageTypes.length)];
    const randomMessage = messages[randomType][Math.floor(Math.random() * messages[randomType].length)];
    setCurrentMessage(randomMessage);
    setIsVisible(true);
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-green-100 border-green-300';
      case 'wisdom': return 'bg-purple-100 border-purple-300';
      case 'encouragement': return 'bg-blue-100 border-blue-300';
      case 'reminder': return 'bg-yellow-100 border-yellow-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <>
      {/* Floating Mascot Button */}
      <motion.button
        onClick={showRandomMessage}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#3CA7E0] rounded-full shadow-lg flex items-center justify-center z-50"
        whileHover={{ scale: 1.1, boxShadow: '0 0 20px rgba(174, 235, 249, 0.5)' }}
        whileTap={{ scale: 0.9 }}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          y: { repeat: Infinity, duration: 3 },
          rotate: { repeat: Infinity, duration: 6 },
        }}
      >
        <Bot className="h-8 w-8 text-white" />
        <motion.div
          className="absolute -top-1 -right-1 w-4 h-4 bg-[#5ED3F3] rounded-full flex items-center justify-center"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Sparkles className="h-2 w-2 text-white" />
        </motion.div>
      </motion.button>

      {/* Message Popup */}
      <AnimatePresence>
        {isVisible && currentMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-24 right-6 max-w-xs z-50"
          >
            <div className={`p-4 rounded-lg border-2 ${getMessageColor(currentMessage.type)} shadow-lg`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-[#3CA7E0]" />
                  <span className="text-xs font-semibold text-[#2E3A59]">Jedi Guide</span>
                </div>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-sm text-[#2E3A59] leading-relaxed">
                {currentMessage.text}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default JediMascot;