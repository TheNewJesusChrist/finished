import { supabase } from './supabase';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedContent {
  text: string;
  title?: string;
  headings: string[];
  keyPoints: string[];
}

export class DocumentParser {
  static async parseDocument(fileUrl: string, fileType: string): Promise<ParsedContent> {
    try {
      console.log('Parsing document:', fileUrl, fileType);
      
      if (fileType.includes('pdf')) {
        return await this.parsePDF(fileUrl);
      } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
        return await this.parsePowerPoint(fileUrl);
      } else if (fileType.includes('word') || fileType.includes('document')) {
        return await this.parseWord(fileUrl);
      } else {
        throw new Error('Unsupported file type');
      }
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error('Failed to parse document content');
    }
  }

  private static async parsePDF(fileUrl: string): Promise<ParsedContent> {
    try {
      // Fetch the PDF file
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const headings: string[] = [];
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
        
        // Extract potential headings (text that appears to be titles)
        const lines = pageText.split('\n');
        lines.forEach(line => {
          const trimmed = line.trim();
          if (trimmed.length > 5 && trimmed.length < 100 && 
              (trimmed.match(/^[A-Z]/) || trimmed.includes(':'))) {
            headings.push(trimmed);
          }
        });
      }
      
      const keyPoints = this.extractKeyPoints(fullText);
      const title = this.extractTitle(fullText, headings);
      
      return {
        text: fullText.trim(),
        title,
        headings: [...new Set(headings)].slice(0, 10), // Remove duplicates and limit
        keyPoints
      };
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF content');
    }
  }

  private static async parsePowerPoint(fileUrl: string): Promise<ParsedContent> {
    try {
      // For PowerPoint files, we'll use a simplified approach
      // In a production environment, you might want to use a more sophisticated library
      // or server-side processing for better PowerPoint parsing
      
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // For now, we'll return mock content for PowerPoint files
      // In a real implementation, you'd use a library like node-pptx or similar
      const mockContent = this.getMockPowerPointContent();
      
      return mockContent;
    } catch (error) {
      console.error('Error parsing PowerPoint:', error);
      throw new Error('Failed to parse PowerPoint content');
    }
  }

  private static async parseWord(fileUrl: string): Promise<ParsedContent> {
    try {
      const response = await fetch(fileUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      const headings = this.extractHeadings(text);
      const keyPoints = this.extractKeyPoints(text);
      const title = this.extractTitle(text, headings);
      
      return {
        text: text.trim(),
        title,
        headings,
        keyPoints
      };
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document content');
    }
  }

  private static extractTitle(text: string, headings: string[]): string {
    // Try to find a title from the first heading or first line
    if (headings.length > 0) {
      return headings[0];
    }
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 100) {
        return firstLine;
      }
    }
    
    return 'Course Content';
  }

  private static extractHeadings(text: string): string[] {
    const lines = text.split('\n');
    const headings: string[] = [];
    
    lines.forEach(line => {
      const trimmed = line.trim();
      // Look for lines that might be headings
      if (trimmed.length > 3 && trimmed.length < 100) {
        // Check if line starts with capital letter or contains common heading patterns
        if (/^[A-Z]/.test(trimmed) || 
            /^\d+\./.test(trimmed) || 
            trimmed.includes(':') ||
            /^(Chapter|Section|Part|Introduction|Conclusion)/i.test(trimmed)) {
          headings.push(trimmed);
        }
      }
    });
    
    return [...new Set(headings)].slice(0, 10);
  }

  private static extractKeyPoints(text: string): string[] {
    const keyPoints: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for sentences that might be key points
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 200) {
        // Look for sentences with key indicators
        if (/\b(important|key|main|primary|essential|crucial|significant)\b/i.test(trimmed) ||
            /\b(is|are|means|refers to|defined as)\b/i.test(trimmed)) {
          keyPoints.push(trimmed);
        }
      }
    });
    
    // If we don't have enough key points, take some random sentences
    if (keyPoints.length < 3) {
      const additionalPoints = sentences
        .filter(s => s.trim().length > 50 && s.trim().length < 150)
        .slice(0, 5 - keyPoints.length);
      keyPoints.push(...additionalPoints);
    }
    
    return keyPoints.slice(0, 5);
  }

  private static getMockPowerPointContent(): ParsedContent {
    return {
      text: `
        Digital Marketing Strategy Presentation
        
        Slide 1: Introduction to Digital Marketing
        Digital marketing encompasses all marketing efforts that use electronic devices or the internet. Businesses leverage digital channels such as search engines, social media, email, and other websites to connect with current and prospective customers.
        
        Slide 2: Core Components of Digital Marketing
        - Search Engine Optimization (SEO): Improving website visibility in search results
        - Pay-Per-Click Advertising (PPC): Paid advertising on search engines and social platforms
        - Social Media Marketing: Building brand awareness and engagement on social platforms
        - Content Marketing: Creating valuable content to attract and retain customers
        - Email Marketing: Direct communication with customers through email campaigns
        
        Slide 3: SEO Fundamentals
        Search Engine Optimization is the practice of increasing the quantity and quality of traffic to your website through organic search engine results. Key components include keyword research, on-page optimization, technical SEO, and link building.
        
        Slide 4: Social Media Strategy
        Effective social media marketing requires understanding your target audience, creating engaging content, maintaining consistent brand voice, and analyzing performance metrics to optimize campaigns.
        
        Slide 5: Content Marketing Best Practices
        Content marketing focuses on creating and distributing valuable, relevant, and consistent content to attract and retain a clearly defined audience. Quality content builds trust, establishes authority, and drives profitable customer action.
        
        Slide 6: Measuring Digital Marketing Success
        Key performance indicators (KPIs) include website traffic, conversion rates, engagement rates, click-through rates, return on investment (ROI), and customer acquisition cost (CAC).
        
        Slide 7: Future Trends
        Emerging trends in digital marketing include artificial intelligence, voice search optimization, video marketing, personalization, and privacy-focused marketing strategies.
      `,
      title: 'Digital Marketing Strategy',
      headings: [
        'Introduction to Digital Marketing',
        'Core Components of Digital Marketing',
        'SEO Fundamentals',
        'Social Media Strategy',
        'Content Marketing Best Practices',
        'Measuring Digital Marketing Success',
        'Future Trends'
      ],
      keyPoints: [
        'Digital marketing uses electronic devices and internet to connect with customers',
        'Core components include SEO, PPC, social media, content, and email marketing',
        'SEO improves website visibility through organic search results',
        'Social media marketing requires understanding target audience and creating engaging content',
        'Content marketing builds trust and authority through valuable content',
        'Success is measured through KPIs like traffic, conversions, and ROI'
      ]
    };
  }

  static extractKeyTopics(content: ParsedContent): string[] {
    const topics: string[] = [];
    
    // Extract from headings
    topics.push(...content.headings);
    
    // Extract from key points
    topics.push(...content.keyPoints);
    
    // Simple keyword extraction from text
    const text = content.text.toLowerCase();
    const keywords = [
      'algorithm', 'method', 'technique', 'process', 'system',
      'concept', 'principle', 'theory', 'practice', 'application',
      'strategy', 'approach', 'framework', 'model', 'structure'
    ];
    
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        topics.push(keyword);
      }
    });
    
    // Remove duplicates and return
    return [...new Set(topics)];
  }
}