import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Play, Trash2, Upload, FileText, Presentation, Calendar, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Course } from '../types';
import toast from 'react-hot-toast';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const deleteCourse = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      
      setCourses(courses.filter(course => course.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const startQuiz = (courseId: string) => {
    navigate(`/quiz/${courseId}`);
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('presentation')) {
      return <Presentation className="h-6 w-6 text-orange-500" />;
    }
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CA7E0]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-7xl mx-auto p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2E3A59] mb-4 flex items-center space-x-3">
                <BookOpen className="h-8 w-8 text-[#3CA7E0]" />
                <span>My Courses</span>
              </h1>
              <p className="text-[#BFC9D9] text-lg">
                Your journey to mastery through AI-powered learning
              </p>
            </div>
            <Link to="/upload">
              <motion.button
                className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(60, 167, 224, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-5 w-5" />
                <span>Upload New Course</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {courses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16"
          >
            <div className="bg-white rounded-2xl shadow-lg p-12 border border-[#CBD5E1] max-w-md mx-auto">
              <BookOpen className="h-16 w-16 text-[#BFC9D9] mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-[#2E3A59] mb-4">
                No courses yet
              </h3>
              <p className="text-[#BFC9D9] mb-6">
                Upload your first PDF or PowerPoint to begin your Jedi training
              </p>
              <Link to="/upload">
                <motion.button
                  className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Upload Course
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg border border-[#CBD5E1] overflow-hidden hover:shadow-xl transition-all duration-300"
                whileHover={{ scale: 1.02 }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(course.file_type)}
                      <div>
                        <h3 className="text-lg font-semibold text-[#2E3A59] line-clamp-2">
                          {course.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-[#BFC9D9] mt-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(course.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => deleteCourse(course.id)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {course.description && (
                    <p className="text-[#BFC9D9] text-sm mb-4 line-clamp-3">
                      {course.description}
                    </p>
                  )}

                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-[#2E3A59] mb-2">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-[#F3F4F6] rounded-full h-2">
                      <motion.div
                        className="bg-[#3CA7E0] h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${course.progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => startQuiz(course.id)}
                      className="flex-1 py-2 px-4 bg-[#3CA7E0] text-white rounded-lg font-medium hover:bg-[#5ED3F3] transition-all duration-200 flex items-center justify-center space-x-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Quiz</span>
                    </motion.button>
                    <motion.button
                      className="py-2 px-4 bg-[#F5F7FA] text-[#2E3A59] rounded-lg font-medium border border-[#CBD5E1] hover:bg-[#5ED3F3]/10 transition-all duration-200"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <BarChart3 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;