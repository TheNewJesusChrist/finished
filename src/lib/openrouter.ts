import axios from 'axios';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

if (!OPENROUTER_API_KEY) {
  console.warn('OpenRouter API key not found - quiz generation will use fallback methods');
}

export const openRouterClient = axios.create({
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

export const generateQuiz = async (courseContent: string): Promise<QuizQuestion[]> => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await openRouterClient.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a wise Jedi Master creating educational quizzes. Generate exactly 5 multiple choice questions based on the provided content. Return only valid JSON with this structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]'
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
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating quiz:', error);
    return [];
  }
};

export const generateJediRankQuiz = async (): Promise<QuizQuestion[]> => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await openRouterClient.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a Jedi Master assessing a potential student. Create 5 questions about productivity, mindfulness, and learning habits to determine their Jedi rank. Questions should be philosophical and practical. Return only valid JSON with this structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]'
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
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating Jedi rank quiz:', error);
    return [];
  }
};