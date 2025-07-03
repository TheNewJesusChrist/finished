import { openRouterClient, generateQuiz } from './openrouter';
import { ParsedContent } from './documentParser';

export interface GeneratedQuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export class QuizGenerator {
  static async generateQuestions(
    content: ParsedContent, 
    questionCount: number = 5
  ): Promise<GeneratedQuizQuestion[]> {
    try {
      console.log(`Generating ${questionCount} quiz questions from content...`);
      
      // Prepare the content for the AI with enhanced context
      const contentText = this.prepareEnhancedContentForAI(content, questionCount);
      
      // Use OpenRouter API to generate questions
      const questions = await generateQuiz(contentText, questionCount);
      
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
      
      // Fallback to intelligent template-based questions
      console.log('Falling back to intelligent content-based questions...');
      return this.generateIntelligentContentBasedQuestions(content, questionCount);
    }
  }

  private static prepareEnhancedContentForAI(content: ParsedContent, questionCount: number): string {
    // Limit content length to avoid token limits
    const maxLength = 12000; // Increased limit for better context
    
    let preparedContent = '';
    
    if (content.title) {
      preparedContent += `Document Title: ${content.title}\n\n`;
    }
    
    if (content.headings.length > 0) {
      preparedContent += `Main Sections:\n${content.headings.slice(0, 10).join('\n')}\n\n`;
    }
    
    if (content.concepts.length > 0) {
      preparedContent += `Key Concepts:\n${content.concepts.slice(0, 10).join(', ')}\n\n`;
    }
    
    if (content.definitions.length > 0) {
      preparedContent += `Definitions:\n${content.definitions.slice(0, 8).join('\n')}\n\n`;
    }
    
    if (content.facts.length > 0) {
      preparedContent += `Important Facts:\n${content.facts.slice(0, 6).join('\n')}\n\n`;
    }
    
    if (content.keyPoints.length > 0) {
      preparedContent += `Key Points:\n${content.keyPoints.slice(0, 10).join('\n')}\n\n`;
    }
    
    if (content.processes.length > 0) {
      preparedContent += `Processes and Procedures:\n${content.processes.slice(0, 5).join('\n')}\n\n`;
    }
    
    if (content.statistics.length > 0) {
      preparedContent += `Statistics and Data:\n${content.statistics.slice(0, 5).join('\n')}\n\n`;
    }
    
    if (content.examples.length > 0) {
      preparedContent += `Examples:\n${content.examples.slice(0, 4).join('\n')}\n\n`;
    }
    
    if (content.vocabulary.length > 0) {
      preparedContent += `Technical Vocabulary:\n${content.vocabulary.slice(0, 10).join(', ')}\n\n`;
    }
    
    preparedContent += `Full Content:\n${content.text}`;
    
    // Truncate if too long
    if (preparedContent.length > maxLength) {
      preparedContent = preparedContent.substring(0, maxLength) + '...';
    }
    
    return preparedContent;
  }

  private static generateIntelligentContentBasedQuestions(
    content: ParsedContent, 
    questionCount: number
  ): GeneratedQuizQuestion[] {
    const questions: GeneratedQuizQuestion[] = [];
    
    // 1. Definition-based questions (25% of questions)
    const definitionQuestions = Math.ceil(questionCount * 0.25);
    if (content.definitions.length > 0) {
      content.definitions.slice(0, definitionQuestions).forEach(definition => {
        const [term, meaning] = definition.split(':');
        if (term && meaning) {
          const distractors = this.generateSmartDistractors(meaning.trim(), content, 'definition');
          questions.push({
            question: `According to the document, what does "${term.trim()}" mean?`,
            options: this.shuffleArray([meaning.trim(), ...distractors]).slice(0, 4),
            correct_answer: 0, // Will be adjusted after shuffling
            explanation: `${term.trim()} is defined in the document as: ${meaning.trim()}`
          });
        }
      });
    }
    
    // 2. Concept application questions (25% of questions)
    const conceptQuestions = Math.ceil(questionCount * 0.25);
    if (content.concepts.length > 0 && questions.length < questionCount) {
      content.concepts.slice(0, conceptQuestions).forEach(concept => {
        if (questions.length < questionCount) {
          const distractors = this.generateSmartDistractors(concept, content, 'concept');
          questions.push({
            question: `Which of the following best describes "${concept}" as presented in the document?`,
            options: this.shuffleArray([
              `${concept} is a key concept discussed in detail in the document`,
              ...distractors
            ]).slice(0, 4),
            correct_answer: 0,
            explanation: `${concept} is explicitly mentioned and discussed as an important concept in the document.`
          });
        }
      });
    }
    
    // 3. Fact-based questions (25% of questions)
    const factQuestions = Math.ceil(questionCount * 0.25);
    if (content.facts.length > 0 && questions.length < questionCount) {
      content.facts.slice(0, factQuestions).forEach(fact => {
        if (questions.length < questionCount) {
          const numbers = fact.match(/\d+(?:\.\d+)?/g);
          if (numbers && numbers.length > 0) {
            const correctNumber = numbers[0];
            const distractors = this.generateNumericDistractors(correctNumber);
            const factWithoutNumber = fact.replace(correctNumber, '____');
            
            questions.push({
              question: `According to the document, what number correctly completes this statement: "${factWithoutNumber}"?`,
              options: this.shuffleArray([correctNumber, ...distractors]).slice(0, 4),
              correct_answer: 0,
              explanation: `The document states: "${fact}"`
            });
          } else {
            const distractors = this.generateSmartDistractors(fact, content, 'fact');
            questions.push({
              question: `Which statement is supported by the document?`,
              options: this.shuffleArray([
                fact.length > 80 ? fact.substring(0, 80) + '...' : fact,
                ...distractors
              ]).slice(0, 4),
              correct_answer: 0,
              explanation: `This fact is directly stated in the document: ${fact}`
            });
          }
        }
      });
    }
    
    // 4. Process and procedure questions (25% of questions)
    if (content.processes.length > 0 && questions.length < questionCount) {
      content.processes.slice(0, Math.ceil(questionCount * 0.25)).forEach(process => {
        if (questions.length < questionCount) {
          const distractors = this.generateSmartDistractors(process, content, 'process');
          questions.push({
            question: `According to the document, which of the following describes a correct process or procedure?`,
            options: this.shuffleArray([
              process.length > 80 ? process.substring(0, 80) + '...' : process,
              ...distractors
            ]).slice(0, 4),
            correct_answer: 0,
            explanation: `This process is described in the document: ${process}`
          });
        }
      });
    }
    
    // 5. Fill remaining with comprehensive questions
    while (questions.length < questionCount) {
      if (content.keyPoints.length > 0) {
        const keyPoint = content.keyPoints[questions.length % content.keyPoints.length];
        const distractors = this.generateSmartDistractors(keyPoint, content, 'keypoint');
        questions.push({
          question: `Which statement best represents a key point from the document?`,
          options: this.shuffleArray([
            keyPoint.length > 80 ? keyPoint.substring(0, 80) + '...' : keyPoint,
            ...distractors
          ]).slice(0, 4),
          correct_answer: 0,
          explanation: `This is a key point explicitly mentioned in the document.`
        });
      } else {
        // Fallback general questions
        questions.push({
          question: `Based on the document content, what approach is most effective for understanding this material?`,
          options: [
            'Active engagement with the concepts and practical application',
            'Passive reading without taking notes or reflection',
            'Memorizing specific details without understanding context',
            'Skipping difficult sections and focusing only on summaries'
          ],
          correct_answer: 0,
          explanation: 'Active engagement and practical application are proven to be the most effective learning strategies for complex material.'
        });
      }
    }
    
    // Ensure we have the correct number of questions and fix correct_answer indices
    return this.finalizeQuestions(questions.slice(0, questionCount));
  }

  private static generateSmartDistractors(correct: string, content: ParsedContent, type: string): string[] {
    const distractors: string[] = [];
    
    switch (type) {
      case 'definition':
        // Use other definitions or concepts as distractors
        const otherDefinitions = content.definitions
          .filter(def => !def.includes(correct.substring(0, 20)))
          .map(def => def.split(':')[1]?.trim())
          .filter(Boolean);
        
        if (otherDefinitions.length > 0) {
          distractors.push(...otherDefinitions.slice(0, 2));
        }
        
        // Add generic but plausible distractors
        distractors.push(
          'A general framework used across multiple disciplines',
          'A theoretical approach with limited practical applications'
        );
        break;
        
      case 'concept':
        // Use other concepts as distractors
        const otherConcepts = content.concepts
          .filter(concept => concept !== correct)
          .slice(0, 2);
        distractors.push(...otherConcepts);
        
        // Add plausible concept distractors
        distractors.push(
          'Advanced Analytical Framework',
          'Fundamental Operational Principle'
        );
        break;
        
      case 'fact':
        // Generate fact-like distractors
        distractors.push(
          'A commonly held misconception that has been disproven',
          'An outdated perspective that is no longer considered accurate',
          'A theoretical possibility that lacks empirical support'
        );
        break;
        
      case 'process':
        // Generate process-like distractors
        distractors.push(
          'An alternative approach that is less commonly used',
          'A preliminary step that occurs before the main process',
          'A troubleshooting procedure used when problems arise'
        );
        break;
        
      default:
        distractors.push(
          'This represents a minor detail with limited significance',
          'This is a common misconception that should be avoided',
          'This is an outdated approach that is no longer recommended'
        );
    }
    
    return distractors.slice(0, 3);
  }

  private static generateNumericDistractors(correctNumber: string): string[] {
    const num = parseFloat(correctNumber);
    const distractors: string[] = [];
    
    // Generate plausible numeric alternatives
    distractors.push(
      (num * 1.5).toString(),
      (num * 0.7).toString(),
      (num + (num * 0.2)).toString()
    );
    
    return distractors;
  }

  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static finalizeQuestions(questions: GeneratedQuizQuestion[]): GeneratedQuizQuestion[] {
    return questions.map(question => {
      // Find the correct answer after shuffling
      const correctOption = question.options[0]; // Original correct answer
      const correctIndex = question.options.findIndex(option => option === correctOption);
      
      return {
        ...question,
        correct_answer: correctIndex >= 0 ? correctIndex : 0
      };
    });
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