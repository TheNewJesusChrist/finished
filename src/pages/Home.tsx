import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Target, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import JediMascot3D from '../components/JediMascot/JediMascot3D';

const Home: React.FC = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'AI-Powered Learning',
      description: 'Upload PDFs and presentations to create personalized quiz sessions',
      color: '#00BFFF'
    },
    {
      icon: Target,
      title: 'Daily Jedi Skills',
      description: 'Track meditation, workout, and reading habits with visual progress rings',
      color: '#00FF7F'
    },
    {
      icon: Trophy,
      title: 'Rank Progression',
      description: 'Advance from Youngling to Jedi Master through consistent practice',
      color: '#FFD700'
    },
    {
      icon: Zap,
      title: 'Force Guidance',
      description: 'Get personalized advice from your AI Jedi mentor',
      color: '#FF6B35'
    },
  ];

  return (
    <div className="min-h-screen space-bg">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 orbitron">
              Master Your Skills
              <br />
              <span className="neon-text">Like a Jedi</span>
            </h1>
            <p className="text-xl text-blue-200 mb-8 max-w-3xl mx-auto share-tech">
              Transform your learning journey with AI-powered quizzes, daily habit tracking, 
              and personalized guidance from your Jedi mentor.
            </p>
            
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/courses">
                  <motion.button
                    className="px-8 py-4 sw-button rounded-lg font-semibold flex items-center space-x-2 orbitron"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>Continue Journey</span>
                    <ArrowRight className="h-5 w-5" />
                  </motion.button>
                </Link>
                <Link to="/upload">
                  <motion.button
                    className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-semibold border border-green-400 hover:from-green-500 hover:to-emerald-400 transition-all duration-300 orbitron"
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
                    className="px-8 py-4 sw-button rounded-lg font-semibold flex items-center space-x-2 orbitron"
                    whileHover={{ scale: 1.05 }}
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
          <h2 className="text-3xl font-bold text-white mb-4 orbitron">
            Unleash Your Inner Jedi
          </h2>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto share-tech">
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
              className="hologram rounded-xl p-6 hover:shadow-xl transition-all duration-300 float-animation"
              whileHover={{ scale: 1.05 }}
              style={{ animationDelay: `${index * 0.5}s` }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-lg mb-4 mx-auto"
                   style={{ 
                     backgroundColor: feature.color + '20',
                     boxShadow: `0 0 20px ${feature.color}40`
                   }}>
                <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2 orbitron">
                {feature.title}
              </h3>
              <p className="text-blue-200 text-sm share-tech">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* BB-8 Mascot */}
      {user && (
        <motion.div
          className="fixed bottom-6 left-6 z-50"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="bb8-body">
            <img 
              src="/starwars/bb8.svg" 
              alt="BB-8" 
              className="h-16 w-16 cursor-pointer hover:scale-110 transition-transform duration-300"
              title="BB-8 is here to help!"
            />
          </div>
        </motion.div>
      )}

      {/* 3D Jedi Mascot */}
      {user && (
        <JediMascot3D 
          userRank={user.jedi_rank}
          streakDays={user.streak_days}
          totalPoints={user.total_points}
        />
      )}
    </div>
  );
};

export default Home;