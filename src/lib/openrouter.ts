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
    'HTTP-Referer': window.location.origin,
    'X-Title': 'Force Skill Tracker',
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

    console.log('Generating quiz with OpenRouter API...');
    
    const response = await openRouterClient.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator creating quiz questions. Generate exactly 5 multiple choice questions based on the provided content. Each question should:
          1. Test understanding of key concepts from the material
          2. Have exactly 4 options (A, B, C, D)
          3. Have exactly one correct answer
          4. Include a clear explanation
          
          Return ONLY valid JSON in this exact format:
          [
            {
              "question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct": 0,
              "explanation": "Explanation of why this answer is correct."
            }
          ]
          
          Do not include any other text, markdown formatting, or explanations outside the JSON array.`
        },
        {
          role: 'user',
          content: `Generate 5 multiple-choice questions with 4 options each and indicate the correct one, based only on the following text:\n\n${courseContent}`
        }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });

    const content = response.data.choices[0].message.content;
    console.log('Raw OpenRouter response:', content);
    
    // Clean up the response to ensure it's valid JSON
    const cleanedContent = cleanJsonResponse(content);
    
    try {
      const questions = JSON.parse(cleanedContent);
      
      // Validate the questions
      const validatedQuestions = validateQuestions(questions);
      
      if (validatedQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }
      
      console.log('Successfully generated questions:', validatedQuestions);
      return validatedQuestions;
      
    } catch (parseError) {
      console.error('Error parsing OpenRouter response:', parseError);
      throw new Error('Invalid response format from AI');
    }
    
  } catch (error: any) {
    console.error('Error generating quiz with OpenRouter:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid OpenRouter API key');
    } else if (error.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status >= 500) {
      throw new Error('OpenRouter service temporarily unavailable');
    }
    
    throw new Error(error.message || 'Failed to generate quiz questions');
  }
};

function cleanJsonResponse(response: string): string {
  // Remove any markdown formatting
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Remove any text before the first [ and after the last ]
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  
  if (firstBracket !== -1 && lastBracket !== -1) {
    cleaned = cleaned.substring(firstBracket, lastBracket + 1);
  }
  
  return cleaned;
}

function validateQuestions(questions: any[]): QuizQuestion[] {
  const validatedQuestions: QuizQuestion[] = [];
  
  if (!Array.isArray(questions)) {
    return validatedQuestions;
  }
  
  for (const q of questions) {
    if (
      q.question &&
      typeof q.question === 'string' &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((opt: any) => typeof opt === 'string') &&
      typeof q.correct === 'number' &&
      q.correct >= 0 &&
      q.correct < 4 &&
      q.explanation &&
      typeof q.explanation === 'string'
    ) {
      validatedQuestions.push({
        question: q.question.trim(),
        options: q.options.map((opt: string) => opt.trim()),
        correct: q.correct,
        explanation: q.explanation.trim()
      });
    }
  }
  
  return validatedQuestions;
}

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
          content: `You are a Jedi Master assessing a potential student. Create 5 questions about productivity, mindfulness, and learning habits to determine their Jedi rank. Questions should be philosophical and practical. Return only valid JSON with this structure: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "..."}]`
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
    const cleanedContent = cleanJsonResponse(content);
    const questions = JSON.parse(cleanedContent);
    return validateQuestions(questions);
  } catch (error) {
    console.error('Error generating Jedi rank quiz:', error);
    return [];
  }
};