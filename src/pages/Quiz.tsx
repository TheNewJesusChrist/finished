import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Brain, Trophy, RotateCcw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { generateQuiz, QuizQuestion } from '../lib/openrouter';
import { Course } from '../types';
import toast from 'react-hot-toast';

const Quiz: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    if (courseId && user) {
      fetchCourse();
    }
  }, [courseId, user]);

  const fetchCourse = async () => {
    if (!courseId || !user) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setCourse(data);
      await generateQuizQuestions(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/courses');
    }
  };

  const generateQuizQuestions = async (courseData: Course) => {
    setGeneratingQuiz(true);
    try {
      // For demo purposes, we'll create sample questions
      // In a real app, you'd extract text from the PDF/PPT and use AI
      const sampleQuestions: QuizQuestion[] = [
        {
          question: `What is the main topic of "${courseData.title}"?`,
          options: [
            'Advanced concepts and methodologies',
            'Basic introduction and overview',
            'Practical applications only',
            'Historical background'
          ],
          correct: 0,
          explanation: 'This course covers advanced concepts and methodologies in the subject area.'
        },
        {
          question: 'Which learning approach is most effective for mastering new skills?',
          options: [
            'Passive reading only',
            'Active practice with feedback',
            'Memorization techniques',
            'Group discussions only'
          ],
          correct: 1,
          explanation: 'Active practice with feedback is proven to be the most effective learning approach.'
        },
        {
          question: 'What is the key to maintaining long-term retention of knowledge?',
          options: [
            'Cramming before tests',
            'Single intensive study session',
            'Spaced repetition over time',
            'Reading material once'
          ],
          correct: 2,
          explanation: 'Spaced repetition over time helps move information from short-term to long-term memory.'
        },
        {
          question: 'How should you approach complex problems in this subject?',
          options: [
            'Avoid them until later',
            'Break them into smaller parts',
            'Guess the solution',
            'Skip to easier topics'
          ],
          correct: 1,
          explanation: 'Breaking complex problems into smaller, manageable parts is a fundamental problem-solving strategy.'
        },
        {
          question: 'What role does practice play in skill development?',
          options: [
            'It is optional for talented individuals',
            'Only needed for difficult concepts',
            'Essential for building expertise',
            'Can be replaced by theory study'
          ],
          correct: 2,
          explanation: 'Practice is essential for building expertise and developing muscle memory for skills.'
        }
      ];

      setQuestions(sampleQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      toast.error('Failed to generate quiz questions');
      navigate('/courses');
    } finally {
      setGeneratingQuiz(false);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...userAnswers, selectedAnswer];
    setUserAnswers(newAnswers);
    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setQuizCompleted(true);
        updateCourseProgress(newAnswers);
      }
    }, 2000);
  };

  const updateCourseProgress = async (answers: number[]) => {
    if (!course || !user) return;

    const correctAnswers = answers.filter((answer, index) => answer === questions[index].correct).length;
    const progressPercentage = Math.round((correctAnswers / questions.length) * 100);

    try {
      const { error } = await supabase
        .from('courses')
        .update({ progress: Math.max(course.progress, progressPercentage) })
        .eq('id', course.id);

      if (error) throw error;

      // Update user points
      const pointsEarned = correctAnswers * 10;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          total_points: user.total_points + pointsEarned,
          last_activity: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      toast.success(`Quiz completed! You earned ${pointsEarned} points.`);
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to save progress');
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setUserAnswers([]);
    setShowResult(false);
    setQuizCompleted(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading || generatingQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3CA7E0] mx-auto mb-4"></div>
            <p className="text-[#BFC9D9]">
              {generatingQuiz ? 'Generating quiz questions...' : 'Loading course...'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!course || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#2E3A59] mb-4">Course not found</h1>
            <button
              onClick={() => navigate('/courses')}
              className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correct).length;
  const scorePercentage = Math.round((correctAnswers / questions.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] to-[#E1E8F0] pl-64 pt-16">
      <div className="max-w-4xl mx-auto p-8">
        <motion.button
          onClick={() => navigate('/courses')}
          className="flex items-center space-x-2 text-[#3CA7E0] hover:text-[#5ED3F3] transition-colors duration-200 mb-6"
          whileHover={{ x: -5 }}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Courses</span>
        </motion.button>

        {!quizCompleted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1]"
          >
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-[#2E3A59] flex items-center space-x-3">
                  <Brain className="h-7 w-7 text-[#3CA7E0]" />
                  <span>{course.title} - Quiz</span>
                </h1>
                <div className="text-sm text-[#BFC9D9]">
                  Question {currentQuestion + 1} of {questions.length}
                </div>
              </div>
              
              <div className="w-full bg-[#F3F4F6] rounded-full h-2 mb-6">
                <motion.div
                  className="bg-[#3CA7E0] h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-xl font-semibold text-[#2E3A59] mb-6">
                  {questions[currentQuestion].question}
                </h2>

                <div className="space-y-3 mb-8">
                  {questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        showResult
                          ? index === questions[currentQuestion].correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : index === selectedAnswer && index !== questions[currentQuestion].correct
                            ? 'border-red-500 bg-red-50 text-red-800'
                            : 'border-[#CBD5E1] bg-gray-50 text-[#BFC9D9]'
                          : selectedAnswer === index
                          ? 'border-[#3CA7E0] bg-[#5ED3F3]/10 text-[#2E3A59]'
                          : 'border-[#CBD5E1] hover:border-[#3CA7E0] hover:bg-[#5ED3F3]/5 text-[#2E3A59]'
                      }`}
                      whileHover={!showResult ? { scale: 1.02 } : {}}
                      whileTap={!showResult ? { scale: 0.98 } : {}}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          showResult && index === questions[currentQuestion].correct
                            ? 'border-green-500 bg-green-500'
                            : showResult && index === selectedAnswer && index !== questions[currentQuestion].correct
                            ? 'border-red-500 bg-red-500'
                            : selectedAnswer === index
                            ? 'border-[#3CA7E0] bg-[#3CA7E0]'
                            : 'border-[#CBD5E1]'
                        }`}>
                          {showResult && index === questions[currentQuestion].correct && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                          {showResult && index === selectedAnswer && index !== questions[currentQuestion].correct && (
                            <XCircle className="h-4 w-4 text-white" />
                          )}
                          {!showResult && selectedAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#F5F7FA] rounded-lg p-4 mb-6"
                  >
                    <h3 className="font-semibold text-[#2E3A59] mb-2">Explanation:</h3>
                    <p className="text-[#BFC9D9]">{questions[currentQuestion].explanation}</p>
                  </motion.div>
                )}

                <div className="flex justify-end">
                  <motion.button
                    onClick={handleNextQuestion}
                    disabled={selectedAnswer === null}
                    className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={selectedAnswer !== null ? { scale: 1.05 } : {}}
                    whileTap={selectedAnswer !== null ? { scale: 0.95 } : {}}
                  >
                    {currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                  </motion.button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1] text-center"
          >
            <Trophy className="h-16 w-16 text-[#3CA7E0] mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[#2E3A59] mb-4">Quiz Completed!</h1>
            
            <div className="mb-6">
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(scorePercentage)}`}>
                {scorePercentage}%
              </div>
              <p className="text-[#BFC9D9]">
                You got {correctAnswers} out of {questions.length} questions correct
              </p>
            </div>

            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={restartQuiz}
                className="px-6 py-3 bg-[#5ED3F3] text-white rounded-lg font-semibold flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="h-5 w-5" />
                <span>Retake Quiz</span>
              </motion.button>
              <motion.button
                onClick={() => navigate('/courses')}
                className="px-6 py-3 bg-[#3CA7E0] text-white rounded-lg font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Courses
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Quiz;