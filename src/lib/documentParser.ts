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
  concepts: string[];
  definitions: string[];
  facts: string[];
  examples: string[];
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
        throw new Error('Unsupported file type. Please upload PDF, PowerPoint, or Word documents.');
      }
    } catch (error) {
      console.error('Error parsing document:', error);
      throw new Error('Could not understand the file. Try uploading a simpler version or a different format.');
    }
  }

  private static async parsePDF(fileUrl: string): Promise<ParsedContent> {
    try {
      // Fetch the PDF file
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PDF file');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      // Load the PDF document
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      const headings: string[] = [];
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) { // Limit to 50 pages
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
          if (this.isLikelyHeading(trimmed)) {
            headings.push(trimmed);
          }
        });
      }
      
      return this.analyzeContent(fullText, headings);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF content. The file may be corrupted or password-protected.');
    }
  }

  private static async parsePowerPoint(fileUrl: string): Promise<ParsedContent> {
    try {
      // For PowerPoint files, we'll use a more sophisticated mock
      // In production, you'd use a server-side service or specialized library
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PowerPoint file');
      }
      
      // Return enhanced mock content for PowerPoint
      return this.getMockPowerPointContent();
    } catch (error) {
      console.error('Error parsing PowerPoint:', error);
      throw new Error('Failed to parse PowerPoint content. Please try converting to PDF first.');
    }
  }

  private static async parseWord(fileUrl: string): Promise<ParsedContent> {
    try {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch Word document');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value;
      
      if (!text || text.trim().length === 0) {
        throw new Error('No text content found in the document');
      }
      
      const headings = this.extractHeadings(text);
      
      return this.analyzeContent(text, headings);
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document. Please ensure the file is not corrupted.');
    }
  }

  private static analyzeContent(text: string, headings: string[]): ParsedContent {
    const title = this.extractTitle(text, headings);
    const keyPoints = this.extractKeyPoints(text);
    const concepts = this.extractConcepts(text);
    const definitions = this.extractDefinitions(text);
    const facts = this.extractFacts(text);
    const examples = this.extractExamples(text);
    
    return {
      text: text.trim(),
      title,
      headings: [...new Set(headings)].slice(0, 15),
      keyPoints,
      concepts,
      definitions,
      facts,
      examples
    };
  }

  private static isLikelyHeading(text: string): boolean {
    if (text.length < 3 || text.length > 100) return false;
    
    // Check for heading patterns
    return (
      /^[A-Z]/.test(text) || // Starts with capital
      /^\d+\./.test(text) || // Numbered heading
      text.includes(':') || // Contains colon
      /^(Chapter|Section|Part|Introduction|Conclusion|Overview|Summary)/i.test(text) ||
      text === text.toUpperCase() // All caps
    );
  }

  private static extractTitle(text: string, headings: string[]): string {
    // Try to find a title from the first heading or first meaningful line
    if (headings.length > 0) {
      return headings[0];
    }
    
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 100 && firstLine.length > 5) {
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
      if (this.isLikelyHeading(trimmed)) {
        headings.push(trimmed);
      }
    });
    
    return [...new Set(headings)].slice(0, 15);
  }

  private static extractKeyPoints(text: string): string[] {
    const keyPoints: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Look for sentences that might be key points
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 200) {
        // Look for sentences with key indicators
        if (/\b(important|key|main|primary|essential|crucial|significant|fundamental|critical)\b/i.test(trimmed) ||
            /\b(is|are|means|refers to|defined as|consists of|includes)\b/i.test(trimmed) ||
            /\b(first|second|third|finally|therefore|however|moreover)\b/i.test(trimmed)) {
          keyPoints.push(trimmed);
        }
      }
    });
    
    // If we don't have enough key points, take some well-formed sentences
    if (keyPoints.length < 5) {
      const additionalPoints = sentences
        .filter(s => s.trim().length > 40 && s.trim().length < 150)
        .filter(s => !keyPoints.includes(s.trim()))
        .slice(0, 5 - keyPoints.length);
      keyPoints.push(...additionalPoints);
    }
    
    return keyPoints.slice(0, 8);
  }

  private static extractConcepts(text: string): string[] {
    const concepts: string[] = [];
    
    // Look for capitalized terms that might be concepts
    const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const conceptCandidates = words.filter(word => 
      word.length > 3 && 
      word.length < 50 &&
      !/^(The|This|That|These|Those|When|Where|What|How|Why|Who)/.test(word)
    );
    
    // Count frequency and take most common
    const frequency: { [key: string]: number } = {};
    conceptCandidates.forEach(concept => {
      frequency[concept] = (frequency[concept] || 0) + 1;
    });
    
    const sortedConcepts = Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([concept]) => concept);
    
    return sortedConcepts;
  }

  private static extractDefinitions(text: string): string[] {
    const definitions: string[] = [];
    
    // Look for definition patterns
    const definitionPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+refers to\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+means\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+can be defined as\s+([^.!?]+)/g,
    ];
    
    definitionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null && definitions.length < 8) {
        const term = match[1].trim();
        const definition = match[2].trim();
        if (term.length > 2 && definition.length > 10) {
          definitions.push(`${term}: ${definition}`);
        }
      }
    });
    
    return definitions.slice(0, 8);
  }

  private static extractFacts(text: string): string[] {
    const facts: string[] = [];
    
    // Look for factual statements with numbers, dates, percentages
    const factPatterns = [
      /[^.!?]*\b\d+%[^.!?]*/g, // Percentages
      /[^.!?]*\b\d{4}\b[^.!?]*/g, // Years
      /[^.!?]*\b\d+\s*(million|billion|thousand|hundred)[^.!?]*/g, // Large numbers
      /[^.!?]*\b(approximately|about|over|under|more than|less than)\s+\d+[^.!?]*/g, // Approximate numbers
    ];
    
    factPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const fact = match.trim();
        if (fact.length > 20 && fact.length < 150) {
          facts.push(fact);
        }
      });
    });
    
    return [...new Set(facts)].slice(0, 6);
  }

  private static extractExamples(text: string): string[] {
    const examples: string[] = [];
    
    // Look for example patterns
    const examplePatterns = [
      /for example[^.!?]*[.!?]/gi,
      /such as[^.!?]*[.!?]/gi,
      /including[^.!?]*[.!?]/gi,
      /like[^.!?]*[.!?]/gi,
    ];
    
    examplePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const example = match.trim();
        if (example.length > 15 && example.length < 200) {
          examples.push(example);
        }
      });
    });
    
    return [...new Set(examples)].slice(0, 5);
  }

  private static getMockPowerPointContent(): ParsedContent {
    return {
      text: `
        Digital Marketing Strategy Presentation
        
        Slide 1: Introduction to Digital Marketing
        Digital marketing encompasses all marketing efforts that use electronic devices or the internet. Businesses leverage digital channels such as search engines, social media, email, and other websites to connect with current and prospective customers. The global digital marketing market is expected to reach $786.2 billion by 2026.
        
        Slide 2: Core Components of Digital Marketing
        Search Engine Optimization (SEO) is the practice of optimizing websites to rank higher in search engine results pages. Pay-Per-Click Advertising (PPC) allows businesses to display ads on search engines and social platforms. Social Media Marketing involves building brand awareness and engagement on platforms like Facebook, Instagram, and LinkedIn. Content Marketing focuses on creating valuable content to attract and retain customers. Email Marketing provides direct communication with customers through targeted campaigns.
        
        Slide 3: SEO Fundamentals
        Search Engine Optimization improves website visibility through organic search results. Key components include keyword research, on-page optimization, technical SEO, and link building. On-page SEO involves optimizing title tags, meta descriptions, headers, and content. Technical SEO ensures proper website structure, loading speed, and mobile responsiveness.
        
        Slide 4: Social Media Strategy
        Effective social media marketing requires understanding your target audience demographics and preferences. Content should be engaging, shareable, and aligned with brand voice. Posting frequency varies by platform: Instagram 1-2 times daily, Facebook 3-5 times weekly, LinkedIn 1-2 times daily. User-generated content increases engagement by 28% compared to standard company posts.
        
        Slide 5: Content Marketing Best Practices
        Content marketing generates 3 times more leads than traditional marketing while costing 62% less. Quality content builds trust, establishes authority, and drives profitable customer action. Blog posts should be 1,600-2,400 words for optimal SEO performance. Video content receives 1,200% more shares than text and image content combined.
        
        Slide 6: Measuring Digital Marketing Success
        Key Performance Indicators (KPIs) include website traffic, conversion rates, engagement rates, click-through rates, return on investment (ROI), and customer acquisition cost (CAC). Google Analytics provides comprehensive tracking of website performance. Social media analytics tools measure engagement, reach, and follower growth.
        
        Slide 7: Future Trends in Digital Marketing
        Artificial Intelligence is revolutionizing personalization and customer targeting. Voice search optimization is becoming crucial as 50% of adults use voice search daily. Video marketing will account for 82% of all internet traffic by 2025. Privacy-focused marketing strategies are essential due to increasing data protection regulations.
      `,
      title: 'Digital Marketing Strategy',
      headings: [
        'Introduction to Digital Marketing',
        'Core Components of Digital Marketing',
        'SEO Fundamentals',
        'Social Media Strategy',
        'Content Marketing Best Practices',
        'Measuring Digital Marketing Success',
        'Future Trends in Digital Marketing'
      ],
      keyPoints: [
        'Digital marketing uses electronic devices and internet to connect with customers',
        'The global digital marketing market is expected to reach $786.2 billion by 2026',
        'Core components include SEO, PPC, social media, content, and email marketing',
        'Content marketing generates 3 times more leads than traditional marketing',
        'Video content receives 1,200% more shares than text and image content',
        'User-generated content increases engagement by 28%'
      ],
      concepts: [
        'Digital Marketing',
        'Search Engine Optimization',
        'Pay-Per-Click Advertising',
        'Social Media Marketing',
        'Content Marketing',
        'Email Marketing',
        'Key Performance Indicators',
        'Return on Investment'
      ],
      definitions: [
        'SEO: The practice of optimizing websites to rank higher in search engine results pages',
        'PPC: Advertising model where businesses pay for each click on their ads',
        'Content Marketing: Strategy focused on creating valuable content to attract customers',
        'KPIs: Key Performance Indicators used to measure marketing success'
      ],
      facts: [
        'The global digital marketing market is expected to reach $786.2 billion by 2026',
        'Content marketing costs 62% less than traditional marketing',
        'Video marketing will account for 82% of all internet traffic by 2025',
        '50% of adults use voice search daily'
      ],
      examples: [
        'For example, Instagram requires 1-2 posts daily for optimal engagement',
        'Such as Facebook, Instagram, and LinkedIn for social media marketing',
        'Including keyword research, on-page optimization, and link building for SEO'
      ]
    };
  }

  static extractKeyTopics(content: ParsedContent): string[] {
    const topics: string[] = [];
    
    // Extract from all content types
    topics.push(...content.headings);
    topics.push(...content.concepts);
    topics.push(...content.keyPoints);
    
    // Remove duplicates and return
    return [...new Set(topics)];
  }
}