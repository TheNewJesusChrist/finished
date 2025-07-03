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
  timeout: 30000, // 30 second timeout
});

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const generateQuiz = async (
  courseContent: string, 
  questionCount: number = 5
): Promise<QuizQuestion[]> => {
  try {
    if (!OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not configured, using fallback questions');
      return generateFallbackQuestions(courseContent, questionCount);
    }

    console.log(`Generating ${questionCount} quiz questions with OpenRouter API...`);
    
    const response = await openRouterClient.post('/chat/completions', {
      model: 'openai/gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert educator creating quiz questions. Generate exactly ${questionCount} multiple choice questions based on the provided content. Each question should:

          1. Test understanding of key concepts, facts, or definitions from the material
          2. Have exactly 4 options (A, B, C, D)
          3. Have exactly one correct answer (index 0-3)
          4. Include smart distractors - plausible incorrect answers based on content from the document
          5. Include a clear, educational explanation
          
          CRITICAL: Create distractors that are:
          - Related to the document content but incorrect
          - Plausible enough that someone who skimmed might choose them
          - Based on actual terms, concepts, or facts from the material
          - NOT obviously wrong or unrelated
          
          Return ONLY valid JSON in this exact format:
          [
            {
              "question": "Question text here?",
              "options": ["Correct answer", "Smart distractor 1", "Smart distractor 2", "Smart distractor 3"],
              "correct": 0,
              "explanation": "Explanation of why the correct answer is right and why others are wrong."
            }
          ]
          
          Do not include any other text, markdown formatting, or explanations outside the JSON array.`
        },
        {
          role: 'user',
          content: `Generate ${questionCount} multiple-choice questions with 4 options each and indicate the correct one. Create smart distractors based on content from the document. Base questions on:\n\n${courseContent}`
        }
      ],
      max_tokens: Math.min(3000, questionCount * 400), // Scale tokens with question count
      temperature: 0.7,
    });

    const content = response.data.choices[0].message.content;
    console.log('Raw OpenRouter response:', content);
    
    // Clean up the response to ensure it's valid JSON
    const cleanedContent = cleanJsonResponse(content);
    
    try {
      const questions = JSON.parse(cleanedContent);
      
      // Validate the questions
      const validatedQuestions = validateQuestions(questions, questionCount);
      
      if (validatedQuestions.length === 0) {
        console.warn('No valid questions generated from OpenRouter, using fallback');
        return generateFallbackQuestions(courseContent, questionCount);
      }
      
      console.log(`Successfully generated ${validatedQuestions.length} questions:`, validatedQuestions);
      return validatedQuestions;
      
    } catch (parseError) {
      console.error('Error parsing OpenRouter response:', parseError);
      console.warn('Using fallback questions due to parse error');
      return generateFallbackQuestions(courseContent, questionCount);
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
    } else if (error.code === 'ECONNABORTED') {
      console.warn('Request timeout, using fallback questions');
    }
    
    // Always return fallback questions instead of throwing
    return generateFallbackQuestions(courseContent, questionCount);
  }
};

function generateFallbackQuestions(courseContent: string, questionCount: number): QuizQuestion[] {
  // Generate intelligent questions based on content analysis
  const contentLength = courseContent.length;
  const hasNumbers = /\d+/.test(courseContent);
  const hasDefinitions = /define|definition|means|refers to|is a|are a/i.test(courseContent);
  const hasProcesses = /step|process|method|procedure|approach/i.test(courseContent);
  const hasConcepts = /concept|principle|theory|framework|model/i.test(courseContent);
  
  const fallbackQuestions: QuizQuestion[] = [];
  
  // Question 1: Main topic comprehension
  fallbackQuestions.push({
    question: "Based on the uploaded content, which statement best describes the main focus?",
    options: [
      "The content covers fundamental concepts and their practical applications",
      "The content is primarily about historical events and timelines",
      "The content focuses exclusively on mathematical calculations",
      "The content discusses fictional narratives and stories"
    ],
    correct: 0,
    explanation: "The first option is generally applicable to most educational content, focusing on both theory and practice."
  });

  // Question 2: Learning approach
  if (fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "What is the most effective approach to mastering the material presented?",
      options: [
        "Understanding core concepts and applying them in practice",
        "Memorizing all specific details without context",
        "Focusing only on the numerical data presented",
        "Reading through the material once without review"
      ],
      correct: 0,
      explanation: "Understanding concepts and their practical application leads to better retention and mastery than rote memorization."
    });
  }

  // Question 3: Definition-focused (if definitions are present)
  if (hasDefinitions && fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "When studying definitions and terminology in this material, what approach yields the best results?",
      options: [
        "Understanding the meaning and context of each term",
        "Memorizing definitions word-for-word without context",
        "Skipping definitions and focusing only on examples",
        "Learning definitions only when specifically tested"
      ],
      correct: 0,
      explanation: "Understanding definitions in context helps with better comprehension and long-term retention of the material."
    });
  }

  // Question 4: Numerical data (if numbers are present)
  if (hasNumbers && fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "How should numerical information and data in this content be approached?",
      options: [
        "Understand what the numbers represent and their significance",
        "Ignore all numerical data as unimportant details",
        "Memorize every number without understanding context",
        "Focus only on the largest numbers mentioned"
      ],
      correct: 0,
      explanation: "Understanding the meaning and context of numerical data is crucial for comprehending the material's key points."
    });
  }

  // Question 5: Process understanding (if processes are mentioned)
  if (hasProcesses && fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "When learning about processes or methods described in this material, what is most important?",
      options: [
        "Understanding the sequence and reasoning behind each step",
        "Memorizing the first and last steps only",
        "Focusing on the tools used rather than the process",
        "Learning processes in random order without sequence"
      ],
      correct: 0,
      explanation: "Understanding the logical sequence and reasoning behind processes helps in applying them effectively in different contexts."
    });
  }

  // Question 6: Concept application (if concepts are present)
  if (hasConcepts && fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "How can the concepts presented in this material be best utilized?",
      options: [
        "Apply them to real-world scenarios and practical situations",
        "Keep them as abstract ideas without practical connection",
        "Use them only in academic or theoretical discussions",
        "Avoid applying them until fully memorized"
      ],
      correct: 0,
      explanation: "Applying concepts to real-world scenarios helps solidify understanding and demonstrates practical mastery."
    });
  }

  // Question 7: Review strategy
  if (fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "What is the most effective strategy for reviewing and retaining this material?",
      options: [
        "Regular review sessions connecting new information to prior knowledge",
        "Reading the material once and never reviewing it again",
        "Reviewing only the night before any assessment",
        "Focusing exclusively on memorizing the introduction"
      ],
      correct: 0,
      explanation: "Regular review and connecting new information to existing knowledge significantly improves long-term retention and understanding."
    });
  }

  // Question 8: Critical thinking
  if (fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "When analyzing the information presented in this material, what approach demonstrates critical thinking?",
      options: [
        "Questioning assumptions and evaluating evidence presented",
        "Accepting all information without any analysis",
        "Focusing only on information that confirms existing beliefs",
        "Avoiding any questioning of the material's content"
      ],
      correct: 0,
      explanation: "Critical thinking involves questioning assumptions, evaluating evidence, and analyzing information objectively."
    });
  }

  // Question 9: Knowledge integration
  if (fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "How should the knowledge from this material be integrated with other learning?",
      options: [
        "Connect it with related concepts from other sources and experiences",
        "Keep it completely separate from all other knowledge",
        "Only use it in the exact context where it was learned",
        "Avoid making any connections to prevent confusion"
      ],
      correct: 0,
      explanation: "Integrating knowledge with related concepts and experiences creates a more comprehensive understanding and better retention."
    });
  }

  // Question 10: Practical application
  if (fallbackQuestions.length < questionCount) {
    fallbackQuestions.push({
      question: "What demonstrates true mastery of the material presented?",
      options: [
        "Ability to explain concepts clearly and apply them in new situations",
        "Memorizing exact quotes from the material",
        "Completing assessments without understanding underlying principles",
        "Avoiding any practical application of the concepts"
      ],
      correct: 0,
      explanation: "True mastery is demonstrated by the ability to explain concepts clearly and apply them effectively in new and varied situations."
    });
  }

  return fallbackQuestions.slice(0, questionCount);
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

function validateQuestions(questions: any[], expectedCount: number): QuizQuestion[] {
  const validatedQuestions: QuizQuestion[] = [];
  
  if (!Array.isArray(questions)) {
    return validatedQuestions;
  }
  
  for (const q of questions) {
    if (
      q.question &&
      typeof q.question === 'string' &&
      q.question.trim().length > 10 &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      q.options.every((opt: any) => typeof opt === 'string' && opt.trim().length > 0) &&
      typeof q.correct === 'number' &&
      q.correct >= 0 &&
      q.correct < 4 &&
      q.explanation &&
      typeof q.explanation === 'string' &&
      q.explanation.trim().length > 10
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
    const validatedQuestions = validateQuestions(questions, 5);
    
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