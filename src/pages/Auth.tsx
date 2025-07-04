import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import toast from 'react-hot-toast';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp, continueAsGuest } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const result = await signIn(formData.email, formData.password);
        if (result.success) {
          toast.success('Welcome back, young Jedi!');
          navigate('/courses');
        }
      } else {
        const result = await signUp(formData.email, formData.password, formData.name);
        if (result.success) {
          toast.success('Your journey begins now!');
          navigate('/courses');
        }
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Something went wrong';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestAccess = () => {
    setLoading(true);
    try {
      const result = continueAsGuest();
      if (result.success) {
        toast.success('Welcome, Guest Jedi! Explore the Force...');
        navigate('/courses');
      }
    } catch (error: any) {
      toast.error('Failed to continue as guest');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setFormData({
      email: '',
      password: '',
      name: '',
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'space-bg' : 'bg-gray-50'}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`rounded-2xl p-8 w-full max-w-md transition-all duration-300 ${
          theme === 'dark' ? 'hologram' : 'bg-white shadow-xl border border-gray-200'
        }`}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300
              ${theme === 'dark' 
                ? 'bg-gradient-to-br from-blue-500 to-cyan-400 pulse-glow' 
                : 'bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg'
              }
            `}
          >
            <img src="/starwars/lightsaber.svg" alt="Lightsaber" className="h-10 w-10" />
          </motion.div>
          <h2 className={`text-2xl font-bold mb-2 orbitron ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
          <p className={`share-tech ${theme === 'dark' ? 'text-blue-200' : 'text-gray-600'}`}>
            {isLogin ? 'Continue your path to mastery' : 'Become a Jedi Master'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              mb-6 p-4 rounded-lg flex items-start space-x-3 border
              ${theme === 'dark' 
                ? 'bg-red-900/50 border-red-500/50' 
                : 'bg-red-50 border-red-200'
              }
            `}
          >
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'}`} />
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
              {isLogin && error.includes('incorrect') && (
                <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
                  Don't have an account?{' '}
                  <button
                    onClick={toggleMode}
                    className={`underline hover:no-underline ${theme === 'dark' ? 'neon-text' : 'text-indigo-600'}`}
                  >
                    Create one here
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className={`block text-sm font-medium mb-2 orbitron ${theme === 'dark' ? 'text-blue-200' : 'text-gray-700'}`}>
                Full Name
              </label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all duration-200 share-tech
                    ${theme === 'dark' 
                      ? 'bg-gray-900/50 border border-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white' 
                      : 'bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900'
                    }
                  `}
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className={`block text-sm font-medium mb-2 orbitron ${theme === 'dark' ? 'text-blue-200' : 'text-gray-700'}`}>
              Email Address
            </label>
            <div className="relative">
              <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all duration-200 share-tech
                  ${theme === 'dark' 
                    ? 'bg-gray-900/50 border border-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white' 
                    : 'bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900'
                  }
                `}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 orbitron ${theme === 'dark' ? 'text-blue-200' : 'text-gray-700'}`}>
              Password
            </label>
            <div className="relative">
              <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${theme === 'dark' ? 'text-blue-400' : 'text-gray-400'}`} />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`
                  w-full pl-10 pr-4 py-3 rounded-lg outline-none transition-all duration-200 share-tech
                  ${theme === 'dark' 
                    ? 'bg-gray-900/50 border border-blue-500/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent text-white' 
                    : 'bg-white border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900'
                  }
                `}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            {!isLogin && (
              <p className={`text-xs mt-1 share-tech ${theme === 'dark' ? 'text-blue-300' : 'text-gray-500'}`}>
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 sw-button rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed orbitron"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className={`animate-spin rounded-full h-5 w-5 border-b-2 mr-2 ${theme === 'dark' ? 'border-blue-400' : 'border-indigo-500'}`}></div>
                Processing...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </motion.button>
        </form>

        {/* Guest Access Button */}
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className={`w-full border-t ${theme === 'dark' ? 'border-blue-500/30' : 'border-gray-300'}`}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className={`px-2 share-tech ${theme === 'dark' ? 'bg-gray-900 text-blue-300' : 'bg-white text-gray-500'}`}>or</span>
            </div>
          </div>
          
          <motion.button
            onClick={handleGuestAccess}
            disabled={loading}
            className={`
              w-full mt-4 py-3 rounded-lg font-semibold shadow-lg transition-all duration-300 
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 orbitron
              ${theme === 'dark' 
                ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-400' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400'
              }
            `}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <UserCheck className="h-5 w-5" />
            <span>Continue as Guest</span>
          </motion.button>
          
          <p className={`text-xs text-center mt-2 share-tech ${theme === 'dark' ? 'text-blue-300' : 'text-gray-500'}`}>
            Explore all features without creating an account
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className={`text-sm share-tech ${theme === 'dark' ? 'text-blue-300' : 'text-gray-600'}`}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={toggleMode}
            className={`text-sm font-medium transition-colors duration-200 orbitron ${theme === 'dark' ? 'neon-text' : 'text-indigo-600 hover:text-indigo-500'}`}
          >
            {isLogin ? 'Create one here' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;