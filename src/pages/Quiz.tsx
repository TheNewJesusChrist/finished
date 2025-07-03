import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Brain, Trophy, RotateCcw, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { QuizQuestion } from '../lib/openrouter';
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
  const [quizError, setQuizError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && user) {
      if (user.isGuest) {
        loadGuestCourse();
      } else {
        fetchCourse();
      }
    }
  }, [courseId, user]);

  const loadGuestCourse = () => {
    // Mock course data for guest users
    const guestCourses = [
      {
        id: 'guest-course-1',
        user_id: 'guest-user',
        title: 'Introduction to the Force',
        description: 'Learn the fundamentals of Force sensitivity and basic Jedi principles.',
        file_url: 'https://example.com/force-intro.pdf',
        file_type: 'application/pdf',
        progress: 75,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'guest-course-2',
        user_id: 'guest-user',
        title: 'Lightsaber Combat Basics',
        description: 'Master the seven forms of lightsaber combat and defensive techniques.',
        file_url: 'https://example.com/lightsaber-combat.pptx',
        file_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        progress: 45,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'guest-course-3',
        user_id: 'guest-user',
        title: 'Meditation and Mindfulness',
        description: 'Develop your connection to the Force through meditation practices.',
        file_url: 'https://example.com/meditation.pdf',
        file_type: 'application/pdf',
        progress: 20,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const foundCourse = guestCourses.find(c => c.id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      generateQuizQuestions(foundCourse);
    } else {
      setQuizError('Course not found');
      setLoading(false);
    }
  };

  const fetchCourse = async () => {
    if (!courseId || !user || user.isGuest) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching course:', error);
        throw error;
      }
      
      if (!data) {
        setQuizError('Course not found');
        setLoading(false);
        return;
      }
      
      setCourse(data);
      await generateQuizQuestions(data);
    } catch (error) {
      console.error('Error fetching course:', error);
      setQuizError('Failed to load course');
      setLoading(false);
    }
  };

  const validateQuizQuestion = (question: any): question is QuizQuestion => {
    return (
      question &&
      typeof question === 'object' &&
      typeof question.question === 'string' &&
      Array.isArray(question.options) &&
      question.options.length >= 2 &&
      question.options.every((option: any) => typeof option === 'string') &&
      typeof question.correct === 'number' &&
      question.correct >= 0 &&
      question.correct < question.options.length &&
      typeof question.explanation === 'string'
    );
  };

  const generateQuizQuestions = async (courseData: Course) => {
    setGeneratingQuiz(true);
    try {
      // Generate questions based on course content
      const courseSpecificQuestions: Record<string, QuizQuestion[]> = {
        'guest-course-1': [
          {
            question: 'What is the Force according to Jedi teachings?',
            options: [
              'An energy field created by all living things',
              'A supernatural power only some possess',
              'A technology developed by ancient civilizations',
              'A form of advanced telepathy'
            ],
            correct: 0,
            explanation: 'The Force is an energy field created by all living things that surrounds us, penetrates us, and binds the galaxy together.'
          },
          {
            question: 'What is the first step in becoming Force-sensitive?',
            options: [
              'Learning lightsaber combat',
              'Meditation and mindfulness practice',
              'Studying ancient Jedi texts',
              'Building a lightsaber'
            ],
            correct: 1,
            explanation: 'Meditation and mindfulness are fundamental to developing Force sensitivity and awareness.'
          },
          {
            question: 'What distinguishes the light side from the dark side of the Force?',
            options: [
              'Power level and strength',
              'Emotional control and selflessness vs. passion and selfishness',
              'Age and experience',
              'Natural talent and ability'
            ],
            correct: 1,
            explanation: 'The light side emphasizes emotional control, selflessness, and peace, while the dark side is driven by passion, anger, and selfishness.'
          },
          {
            question: 'What is the Jedi Code\'s primary teaching?',
            options: [
              'Power through strength',
              'Peace through understanding and balance',
              'Victory at any cost',
              'Knowledge through conquest'
            ],
            correct: 1,
            explanation: 'The Jedi Code emphasizes peace, knowledge, serenity, and harmony through understanding and balance.'
          },
          {
            question: 'How should a Jedi approach conflict?',
            options: [
              'With overwhelming force',
              'By avoiding it completely',
              'As a last resort, seeking peaceful solutions first',
              'By eliminating all opposition'
            ],
            correct: 2,
            explanation: 'Jedi seek peaceful solutions first and use force only as a last resort to protect others and maintain peace.'
          }
        ],
        'guest-course-2': [
          {
            question: 'How many forms of lightsaber combat are there?',
            options: [
              'Five forms',
              'Seven forms',
              'Ten forms',
              'Three forms'
            ],
            correct: 1,
            explanation: 'There are seven traditional forms of lightsaber combat, each with its own philosophy and techniques.'
          },
          {
            question: 'What is Form I (Shii-Cho) known for?',
            options: [
              'Aggressive offense',
              'Basic fundamentals and foundation',
              'Defensive mastery',
              'Dual-blade techniques'
            ],
            correct: 1,
            explanation: 'Form I (Shii-Cho) is the foundation form that teaches basic lightsaber fundamentals and is learned by all Jedi.'
          },
          {
            question: 'Which form is considered the most defensive?',
            options: [
              'Form II (Makashi)',
              'Form III (Soresu)',
              'Form V (Shien/Djem So)',
              'Form VII (Juyo/Vaapad)'
            ],
            correct: 1,
            explanation: 'Form III (Soresu) is the most defensive form, focusing on protection and outlasting opponents.'
          },
          {
            question: 'What is the key principle of lightsaber combat?',
            options: [
              'Speed above all else',
              'Overwhelming your opponent',
              'Balance between offense and defense',
              'Using the Force to predict attacks'
            ],
            correct: 2,
            explanation: 'Lightsaber combat requires balance between offensive and defensive techniques, combined with Force awareness.'
          },
          {
            question: 'When should a Jedi draw their lightsaber?',
            options: [
              'To intimidate opponents',
              'Only when ready to use it in defense',
              'To show their rank and status',
              'Whenever they feel threatened'
            ],
            correct: 1,
            explanation: 'A Jedi should only draw their lightsaber when they are prepared to use it in defense of themselves or others.'
          }
        ],
        'guest-course-3': [
          {
            question: 'What is the primary purpose of Jedi meditation?',
            options: [
              'To increase physical strength',
              'To connect with the Force and find inner peace',
              'To communicate with other Jedi',
              'To predict the future'
            ],
            correct: 1,
            explanation: 'Jedi meditation helps connect with the Force, find inner peace, and maintain emotional balance.'
          },
          {
            question: 'How often should a Jedi practice meditation?',
            options: [
              'Only when facing difficult decisions',
              'Daily, as a regular practice',
              'Once a week',
              'Only during formal training'
            ],
            correct: 1,
            explanation: 'Daily meditation is essential for maintaining Force connection and emotional balance.'
          },
          {
            question: 'What is mindfulness in Jedi practice?',
            options: [
              'Thinking about multiple things at once',
              'Being fully present and aware in the moment',
              'Planning for future events',
              'Remembering past experiences'
            ],
            correct: 1,
            explanation: 'Mindfulness is about being fully present and aware in the current moment, essential for Force sensitivity.'
          },
          {
            question: 'What should a Jedi do when experiencing strong emotions?',
            options: [
              'Suppress them completely',
              'Act on them immediately',
              'Acknowledge them and let them pass through meditation',
              'Share them with everyone'
            ],
            correct: 2,
            explanation: 'Jedi acknowledge their emotions but don\'t let them control their actions, using meditation to process them peacefully.'
          },
          {
            question: 'What is the benefit of regular meditation practice?',
            options: [
              'Increased physical abilities only',
              'Better Force connection and emotional stability',
              'Ability to read minds',
              'Immortality'
            ],
            correct: 1,
            explanation: 'Regular meditation strengthens Force connection, improves emotional stability, and enhances overall Jedi abilities.'
          }
        ]
      };

      const courseQuestions = courseSpecificQuestions[courseData.id] || [
        {
          question: `What is the main focus of "${courseData.title}"?`,
          options: [
            'Advanced concepts and practical applications',
            'Basic introduction and theory only',
            'Historical background information',
            'General overview without specifics'
          ],
          correct: 0,
          explanation: 'This course focuses on advanced concepts and practical applications to help you master the subject matter effectively.'
        },
        {
          question: 'Which learning strategy is most effective for long-term retention?',
          options: [
            'Passive reading and highlighting',
            'Active recall and spaced repetition',
            'Cramming before assessments',
            'Listening to lectures only'
          ],
          correct: 1,
          explanation: 'Active recall combined with spaced repetition has been scientifically proven to be the most effective method for long-term knowledge retention.'
        },
        {
          question: 'How should you approach complex problem-solving in this subject?',
          options: [
            'Skip difficult parts initially',
            'Break problems into smaller components',
            'Memorize solution patterns',
            'Work faster to save time'
          ],
          correct: 1,
          explanation: 'Breaking complex problems into smaller, manageable components allows for systematic analysis and better understanding of the solution process.'
        },
        {
          question: 'What role does practice play in skill mastery?',
          options: [
            'Practice is optional for naturally gifted individuals',
            'Only theoretical knowledge matters',
            'Deliberate practice is essential for expertise',
            'Practice should be avoided to prevent mistakes'
          ],
          correct: 2,
          explanation: 'Deliberate practice, where you focus on improving specific aspects of performance, is crucial for developing true expertise in any field.'
        },
        {
          question: 'How can you best apply the knowledge from this course?',
          options: [
            'Wait until you complete the entire course',
            'Apply concepts immediately in real situations',
            'Only use knowledge in test situations',
            'Avoid practical application until mastery'
          ],
          correct: 1,
          explanation: 'Immediate application of new concepts in real-world situations helps reinforce learning and reveals areas that need further study.'
        }
      ];

      // Validate all questions before setting them
      const validQuestions = courseQuestions.filter(validateQuizQuestion);
      
      if (validQuestions.length === 0) {
        throw new Error('No valid quiz questions generated');
      }

      setQuestions(validQuestions);
    } catch (error) {
      console.error('Error generating quiz:', error);
      setQuizError('Failed to generate quiz questions');
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
    if (!course || !user || questions.length === 0) return;

    // Safely calculate correct answers with validation
    const correctAnswers = answers.filter((answer, index) => {
      const question = questions[index];
      return question && typeof question.correct === 'number' && answer === question.correct;
    }).length;
    
    const progressPercentage = Math.round((correctAnswers / questions.length) * 100);

    if (user.isGuest) {
      // For guest users, just show the completion message
      const pointsEarned = correctAnswers * 10;
      toast.success(`Quiz completed! You would have earned ${pointsEarned} points with an account.`);
      return;
    }

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

  if (quizError || !course || questions.length === 0) {
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
          
          <div className="text-center bg-white rounded-2xl shadow-lg p-8 border border-[#CBD5E1]">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-[#2E3A59] mb-4">
              {quizError || 'Quiz not available'}
            </h1>
            <p className="text-[#BFC9D9] mb-6">
              {quizError === 'Course not found' 
                ? 'The course you\'re looking for could not be found.'
                : 'Unable to load quiz questions at this time. Please try again later.'
              }
            </p>
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

  // Safely calculate correct answers with validation
  const correctAnswers = userAnswers.filter((answer, index) => {
    const question = questions[index];
    return question && typeof question.correct === 'number' && answer === question.correct;
  }).length;
  
  const scorePercentage = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;

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
                  {user?.isGuest && (
                    <span className="text-sm bg-[#5ED3F3] text-white px-3 py-1 rounded-full">
                      Demo
                    </span>
                  )}
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
                  {questions[currentQuestion]?.question || 'Loading question...'}
                </h2>

                <div className="space-y-3 mb-8">
                  {questions[currentQuestion]?.options?.map((option, index) => (
                    <motion.button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                        showResult
                          ? index === questions[currentQuestion]?.correct
                            ? 'border-green-500 bg-green-50 text-green-800'
                            : index === selectedAnswer && index !== questions[currentQuestion]?.correct
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
                          showResult && index === questions[currentQuestion]?.correct
                            ? 'border-green-500 bg-green-500'
                            : showResult && index === selectedAnswer && index !== questions[currentQuestion]?.correct
                            ? 'border-red-500 bg-red-500'
                            : selectedAnswer === index
                            ? 'border-[#3CA7E0] bg-[#3CA7E0]'
                            : 'border-[#CBD5E1]'
                        }`}>
                          {showResult && index === questions[currentQuestion]?.correct && (
                            <CheckCircle className="h-4 w-4 text-white" />
                          )}
                          {showResult && index === selectedAnswer && index !== questions[currentQuestion]?.correct && (
                            <XCircle className="h-4 w-4 text-white" />
                          )}
                          {!showResult && selectedAnswer === index && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-medium">{option}</span>
                      </div>
                    </motion.button>
                  )) || []}
                </div>

                {showResult && questions[currentQuestion]?.explanation && (
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
              {user?.isGuest && (
                <p className="text-sm text-blue-600 mt-2">
                  Create an account to save your progress and earn points!
                </p>
              )}
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