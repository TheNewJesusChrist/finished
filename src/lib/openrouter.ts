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
      console.warn('OpenRouter API key not configured, using fallback questions');
      return generateFallbackQuestions(courseContent);
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
          3. Have exactly one correct answer (index 0-3)
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
        console.warn('No valid questions generated from OpenRouter, using fallback');
        return generateFallbackQuestions(courseContent);
      }
      
      console.log('Successfully generated questions:', validatedQuestions);
      return validatedQuestions;
      
    } catch (parseError) {
      console.error('Error parsing OpenRouter response:', parseError);
      console.warn('Using fallback questions due to parse error');
      return generateFallbackQuestions(courseContent);
    }
    
  } catch (error: any) {
    console.error('Error generating quiz with OpenRouter:', error);
    
    if (error.response?.status === 401) {
      console.warn('Invalid OpenRouter API key, using fallback questions');
    } else if (error.response?.status === 429) {
      console.warn('Rate limit exceeded, using fallback questions');
    } else if (error.response?.status === 404) {
      console.warn('OpenRouter endpoint not found, using fallback questions');
    } else if (error.response?.status >= 500) {
      console.warn('OpenRouter service unavailable, using fallback questions');
    }
    
    // Always return fallback questions instead of throwing
    return generateFallbackQuestions(courseContent);
  }
};

function generateFallbackQuestions(courseContent: string): QuizQuestion[] {
  // Generate basic questions based on content length and type
  const contentLength = courseContent.length;
  const hasNumbers = /\d+/.test(courseContent);
  const hasDefinitions = /define|definition|means|refers to/i.test(courseContent);
  
  const fallbackQuestions: QuizQuestion[] = [
    {
      question: "Based on the uploaded content, which statement best describes the main topic?",
      options: [
        "The content covers fundamental concepts and principles",
        "The content is primarily about historical events",
        "The content focuses on mathematical calculations",
        "The content discusses fictional narratives"
      ],
      correct: 0,
      explanation: "The first option is generally applicable to most educational content."
    },
    {
      question: "What is the most important aspect to remember from this material?",
      options: [
        "Memorizing all specific details",
        "Understanding the core concepts and their applications",
        "Learning the exact dates and numbers",
        "Focusing only on the conclusion"
      ],
      correct: 1,
      explanation: "Understanding core concepts is more valuable than memorization for long-term learning."
    }
  ];

  if (hasDefinitions) {
    fallbackQuestions.push({
      question: "When studying definitions in this material, what approach is most effective?",
      options: [
        "Memorize word-for-word without understanding",
        "Understand the meaning and context of each definition",
        "Skip definitions and focus on examples only",
        "Only read definitions once"
      ],
      correct: 1,
      explanation: "Understanding definitions in context helps with better comprehension and retention."
    });
  }

  if (hasNumbers) {
    fallbackQuestions.push({
      question: "How should numerical information in this content be approached?",
      options: [
        "Ignore all numbers as they're not important",
        "Memorize every number without context",
        "Understand what the numbers represent and their significance",
        "Only focus on the largest numbers"
      ],
      correct: 2,
      explanation: "Understanding the meaning and context of numerical data is crucial for comprehension."
    });
  }

  fallbackQuestions.push({
    question: "What is the best way to review this material for long-term retention?",
    options: [
      "Read it once and never look at it again",
      "Review regularly and connect concepts to prior knowledge",
      "Only review the night before a test",
      "Focus on memorizing the first paragraph only"
    ],
    correct: 1,
    explanation: "Regular review and connecting new information to existing knowledge improves retention."
  });

  return fallbackQuestions.slice(0, 5); // Return up to 5 questions
}

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
      return generateFallbackJediQuestions();
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
    const validatedQuestions = validateQuestions(questions);
    
    return validatedQuestions.length > 0 ? validatedQuestions : generateFallbackJediQuestions();
  } catch (error) {
    console.error('Error generating Jedi rank quiz:', error);
    return generateFallbackJediQuestions();
  }
};

function generateFallbackJediQuestions(): QuizQuestion[] {
  return [
    {
      question: "How do you approach learning new skills?",
      options: [
        "I prefer to master one skill completely before starting another",
        "I like to explore multiple skills simultaneously",
        "I only learn skills that are immediately useful",
        "I avoid learning new skills unless required"
      ],
      correct: 0,
      explanation: "Focused mastery demonstrates discipline and patience, key Jedi traits."
    },
    {
      question: "When faced with a difficult challenge, what is your first response?",
      options: [
        "Take time to meditate and consider all options",
        "Act immediately based on instinct",
        "Seek advice from others before proceeding",
        "Avoid the challenge if possible"
      ],
      correct: 0,
      explanation: "Mindful consideration before action shows wisdom and emotional control."
    },
    {
      question: "How do you handle failure or setbacks?",
      options: [
        "View them as learning opportunities for growth",
        "Get frustrated and need time to recover",
        "Blame external circumstances",
        "Give up and try something else"
      ],
      correct: 0,
      explanation: "Seeing failure as a teacher demonstrates resilience and wisdom."
    },
    {
      question: "What motivates you most in your daily activities?",
      options: [
        "Helping others and contributing to something greater",
        "Personal achievement and recognition",
        "Financial rewards and security",
        "Avoiding conflict and maintaining comfort"
      ],
      correct: 0,
      explanation: "Service to others reflects the selfless nature of the Jedi path."
    },
    {
      question: "How do you maintain focus during long or tedious tasks?",
      options: [
        "Practice mindfulness and stay present in the moment",
        "Set frequent breaks and rewards for myself",
        "Listen to music or find other distractions",
        "Rush through to finish as quickly as possible"
      ],
      correct: 0,
      explanation: "Mindful presence demonstrates the mental discipline essential to Jedi training."
    }
  ];
}