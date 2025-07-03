import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sword, Mail, Lock, User } from 'lucide-react';
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
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
      toast.error(error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
              />
            </div>
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

        <div className="mt-6 text-center">
          <p className="text-sm text-[#BFC9D9]">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
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