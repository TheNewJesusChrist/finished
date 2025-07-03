import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import JediMascot from '../components/JediMascot/JediMascot';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'AI-Powered Learning',
      description: 'Upload PDFs and presentations to create personalized quiz sessions',
      color: '#3CA7E0'
    },
    {
      icon: Target,
      title: 'Daily Jedi Skills',
      description: 'Track meditation, workout, and reading habits with visual progress rings',
      color: '#10B981'
    },
    {
      icon: Trophy,
      title: 'Rank Progression',
      description: 'Advance from Youngling to Jedi Master through consistent practice',
      color: '#8B5CF6'
    },
    {
      icon: Zap,
      title: 'Force Guidance',
      description: 'Get personalized advice from your AI Jedi mentor',
      color: '#F59E0B'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#3CA7E0]/10 to-[#5ED3F3]/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-[#2E3A59] mb-6" style={{ fontFamily: 'Orbitron, monospace' }}>
              Master Your Skills
              <br />
              <span className="text-[#3CA7E0]">Like a Jedi</span>
            </h1>
            <p className="text-xl text-[#BFC9D9] mb-8 max-w-3xl mx-auto">
              Transform your learning journey with AI-powered quizzes, daily habit tracking, 
              and personalized guidance from your Jedi mentor.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses">
                  <motion.button
                    className="px-8 py-4 bg-[#3CA7E0] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(60, 167, 224, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Continue Journey</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
                <Link to="/upload">
                  <motion.button
                    className="px-8 py-4 bg-white text-[#3CA7E0] rounded-lg font-semibold border-2 border-[#3CA7E0] hover:bg-[#3CA7E0] hover:text-white transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Upload New Course
                  </motion.button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/auth">
                  <motion.button
                    className="px-8 py-4 bg-[#3CA7E0] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                    whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(60, 167, 224, 0.3)' }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Begin Your Journey</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-[#2E3A59] mb-4">
            Unleash Your Inner Jedi
          </h2>
          <p className="text-lg text-[#BFC9D9] max-w-2xl mx-auto">
            Our comprehensive platform combines cutting-edge AI with proven learning methodologies 
            to help you master any skill.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-[#CBD5E1]"
              whileHover={{ scale: 1.05 }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                   style={{ backgroundColor: feature.color + '20' }}>
                <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-semibold text-[#2E3A59] mb-2">
                {feature.title}
              </h3>
              <p className="text-[#BFC9D9] text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Jedi Mascot */}
      {user && (
        <JediMascot 
          userRank={user.jedi_rank}
          streakDays={user.streak_days}
          totalPoints={user.total_points}
        />
      )}
    </div>
  );
};

export default Home;