import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  throw new Error('Missing OpenRouter API key');
}

const openRouterClient = axios.create({
  baseURL: OPENROUTER_BASE_URL,
  headers: {
    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const validateQuizQuestion = (question: any): question is QuizQuestion => {
  return (
    question &&
    typeof question === 'object' &&
    typeof question.question === 'string' &&
    question.question.trim().length > 0 &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.options.every((option: any) => typeof option === 'string' && option.trim().length > 0) &&
    typeof question.correct === 'number' &&
    question.correct >= 0 &&
    question.correct < question.options.length &&
    typeof question.explanation === 'string' &&
    question.explanation.trim().length > 0
  );
};

const parseAndValidateQuizResponse = (content: string): QuizQuestion[] => {
  try {
    // Try to parse the JSON response
    const parsed = JSON.parse(content);
    
    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      console.error('Quiz response is not an array:', parsed);
      return [];
    }
    
    // Filter out invalid questions and validate each one
    const validQuestions = parsed
      .filter((question: any) => question !== null && question !== undefined)
      .filter(validateQuizQuestion);
    
    console.log(`Parsed ${parsed.length} questions, ${validQuestions.length} are valid`);
    
    return validQuestions;
  } catch (error) {
    console.error('Error parsing quiz JSON:', error);
    console.error('Raw content:', content);
    return [];
  }
};

export const generateQuiz = async (courseContent: string): Promise<QuizQuestion[]> => {
  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a wise Jedi Master creating educational quizzes. Generate exactly 5 multiple choice questions based on the provided content. Each question must have exactly 4 options (A, B, C, D). Return only valid JSON with this exact structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]. The "correct" field must be a number (0-3) indicating the index of the correct answer.'
        },
        {
          role: 'user',
          content: `Create a quiz from this content:\n\n${courseContent}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.data.choices[0].message.content;
    const questions = parseAndValidateQuizResponse(content);
    
    if (questions.length === 0) {
      console.warn('No valid questions generated, returning fallback questions');
      return getFallbackQuestions();
    }
    
    return questions;
  } catch (error) {
    console.error('Error generating quiz:', error);
    return getFallbackQuestions();
  }
};

export const generateJediRankQuiz = async (): Promise<QuizQuestion[]> => {
  try {
    const response = await openRouterClient.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Jedi Master assessing a potential student. Create exactly 5 questions about productivity, mindfulness, and learning habits to determine their Jedi rank. Questions should be philosophical and practical. Each question must have exactly 4 options. Return only valid JSON with this exact structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]. The "correct" field must be a number (0-3) indicating the index of the correct answer.'
        },
        {
          role: 'user',
          content: 'Create a Jedi assessment quiz to determine starting rank based on their current habits and mindset.'
        }
      ],
      max_tokens: 1500,
      temperature: 0.7,
    });

    const content = response.data.choices[0].message.content;
    const questions = parseAndValidateQuizResponse(content);
    
    if (questions.length === 0) {
      console.warn('No valid Jedi rank questions generated, returning fallback questions');
      return getJediRankFallbackQuestions();
    }
    
    return questions;
  } catch (error) {
    console.error('Error generating Jedi rank quiz:', error);
    return getJediRankFallbackQuestions();
  }
};

const getFallbackQuestions = (): QuizQuestion[] => {
  return [
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
      question: 'How should you approach complex problem-solving?',
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
      question: 'How can you best apply new knowledge?',
      options: [
        'Wait until you complete the entire course',
        'Apply concepts immediately in real situations',
        'Only use knowledge in test situations',
        'Avoid practical application until mastery'
      ],
      correct: 1,
      explanation: 'Immediate application of new concepts in real-world situations helps reinforce learning and reveals areas that need further study.'
    },
    {
      question: 'What is the most important factor in successful learning?',
      options: [
        'Natural intelligence',
        'Expensive resources and tools',
        'Consistent effort and reflection',
        'Competitive environment'
      ],
      correct: 2,
      explanation: 'Consistent effort combined with regular reflection on your learning process is the most important factor in achieving successful learning outcomes.'
    }
  ];
};

const getJediRankFallbackQuestions = (): QuizQuestion[] => {
  return [
    {
      question: 'How do you typically handle stressful situations?',
      options: [
        'React immediately with strong emotions',
        'Take time to breathe and assess calmly',
        'Avoid the situation entirely',
        'Seek others to handle it for you'
      ],
      correct: 1,
      explanation: 'Taking time to breathe and assess situations calmly demonstrates emotional control and mindfulness, key Jedi traits.'
    },
    {
      question: 'What motivates you to learn new skills?',
      options: [
        'Personal growth and helping others',
        'Competition and defeating others',
        'Material rewards and recognition',
        'Avoiding failure and criticism'
      ],
      correct: 0,
      explanation: 'Being motivated by personal growth and helping others shows the selfless nature that defines a true Jedi.'
    },
    {
      question: 'How do you approach conflicts with others?',
      options: [
        'Assert dominance to win',
        'Seek understanding and peaceful resolution',
        'Avoid confrontation completely',
        'Manipulate the situation to your advantage'
      ],
      correct: 1,
      explanation: 'Seeking understanding and peaceful resolution demonstrates wisdom and the Jedi way of handling conflicts.'
    },
    {
      question: 'What is your relationship with failure?',
      options: [
        'Failure is unacceptable and must be avoided',
        'Failure is a teacher and opportunity to grow',
        'Failure means you should give up',
        'Failure is someone else\'s fault'
      ],
      correct: 1,
      explanation: 'Viewing failure as a teacher and opportunity for growth shows the wisdom and resilience of a developing Jedi.'
    },
    {
      question: 'How do you prefer to spend your free time?',
      options: [
        'Seeking entertainment and distractions',
        'Reflecting, learning, and practicing mindfulness',
        'Competing and proving superiority',
        'Accumulating possessions and status'
      ],
      correct: 1,
      explanation: 'Choosing reflection, learning, and mindfulness in free time demonstrates the disciplined and growth-oriented mindset of a Jedi.'
    }
  ];
};