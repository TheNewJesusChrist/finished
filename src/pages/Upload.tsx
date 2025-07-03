import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, Info, Brain, CheckCircle, AlertCircle, FileText, Zap, RefreshCw } from 'lucide-react';
import FileUpload from '../components/Upload/FileUpload';
import QuizSettings from '../components/Upload/QuizSettings';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { DocumentParser } from '../lib/documentParser';
import { QuizGenerator } from '../lib/quizGenerator';
import toast from 'react-hot-toast';

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  details?: string;
}

const Upload: React.FC = () => {
  const [courseTitle, setCourseTitle] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [extractedContent, setExtractedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const initializeProcessingSteps = () => {
    setProcessingSteps([
      { id: 'upload', label: 'Uploading file to secure storage', status: 'processing' },
      { id: 'parse', label: 'Analyzing document content with AI', status: 'pending' },
      { id: 'generate', label: `Generating ${questionCount} intelligent quiz questions`, status: 'pending' },
      { id: 'save', label: 'Saving course and quiz data', status: 'pending' },
    ]);
  };

  const updateStepStatus = (stepId: string, status: ProcessingStep['status'], details?: string) => {
    setProcessingSteps(prev => 
      prev.map(step => 
        step.id === stepId ? { ...step, status, details } : step
      )
    );
  };

  const retryUpload = () => {
    setError(null);
    setProcessingSteps([]);
    setExtractedContent('');
    setUploadProgress(0);
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
    setExtractedContent('');
    setError(null);
    initializeProcessingSteps();
    
    try {
      // Step 1: Upload file to Supabase Storage
      setUploadProgress(15);
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-files')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      updateStepStatus('upload', 'completed', 'File uploaded successfully');
      setUploadProgress(25);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-files')
        .getPublicUrl(fileName);

      // Step 2: Parse document content with enhanced analysis
      updateStepStatus('parse', 'processing', 'Extracting and analyzing content...');
      setUploadProgress(35);
      
      const parsedContent = await DocumentParser.parseDocument(publicUrl, file.type);
      
      // Show preview of extracted content
      const preview = parsedContent.text.substring(0, 300) + '...';
      setExtractedContent(preview);
      
      updateStepStatus('parse', 'completed', 
        `Extracted ${parsedContent.text.length} characters, ${parsedContent.concepts.length} concepts, ${parsedContent.definitions.length} definitions`
      );
      setUploadProgress(55);

      // Step 3: Generate intelligent quiz questions
      updateStepStatus('generate', 'processing', `Creating ${questionCount} questions with smart distractors...`);
      setUploadProgress(65);
      
      const quizQuestions = await QuizGenerator.generateQuestions(parsedContent, questionCount);
      
      if (quizQuestions.length === 0) {
        updateStepStatus('generate', 'error', 'Failed to generate quiz questions');
        throw new Error('No quiz questions were generated. Please try a different document or contact support.');
      }
      
      updateStepStatus('generate', 'completed', 
        `Generated ${quizQuestions.length} intelligent questions with content-based distractors`
      );
      setUploadProgress(80);

      // Step 4: Save course and questions to database
      updateStepStatus('save', 'processing', 'Saving to database...');
      
      // Create course record
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .insert([
          {
            user_id: user.id,
            title: courseTitle || parsedContent.title || file.name.split('.')[0],
            description: courseDescription || `AI-generated course from ${file.name} with ${questionCount} quiz questions`,
            file_url: publicUrl,
            file_type: file.type,
            progress: 0,
          },
        ])
        .select()
        .single();

      if (courseError) {
        throw new Error(`Failed to create course: ${courseError.message}`);
      }

      // Save quiz questions
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
        updateStepStatus('save', 'error', 'Failed to save quiz questions');
        throw new Error(`Failed to save quiz questions: ${questionsError.message}`);
      }

      updateStepStatus('save', 'completed', 'Course and quiz saved successfully');
      setUploadProgress(100);

      toast.success(`🎉 Course uploaded successfully with ${quizQuestions.length} AI-generated quiz questions!`);
      
      setTimeout(() => {
        navigate('/courses');
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      
      // Update failed step
      const currentStep = processingSteps.find(step => step.status === 'processing');
      if (currentStep) {
        updateStepStatus(currentStep.id, 'error', error.message);
      }
      
      setError(error.message || 'Upload failed');
      toast.error(error.message || 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGuestUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    initializeProcessingSteps();
    
    // Simulate the upload process for guest users
    const steps = [
      { id: 'upload', delay: 1000, progress: 25 },
      { id: 'parse', delay: 1500, progress: 55 },
      { id: 'generate', delay: 2000, progress: 80 },
      { id: 'save', delay: 1000, progress: 100 }
    ];
    
    for (const step of steps) {
      updateStepStatus(step.id, 'processing');
      setUploadProgress(step.progress);
      
      await new Promise(resolve => setTimeout(resolve, step.delay));
      
      if (step.id === 'parse') {
        setExtractedContent('This is a demo of intelligent content extraction from your uploaded document. The AI would analyze concepts, definitions, facts, and examples to create smart quiz questions...');
        updateStepStatus(step.id, 'completed', 'Demo: Analyzed content structure and key concepts');
      } else if (step.id === 'generate') {
        updateStepStatus(step.id, 'completed', `Demo: Generated ${questionCount} AI questions with smart distractors`);
      } else {
        updateStepStatus(step.id, 'completed');
      }
    }
    
    toast.success('🎯 Demo upload completed! Create an account to save your courses and use real AI quiz generation.');
    
    setTimeout(() => {
      navigate('/courses');
    }, 2000);
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
      <div className="max-w-5xl mx-auto p-8">
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
              Transform your documents into interactive learning experiences with AI-powered quiz generation and smart content analysis.
            </p>
            
            {user?.isGuest && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-700 font-medium">Demo Upload Mode</p>
                  <p className="text-sm text-blue-600 mt-1">
                    You can try the upload process, but files won't be permanently saved. 
                    Create an account to save your courses and use real AI quiz generation.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Details */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
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

            <QuizSettings
              questionCount={questionCount}
              onQuestionCountChange={setQuestionCount}
              disabled={isUploading}
            />
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <FileUpload 
              onFileUpload={handleFileUpload} 
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          </motion.div>
        </div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 bg-red-50 border border-red-200 rounded-xl p-6"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">Upload Failed</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <motion.button
                  onClick={retryUpload}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

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
              <span>AI Processing Status</span>
            </h3>
            
            <div className="space-y-4">
              {processingSteps.map((step, index) => (
                <div key={step.id} className="flex items-start space-x-3">
                  {getStepIcon(step.status)}
                  <div className="flex-1">
                    <span className={`text-sm font-medium ${
                      step.status === 'completed' ? 'text-green-600' :
                      step.status === 'error' ? 'text-red-600' :
                      step.status === 'processing' ? 'text-[#3CA7E0]' :
                      'text-[#BFC9D9]'
                    }`}>
                      {step.label}
                    </span>
                    {step.details && (
                      <p className="text-xs text-[#BFC9D9] mt-1">{step.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Extracted Content Preview */}
        {extractedContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
          >
            <h3 className="text-lg font-semibold text-[#2E3A59] mb-4 flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#10B981]" />
              <span>Content Analysis Preview</span>
            </h3>
            <div className="bg-[#F5F7FA] rounded-lg p-4 text-sm text-[#2E3A59] max-h-32 overflow-y-auto">
              {extractedContent}
            </div>
          </motion.div>
        )}

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-[#CBD5E1]"
        >
          <h3 className="text-lg font-semibold text-[#2E3A59] mb-4 flex items-center space-x-2">
            <Zap className="h-5 w-5 text-[#F59E0B]" />
            <span>Intelligent Quiz Generation</span>
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#3CA7E0] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">1</span>
              </div>
              <p className="text-sm text-[#2E3A59] font-medium mb-1">Smart Upload</p>
              <p className="text-xs text-[#BFC9D9]">
                Upload PDF, PowerPoint, or Word documents
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#5ED3F3] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">2</span>
              </div>
              <p className="text-sm text-[#2E3A59] font-medium mb-1">Deep Analysis</p>
              <p className="text-xs text-[#BFC9D9]">
                AI extracts concepts, definitions, and key facts
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#10B981] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">3</span>
              </div>
              <p className="text-sm text-[#2E3A59] font-medium mb-1">Smart Questions</p>
              <p className="text-xs text-[#BFC9D9]">
                Generate questions with intelligent distractors
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-[#8B5CF6] text-white rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="font-bold">4</span>
              </div>
              <p className="text-sm text-[#2E3A59] font-medium mb-1">Interactive Learning</p>
              <p className="text-xs text-[#BFC9D9]">
                Take quizzes with detailed explanations
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Upload;