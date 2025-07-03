import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info } from 'lucide-react';
import FileUpload from '../components/Upload/FileUpload';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const Upload: React.FC = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    if (user.isGuest) {
      // Demo upload for guest users
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 20;
        });
      }, 300);

      setTimeout(() => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        toast.success('Demo upload completed! Create an account to save your courses.');
        
        setTimeout(() => {
          navigate('/courses');
        }, 1000);
      }, 2000);
      
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload file to storage');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-files')
        .getPublicUrl(fileName);

      setUploadProgress(95);

      // Create course record
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([
          {
            user_id: user.id,
            title: courseTitle || file.name.split('.')[0],
            description: courseDescription,
            file_url: publicUrl,
            file_type: file.type,
            progress: 0,
          },
        ])
        .select()
        .single();

      if (courseError) {
        console.error('Course creation error:', courseError);
        throw new Error('Failed to create course record');
      }

      setUploadProgress(100);
      clearInterval(progressInterval);

      toast.success('Course uploaded successfully!');
      
      // Wait a moment to show completion, then navigate
      setTimeout(() => {
        navigate('/courses');
      }, 1000);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <motion.button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-[#3CA7E0] hover:text-[#5ED3F3] transition-colors duration-200 mb-6"
            whileHover={{ x: -5 }}
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-[#2E3A59] mb-4 flex items-center space-x-3">
              <Sparkles className="h-8 w-8 text-[#3CA7E0]" />
              <span>Upload Learning Material</span>
              {user?.isGuest && (
                <span className="text-sm bg-[#5ED3F3] text-white px-3 py-1 rounded-full">
                  Demo Mode
                </span>
              )}
            </h1>
            <p className="text-[#BFC9D9] text-lg">
              Transform your documents into interactive learning experiences with AI-powered quizzes.
            </p>
            
            {user?.isGuest && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Demo Upload Mode</p>
                  <p className="text-sm text-blue-600 mt-1">
                    You can try the upload process, but files won't be permanently saved. 
                    Create an account to save your courses and track progress.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]">
              <h2 className="text-xl font-semibold text-[#2E3A59] mb-4">
                Course Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2E3A59] mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#3CA7E0] focus:border-transparent outline-none transition-all duration-200"
                    placeholder="e.g., Introduction to Machine Learning"
                    disabled={isUploading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#2E3A59] mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={courseDescription}
                    onChange={(e) => setCourseDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#3CA7E0] focus:border-transparent outline-none transition-all duration-200 resize-none"
                    placeholder="Brief description of what this course covers..."
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <FileUpload 
              onFileUpload={handleFileUpload} 
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
        >
          <h3 className="text-lg font-semibold text-[#2E3A59] mb-4">
            What happens next?
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#3CA7E0] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">1</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                Your file is processed and analyzed by our AI
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5ED3F3] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">2</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                Interactive quizzes are generated based on the content
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#10B981] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">3</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                Start learning and track your progress
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;