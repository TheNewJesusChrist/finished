import { openRouterClient, generateQuiz } from './openrouter';
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
      
      // Prepare the content for the AI
      const contentText = this.prepareContentForAI(content);
      
      // Use OpenRouter API to generate questions
      const questions = await generateQuiz(contentText);
      
      // Convert to the expected format
      const formattedQuestions = questions.map(q => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct,
        explanation: q.explanation
      }));
      
      console.log('Successfully generated questions:', formattedQuestions);
      return formattedQuestions;
      
    } catch (error) {
      console.error('Error generating quiz questions:', error);
      
      // Fallback to template-based questions if AI generation fails
      console.log('Falling back to template-based questions...');
      return this.generateFallbackQuestions(content);
    }
  }

  private static prepareContentForAI(content: ParsedContent): string {
    // Limit content length to avoid token limits
    const maxLength = 8000; // Conservative limit for GPT-3.5-turbo
    
    let preparedContent = '';
    
    if (content.title) {
      preparedContent += `Title: ${content.title}\n\n`;
    }
    
    if (content.headings.length > 0) {
      preparedContent += `Main Topics:\n${content.headings.join('\n')}\n\n`;
    }
    
    if (content.keyPoints.length > 0) {
      preparedContent += `Key Points:\n${content.keyPoints.join('\n')}\n\n`;
    }
    
    preparedContent += `Content:\n${content.text}`;
    
    // Truncate if too long
    if (preparedContent.length > maxLength) {
      preparedContent = preparedContent.substring(0, maxLength) + '...';
    }
    
    return preparedContent;
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
          point.substring(0, 80) + (point.length > 80 ? '...' : ''),
          'Unrelated concept A',
          'Unrelated concept B',
          'Unrelated concept C'
        ],
        correct_answer: 0,
        explanation: `This concept is explicitly mentioned as a key point in the course material.`
      });
    });
    
    // Add questions based on headings
    if (content.headings.length > 0) {
      const heading = content.headings[0];
      questions.push({
        question: `Which section is covered in this course?`,
        options: [
          heading,
          'Introduction to basics',
          'Advanced techniques',
          'Summary and conclusion'
        ],
        correct_answer: 0,
        explanation: `"${heading}" is one of the main sections covered in the course material.`
      });
    }
    
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

  static async checkIfQuizExists(courseId: string): Promise<boolean> {
    try {
      const { supabase } = await import('../lib/supabase');
      
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('id')
        .eq('course_id', courseId)
        .limit(1);
      
      if (error) {
        console.error('Error checking quiz existence:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking quiz existence:', error);
      return false;
    }
  }
}