import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sword, Mail, Lock, User, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-[#CBD5E1]"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-20 h-20 bg-[#3CA7E0] rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Sword className="h-10 w-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-[#2E3A59] mb-2" style={{ fontFamily: 'Orbitron, monospace' }}>
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
          <p className="text-[#BFC9D9]">
            {isLogin ? 'Continue your path to mastery' : 'Become a Jedi Master'}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-700">{error}</p>
              {isLogin && error.includes('incorrect') && (
                <p className="text-xs text-red-600 mt-1">
                  Don't have an account?{' '}
                  <button
                    onClick={toggleMode}
                    className="underline hover:no-underline"
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
              <label className="block text-sm font-medium text-[#2E3A59] mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#BFC9D9]" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#3CA7E0] focus:border-transparent outline-none transition-all duration-200"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#2E3A59] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#BFC9D9]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#3CA7E0] focus:border-transparent outline-none transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2E3A59] mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#BFC9D9]" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#3CA7E0] focus:border-transparent outline-none transition-all duration-200"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>
            {!isLogin && (
              <p className="text-xs text-[#BFC9D9] mt-1">
                Password must be at least 6 characters long
              </p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
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
              <div className="w-full border-t border-[#CBD5E1]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-[#BFC9D9]">or</span>
            </div>
          </div>
          
          <motion.button
            onClick={handleGuestAccess}
            disabled={loading}
            className="w-full mt-4 py-3 bg-[#5ED3F3] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <UserCheck className="h-5 w-5" />
            <span>Continue as Guest</span>
          </motion.button>
          
          <p className="text-xs text-[#BFC9D9] text-center mt-2">
            Explore all features without creating an account
          </p>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#BFC9D9]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={toggleMode}
            className="text-sm text-[#3CA7E0] hover:text-[#5ED3F3] font-medium transition-colors duration-200"
          >
            {isLogin ? 'Create one here' : 'Sign in here'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;