import { openRouterClient } from './openrouter';
import { ParsedContent } from './documentParser';

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export class QuizGenerator {
  static async generateQuestions(content: ParsedContent): Promise<GeneratedQuizQuestion[]> {
    try {
      console.log('Generating quiz questions from content...');
      
      const prompt = this.createPrompt(content);
      
      const response = await openRouterClient.post('/chat/completions', {
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert educator creating quiz questions. Generate exactly 5 multiple choice questions based on the provided content. Each question should:
            1. Test understanding of key concepts from the material
            2. Have 4 options (A, B, C, D)
            3. Have exactly one correct answer
            4. Include a clear explanation
            
            Return ONLY valid JSON in this exact format:
            [
              {
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 0,
                "explanation": "Explanation of why this answer is correct."
              }
            ]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const content_text = response.data.choices[0].message.content;
      console.log('Raw AI response:', content_text);
      
      // Clean up the response to ensure it's valid JSON
      const cleanedContent = this.cleanJsonResponse(content_text);
      
      const questions = JSON.parse(cleanedContent);
      
      // Validate the questions
      const validatedQuestions = this.validateQuestions(questions);
      
      console.log('Generated questions:', validatedQuestions);
      return validatedQuestions;
      
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      
      // Fallback to template-based questions if AI generation fails
      return this.generateFallbackQuestions(content);
    }
  }

  private static createPrompt(content: ParsedContent): string {
    return `
Create quiz questions based on this content:

Title: ${content.title || 'Course Content'}

Main Content:
${content.text}

Key Topics:
${content.keyPoints.join('\n')}

Headings:
${content.headings.join('\n')}

Focus on testing understanding of the main concepts, key terms, and practical applications mentioned in the content.
    `.trim();
  }

  private static cleanJsonResponse(response: string): string {
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

  private static validateQuestions(questions: any[]): GeneratedQuizQuestion[] {
    const validatedQuestions: GeneratedQuizQuestion[] = [];
    
    for (const q of questions) {
      if (
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correct_answer === 'number' &&
        q.correct_answer >= 0 &&
        q.correct_answer < 4 &&
        q.explanation
      ) {
        validatedQuestions.push({
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation
        });
      }
    }
    
    // If we don't have enough valid questions, pad with fallback
    while (validatedQuestions.length < 3) {
      validatedQuestions.push(this.createFallbackQuestion(validatedQuestions.length + 1));
    }
    
    return validatedQuestions.slice(0, 5); // Limit to 5 questions
  }

  private static generateFallbackQuestions(content: ParsedContent): GeneratedQuizQuestion[] {
    const questions: GeneratedQuizQuestion[] = [];
    
    // Generate questions based on content structure
    if (content.title) {
      questions.push({
        question: `What is the main topic of "${content.title}"?`,
        options: [
          content.title,
          'General overview',
          'Basic introduction',
          'Advanced concepts'
        ],
        correct_answer: 0,
        explanation: `The main topic is "${content.title}" as indicated by the document title.`
      });
    }
    
    // Add questions based on key points
    content.keyPoints.slice(0, 3).forEach((point, index) => {
      questions.push({
        question: `Which of the following is a key concept covered in this material?`,
        options: [
          point,
          'Unrelated concept A',
          'Unrelated concept B',
          'Unrelated concept C'
        ],
        correct_answer: 0,
        explanation: `"${point}" is explicitly mentioned as a key point in the course material.`
      });
    });
    
    // Add a general comprehension question
    questions.push({
      question: 'What is the primary purpose of this course material?',
      options: [
        'To provide comprehensive understanding of the subject',
        'To give a brief overview only',
        'To test existing knowledge',
        'To provide entertainment'
      ],
      correct_answer: 0,
      explanation: 'The material is designed to provide comprehensive understanding and practical knowledge of the subject matter.'
    });
    
    return questions.slice(0, 5);
  }

  private static createFallbackQuestion(index: number): GeneratedQuizQuestion {
    return {
      question: `Based on the course content, which approach is most effective for learning?`,
      options: [
        'Active engagement with the material and practical application',
        'Passive reading without interaction',
        'Memorizing facts without understanding',
        'Skipping difficult sections'
      ],
      correct_answer: 0,
      explanation: 'Active engagement and practical application are proven to be the most effective learning strategies.'
    };
  }
}