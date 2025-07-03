import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info, Brain, CheckCircle, AlertCircle } from 'lucide-react';
import FileUpload from '../components/Upload/FileUpload';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DocumentParser } from '../lib/documentParser';
import { QuizGenerator } from '../lib/quizGenerator';
import toast from 'react-hot-toast';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
}

const Upload: React.FC = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const initializeProcessingSteps = () => {
    setProcessingSteps([
      { id: 'upload', label: 'Uploading file', status: 'processing' },
      { id: 'parse', label: 'Parsing document content', status: 'pending' },
      { id: 'generate', label: 'Generating quiz questions', status: 'pending' },
      { id: 'save', label: 'Saving course data', status: 'pending' },
    ]);
  };

  const updateStepStatus = (stepId: string, status: ProcessingStep['status']) => {
    setProcessingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleFileUpload = async (file: File) => {
    if (!user) {
      toast.error('Please sign in to upload files');
      return;
    }

    if (user.isGuest) {
      await handleGuestUpload(file);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    initializeProcessingSteps();
    
    try {
      // Step 1: Upload file
      setUploadProgress(20);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error('Failed to upload file to storage');
      }

      updateStepStatus('upload', 'completed');
      setUploadProgress(40);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-files')
        .getPublicUrl(fileName);

      // Step 2: Parse document content
      updateStepStatus('parse', 'processing');
      setUploadProgress(50);
      
      const parsedContent = await DocumentParser.parseDocument(publicUrl, file.type);
      updateStepStatus('parse', 'completed');
      setUploadProgress(70);

      // Step 3: Generate quiz questions
      updateStepStatus('generate', 'processing');
      const quizQuestions = await QuizGenerator.generateQuestions(parsedContent);
      updateStepStatus('generate', 'completed');
      setUploadProgress(85);

      // Step 4: Save course and questions
      updateStepStatus('save', 'processing');
      
      // Create course record
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([
          {
            user_id: user.id,
            title: courseTitle || parsedContent.title || file.name.split('.')[0],
            description: courseDescription || `Auto-generated course from ${file.name}`,
            file_url: publicUrl,
            file_type: file.type,
            progress: 0,
          },
        ])
        .select()
        .single();

      if (courseError) {
        throw new Error('Failed to create course record');
      }

      // Save quiz questions
      if (quizQuestions.length > 0) {
        const questionsToInsert = quizQuestions.map(q => ({
          course_id: courseData.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
        }));

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(questionsToInsert);

        if (questionsError) {
          console.error('Error saving quiz questions:', questionsError);
          // Don't fail the entire upload if questions fail to save
          toast.error('Course uploaded but quiz generation failed');
        }
      }

      updateStepStatus('save', 'completed');
      setUploadProgress(100);

      toast.success(`Course uploaded successfully with ${quizQuestions.length} quiz questions!`);
      
      setTimeout(() => {
        navigate('/courses');
      }, 1500);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Update failed step
      const currentStep = processingSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error');
      }
      
      toast.error(error.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGuestUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    initializeProcessingSteps();
    
    // Simulate the upload process for guest users
    const steps = ['upload', 'parse', 'generate', 'save'];
    
    for (let i = 0; i < steps.length; i++) {
      updateStepStatus(steps[i], 'processing');
      setUploadProgress(25 * (i + 1));
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      updateStepStatus(steps[i], 'completed');
    }
    
    toast.success('Demo upload completed! Create an account to save your courses and generated quizzes.');
    
    setTimeout(() => {
      navigate('/courses');
    }, 1500);
  };

  const getStepIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3CA7E0]" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
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
                    Course Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={courseTitle}
                    onChange={(e) => setCourseTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-[#CBD5E1] rounded-lg focus:ring-2 focus:ring-[#3CA7E0] focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Auto-detected from document if empty"
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
                    placeholder="Auto-generated if empty"
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

        {/* Processing Steps */}
        {processingSteps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
          >
            <h3 className="text-lg font-semibold text-[#2E3A59] mb-4 flex items-center space-x-2">
              <Brain className="h-5 w-5 text-[#3CA7E0]" />
              <span>Processing Status</span>
            </h3>
            
            <div className="space-y-3">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <span className={`text-sm ${
                    step.status === 'completed' ? 'text-green-600' :
                    step.status === 'error' ? 'text-red-600' :
                    step.status === 'processing' ? 'text-[#3CA7E0]' :
                    'text-[#BFC9D9]'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
        >
          <h3 className="text-lg font-semibold text-[#2E3A59] mb-4">
            What happens next?
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#3CA7E0] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">1</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                File is uploaded and stored securely
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5ED3F3] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">2</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                Content is parsed and key concepts extracted
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#10B981] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">3</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                AI generates relevant quiz questions
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">4</span>
              </div>
              <p className="text-sm text-[#2E3A59]">
                Course is ready for interactive learning
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;