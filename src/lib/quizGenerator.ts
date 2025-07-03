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
      console.log('Falling back to intelligent template-based questions...');
      return this.generateIntelligentFallbackQuestions(content, questionCount);
    }
  }

  private static prepareEnhancedContentForAI(content: ParsedContent, questionCount: number): string {
    // Limit content length to avoid token limits
    const maxLength = 10000; // Conservative limit for GPT-3.5-turbo
    
    let preparedContent = '';
    
    if (content.title) {
      preparedContent += `Document Title: ${content.title}\n\n`;
    }
    
    if (content.headings.length > 0) {
      preparedContent += `Main Sections:\n${content.headings.slice(0, 10).join('\n')}\n\n`;
    }
    
    if (content.concepts.length > 0) {
      preparedContent += `Key Concepts:\n${content.concepts.slice(0, 8).join(', ')}\n\n`;
    }
    
    if (content.definitions.length > 0) {
      preparedContent += `Definitions:\n${content.definitions.slice(0, 6).join('\n')}\n\n`;
    }
    
    if (content.facts.length > 0) {
      preparedContent += `Important Facts:\n${content.facts.slice(0, 5).join('\n')}\n\n`;
    }
    
    if (content.keyPoints.length > 0) {
      preparedContent += `Key Points:\n${content.keyPoints.slice(0, 8).join('\n')}\n\n`;
    }
    
    if (content.examples.length > 0) {
      preparedContent += `Examples:\n${content.examples.slice(0, 4).join('\n')}\n\n`;
    }
    
    preparedContent += `Full Content:\n${content.text}`;
    
    // Truncate if too long
    if (preparedContent.length > maxLength) {
      preparedContent = preparedContent.substring(0, maxLength) + '...';
    }
    
    return preparedContent;
  }

  private static generateIntelligentFallbackQuestions(
    content: ParsedContent, 
    questionCount: number
  ): GeneratedQuizQuestion[] {
    const questions: GeneratedQuizQuestion[] = [];
    
    // Generate questions based on different content types
    
    // 1. Definition-based questions
    if (content.definitions.length > 0) {
      content.definitions.slice(0, Math.min(2, questionCount)).forEach(definition => {
        const [term, meaning] = definition.split(':');
        if (term && meaning) {
          questions.push({
            question: `What does "${term.trim()}" mean according to the document?`,
            options: [
              meaning.trim(),
              this.generateDistractor(meaning, 'definition'),
              this.generateDistractor(meaning, 'definition'),
              this.generateDistractor(meaning, 'definition')
            ],
            correct_answer: 0,
            explanation: `According to the document, ${term.trim()} is defined as: ${meaning.trim()}`
          });
        }
      });
    }
    
    // 2. Concept-based questions
    if (content.concepts.length > 0 && questions.length < questionCount) {
      const concept = content.concepts[0];
      questions.push({
        question: `Which of the following is a key concept discussed in "${content.title || 'this document'}"?`,
        options: [
          concept,
          this.generateDistractor(concept, 'concept'),
          this.generateDistractor(concept, 'concept'),
          this.generateDistractor(concept, 'concept')
        ],
        correct_answer: 0,
        explanation: `${concept} is explicitly mentioned as a key concept in the document.`
      });
    }
    
    // 3. Fact-based questions
    if (content.facts.length > 0 && questions.length < questionCount) {
      const fact = content.facts[0];
      const numbers = fact.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const correctNumber = numbers[0];
        questions.push({
          question: `According to the document, what is the correct figure mentioned?`,
          options: [
            fact.substring(0, 80) + (fact.length > 80 ? '...' : ''),
            this.generateNumericDistractor(fact, correctNumber),
            this.generateNumericDistractor(fact, correctNumber),
            this.generateNumericDistractor(fact, correctNumber)
          ],
          correct_answer: 0,
          explanation: `This fact is directly stated in the document: ${fact}`
        });
      }
    }
    
    // 4. Heading/structure-based questions
    if (content.headings.length > 0 && questions.length < questionCount) {
      const heading = content.headings[0];
      questions.push({
        question: `Which section is covered in this document?`,
        options: [
          heading,
          this.generateDistractor(heading, 'heading'),
          this.generateDistractor(heading, 'heading'),
          this.generateDistractor(heading, 'heading')
        ],
        correct_answer: 0,
        explanation: `"${heading}" is one of the main sections covered in the document.`
      });
    }
    
    // 5. Key point comprehension questions
    if (content.keyPoints.length > 0 && questions.length < questionCount) {
      const keyPoint = content.keyPoints[0];
      questions.push({
        question: `Which statement best represents a key point from the document?`,
        options: [
          keyPoint.substring(0, 80) + (keyPoint.length > 80 ? '...' : ''),
          this.generateDistractor(keyPoint, 'keypoint'),
          this.generateDistractor(keyPoint, 'keypoint'),
          this.generateDistractor(keyPoint, 'keypoint')
        ],
        correct_answer: 0,
        explanation: `This is a key point explicitly mentioned in the document.`
      });
    }
    
    // 6. General comprehension questions
    while (questions.length < questionCount) {
      questions.push({
        question: `What is the primary purpose of this document?`,
        options: [
          'To provide comprehensive understanding of the subject matter',
          'To give a brief overview without details',
          'To test existing knowledge only',
          'To provide entertainment and stories'
        ],
        correct_answer: 0,
        explanation: 'The document is designed to provide comprehensive understanding and practical knowledge of the subject matter.'
      });
      
      if (questions.length < questionCount) {
        questions.push({
          question: `Based on the document content, what approach is most effective for learning this material?`,
          options: [
            'Active engagement with the concepts and practical application',
            'Passive reading without taking notes',
            'Memorizing facts without understanding context',
            'Skipping difficult sections entirely'
          ],
          correct_answer: 0,
          explanation: 'Active engagement and practical application are proven to be the most effective learning strategies for complex material.'
        });
      }
    }
    
    return questions.slice(0, questionCount);
  }

  private static generateDistractor(original: string, type: string): string {
    // Generate intelligent distractors based on the type and content
    const distractors = {
      definition: [
        'A general term used in various contexts',
        'A concept that is not clearly defined in the literature',
        'An outdated approach that is no longer relevant',
        'A theoretical framework with limited practical application'
      ],
      concept: [
        'Advanced Theoretical Framework',
        'Basic Fundamental Principle',
        'Complex Analytical Method',
        'Standard Operating Procedure'
      ],
      heading: [
        'Introduction and Overview',
        'Advanced Techniques and Methods',
        'Summary and Conclusions',
        'Background and Context'
      ],
      keypoint: [
        'This is a minor detail that has limited significance',
        'This represents an outdated perspective on the topic',
        'This is a common misconception that should be avoided',
        'This is a theoretical concept with no practical application'
      ]
    };
    
    const options = distractors[type as keyof typeof distractors] || distractors.definition;
    return options[Math.floor(Math.random() * options.length)];
  }

  private static generateNumericDistractor(original: string, correctNumber: string): string {
    const num = parseInt(correctNumber);
    const variations = [
      (num * 1.5).toString(),
      (num * 0.7).toString(),
      (num + 100).toString(),
      (num - 50).toString()
    ];
    
    const randomVariation = variations[Math.floor(Math.random() * variations.length)];
    return original.replace(correctNumber, randomVariation);
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