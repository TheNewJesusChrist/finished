import React from 'react';
import { motion } from 'framer-motion';
import { Sword, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Youngling': return 'text-gray-500';
      case 'Padawan': return 'text-blue-500';
      case 'Knight': return 'text-purple-500';
      case 'Master': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <header className="bg-[#F5F7FA] border-b border-[#CBD5E1] sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
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
                  onClick={signOut}
                  className="p-2 text-[#2E3A59] hover:text-[#3CA7E0] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;