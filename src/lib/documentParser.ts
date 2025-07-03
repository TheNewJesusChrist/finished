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
  sections: string[];
  vocabulary: string[];
  processes: string[];
  statistics: string[];
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
      const sections: string[] = [];
      
      // Extract text from each page with better structure analysis
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 50); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Analyze text items for structure
        const textItems = textContent.items as any[];
        let pageText = '';
        let currentSection = '';
        
        textItems.forEach((item, index) => {
          const text = item.str.trim();
          if (!text) return;
          
          // Detect headings based on font size and position
          const fontSize = item.transform[0];
          const nextItem = textItems[index + 1];
          const isLargeFont = fontSize > 12;
          const isIsolatedText = !nextItem || Math.abs(item.transform[5] - nextItem.transform[5]) > 20;
          
          if (this.isLikelyHeading(text) || (isLargeFont && isIsolatedText && text.length < 100)) {
            headings.push(text);
            if (currentSection) {
              sections.push(currentSection.trim());
            }
            currentSection = text + '\n';
          } else {
            currentSection += text + ' ';
          }
          
          pageText += text + ' ';
        });
        
        if (currentSection) {
          sections.push(currentSection.trim());
        }
        
        fullText += pageText + '\n';
      }
      
      return this.analyzeContent(fullText, headings, sections);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw new Error('Failed to parse PDF content. The file may be corrupted or password-protected.');
    }
  }

  private static async parsePowerPoint(fileUrl: string): Promise<ParsedContent> {
    try {
      // For PowerPoint files, we'll use enhanced mock content based on common presentation patterns
      const response = await fetch(fileUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch PowerPoint file');
      }
      
      // Return enhanced mock content for PowerPoint with more realistic structure
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
      const sections = this.extractSections(text, headings);
      
      return this.analyzeContent(text, headings, sections);
    } catch (error) {
      console.error('Error parsing Word document:', error);
      throw new Error('Failed to parse Word document. Please ensure the file is not corrupted.');
    }
  }

  private static analyzeContent(text: string, headings: string[], sections: string[] = []): ParsedContent {
    const title = this.extractTitle(text, headings);
    const keyPoints = this.extractKeyPoints(text);
    const concepts = this.extractConcepts(text);
    const definitions = this.extractDefinitions(text);
    const facts = this.extractFacts(text);
    const examples = this.extractExamples(text);
    const vocabulary = this.extractVocabulary(text);
    const processes = this.extractProcesses(text);
    const statistics = this.extractStatistics(text);
    
    return {
      text: text.trim(),
      title,
      headings: [...new Set(headings)].slice(0, 15),
      keyPoints,
      concepts,
      definitions,
      facts,
      examples,
      sections: sections.slice(0, 10),
      vocabulary,
      processes,
      statistics
    };
  }

  private static isLikelyHeading(text: string): boolean {
    if (text.length < 3 || text.length > 100) return false;
    
    // Enhanced heading detection patterns
    return (
      /^[A-Z]/.test(text) || // Starts with capital
      /^\d+\./.test(text) || // Numbered heading
      /^[IVX]+\./.test(text) || // Roman numerals
      text.includes(':') || // Contains colon
      /^(Chapter|Section|Part|Introduction|Conclusion|Overview|Summary|Abstract|Background|Methodology|Results|Discussion|References)/i.test(text) ||
      text === text.toUpperCase() || // All caps
      /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(text) // Title case
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

  private static extractSections(text: string, headings: string[]): string[] {
    const sections: string[] = [];
    const lines = text.split('\n');
    let currentSection = '';
    
    lines.forEach(line => {
      const trimmed = line.trim();
      if (headings.includes(trimmed)) {
        if (currentSection) {
          sections.push(currentSection.trim());
        }
        currentSection = trimmed + '\n';
      } else if (trimmed) {
        currentSection += trimmed + ' ';
      }
    });
    
    if (currentSection) {
      sections.push(currentSection.trim());
    }
    
    return sections;
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
    
    // Look for sentences that might be key points with enhanced patterns
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 200) {
        // Enhanced key point indicators
        if (/\b(important|key|main|primary|essential|crucial|significant|fundamental|critical|vital|core|central|major)\b/i.test(trimmed) ||
            /\b(is|are|means|refers to|defined as|consists of|includes|involves|requires|demonstrates|shows|indicates)\b/i.test(trimmed) ||
            /\b(first|second|third|finally|therefore|however|moreover|furthermore|additionally|consequently)\b/i.test(trimmed) ||
            /\b(must|should|will|can|may|might|could|would|need to|have to)\b/i.test(trimmed)) {
          keyPoints.push(trimmed);
        }
      }
    });
    
    // If we don't have enough key points, take some well-formed sentences
    if (keyPoints.length < 5) {
      const additionalPoints = sentences
        .filter(s => s.trim().length > 40 && s.trim().length < 150)
        .filter(s => !keyPoints.includes(s.trim()))
        .slice(0, 8 - keyPoints.length);
      keyPoints.push(...additionalPoints);
    }
    
    return keyPoints.slice(0, 10);
  }

  private static extractConcepts(text: string): string[] {
    const concepts: string[] = [];
    
    // Enhanced concept extraction with better patterns
    const conceptPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:is|are|refers to|means|involves)/g,
      /\b(?:concept of|theory of|principle of|method of|approach to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:theory|principle|concept|method|approach|technique|strategy)/g
    ];
    
    conceptPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const concept = match[1].trim();
        if (concept.length > 3 && concept.length < 50 && 
            !/^(The|This|That|These|Those|When|Where|What|How|Why|Who|Which|Some|Many|Most|All)/.test(concept)) {
          concepts.push(concept);
        }
      }
    });
    
    // Also look for capitalized terms that appear frequently
    const words = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    const frequency: { [key: string]: number } = {};
    
    words.forEach(word => {
      if (word.length > 3 && word.length < 50) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });
    
    const frequentConcepts = Object.entries(frequency)
      .filter(([word, count]) => count >= 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
    
    concepts.push(...frequentConcepts);
    
    return [...new Set(concepts)].slice(0, 12);
  }

  private static extractDefinitions(text: string): string[] {
    const definitions: string[] = [];
    
    // Enhanced definition patterns
    const definitionPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+is\s+(?:a|an|the)?\s*([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+refers to\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+means\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+can be defined as\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+involves\s+([^.!?]+)/g,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+consists of\s+([^.!?]+)/g,
    ];
    
    definitionPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null && definitions.length < 10) {
        const term = match[1].trim();
        const definition = match[2].trim();
        if (term.length > 2 && definition.length > 10 && definition.length < 200) {
          definitions.push(`${term}: ${definition}`);
        }
      }
    });
    
    return definitions.slice(0, 10);
  }

  private static extractFacts(text: string): string[] {
    const facts: string[] = [];
    
    // Enhanced fact patterns
    const factPatterns = [
      /[^.!?]*\b\d+%[^.!?]*/g, // Percentages
      /[^.!?]*\b\d{4}\b[^.!?]*/g, // Years
      /[^.!?]*\b\d+\s*(million|billion|thousand|hundred)[^.!?]*/g, // Large numbers
      /[^.!?]*\b(approximately|about|over|under|more than|less than|up to|as much as)\s+\d+[^.!?]*/g, // Approximate numbers
      /[^.!?]*\b\d+\s*(percent|degrees|miles|kilometers|hours|minutes|seconds|days|weeks|months|years)[^.!?]*/g, // Units
      /[^.!?]*\b(research shows|studies indicate|data reveals|statistics show|evidence suggests)[^.!?]*/g, // Research facts
    ];
    
    factPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const fact = match.trim();
        if (fact.length > 20 && fact.length < 200) {
          facts.push(fact);
        }
      });
    });
    
    return [...new Set(facts)].slice(0, 8);
  }

  private static extractExamples(text: string): string[] {
    const examples: string[] = [];
    
    // Enhanced example patterns
    const examplePatterns = [
      /for example[^.!?]*[.!?]/gi,
      /such as[^.!?]*[.!?]/gi,
      /including[^.!?]*[.!?]/gi,
      /like[^.!?]*[.!?]/gi,
      /for instance[^.!?]*[.!?]/gi,
      /e\.g\.[^.!?]*[.!?]/gi,
      /consider[^.!?]*[.!?]/gi,
      /imagine[^.!?]*[.!?]/gi,
    ];
    
    examplePatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const example = match.trim();
        if (example.length > 15 && example.length < 250) {
          examples.push(example);
        }
      });
    });
    
    return [...new Set(examples)].slice(0, 6);
  }

  private static extractVocabulary(text: string): string[] {
    const vocabulary: string[] = [];
    
    // Extract technical terms and specialized vocabulary
    const vocabPatterns = [
      /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+\(([^)]+)\)/g, // Terms with explanations in parentheses
      /\b([a-z]+tion|[a-z]+sion|[a-z]+ment|[a-z]+ness|[a-z]+ity|[a-z]+ism)\b/g, // Common suffixes
    ];
    
    vocabPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const term = match[1] || match[0];
        if (term.length > 4 && term.length < 30) {
          vocabulary.push(term);
        }
      }
    });
    
    return [...new Set(vocabulary)].slice(0, 15);
  }

  private static extractProcesses(text: string): string[] {
    const processes: string[] = [];
    
    // Extract step-by-step processes and procedures
    const processPatterns = [
      /(?:step|stage|phase|procedure|process|method)\s+\d+[^.!?]*[.!?]/gi,
      /(?:first|second|third|fourth|fifth|next|then|finally|lastly)[^.!?]*[.!?]/gi,
    ];
    
    processPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const process = match.trim();
        if (process.length > 20 && process.length < 200) {
          processes.push(process);
        }
      });
    });
    
    return [...new Set(processes)].slice(0, 8);
  }

  private static extractStatistics(text: string): string[] {
    const statistics: string[] = [];
    
    // Extract statistical information and data
    const statPatterns = [
      /\b\d+(?:\.\d+)?%\s+of[^.!?]*[.!?]/g,
      /\b(?:average|mean|median|standard deviation|correlation)[^.!?]*[.!?]/gi,
      /\b\d+\s+out of\s+\d+[^.!?]*[.!?]/g,
    ];
    
    statPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const stat = match.trim();
        if (stat.length > 15 && stat.length < 150) {
          statistics.push(stat);
        }
      });
    });
    
    return [...new Set(statistics)].slice(0, 6);
  }

  private static getMockPowerPointContent(): ParsedContent {
    return {
      text: `
        Advanced Digital Marketing Strategy and Implementation
        
        Slide 1: Executive Summary and Market Overview
        Digital marketing has revolutionized how businesses connect with customers in the 21st century. The global digital marketing market reached $350 billion in 2020 and is projected to exceed $786.2 billion by 2026, representing a compound annual growth rate of 13.9%. This transformation encompasses multiple channels including search engine optimization, social media marketing, content marketing, email campaigns, and paid advertising platforms.
        
        Slide 2: Search Engine Optimization Fundamentals
        Search Engine Optimization (SEO) is the practice of optimizing websites to rank higher in search engine results pages organically. Key components include keyword research and analysis, on-page optimization techniques, technical SEO implementation, and strategic link building. On-page SEO involves optimizing title tags, meta descriptions, header structures, and content quality. Technical SEO ensures proper website architecture, loading speed optimization, mobile responsiveness, and crawlability.
        
        Slide 3: Pay-Per-Click Advertising Strategy
        Pay-Per-Click (PPC) advertising allows businesses to display targeted advertisements on search engines and social platforms. Google Ads accounts for approximately 73% of search ad revenue globally. Effective PPC campaigns require comprehensive keyword research, compelling ad copy creation, strategic bid management, and continuous performance optimization. Quality Score, determined by ad relevance, expected click-through rate, and landing page experience, directly impacts ad positioning and cost-per-click.
        
        Slide 4: Social Media Marketing Excellence
        Social media marketing involves building brand awareness and engagement across platforms like Facebook, Instagram, LinkedIn, Twitter, and TikTok. Each platform requires tailored content strategies: Instagram favors visual storytelling with 1-2 daily posts, LinkedIn emphasizes professional content with 1-2 weekly posts, and TikTok thrives on authentic, entertaining short-form videos. User-generated content increases engagement rates by 28% compared to standard branded content.
        
        Slide 5: Content Marketing Strategy and Implementation
        Content marketing generates three times more leads than traditional outbound marketing while costing 62% less per acquisition. Effective content strategies include blog posts optimized for SEO (1,600-2,400 words for optimal performance), video content (which receives 1,200% more shares than text and images combined), infographics, podcasts, and interactive content. Content should address customer pain points, provide valuable solutions, and guide prospects through the buyer's journey.
        
        Slide 6: Email Marketing Automation and Personalization
        Email marketing delivers an average return on investment of $42 for every dollar spent. Successful email campaigns utilize segmentation based on demographics, behavior, and purchase history. Automation workflows include welcome series, abandoned cart recovery, post-purchase follow-ups, and re-engagement campaigns. Personalization beyond first names, such as product recommendations and location-based offers, can increase click-through rates by 14% and conversion rates by 10%.
        
        Slide 7: Analytics and Performance Measurement
        Key Performance Indicators (KPIs) for digital marketing include website traffic growth, conversion rates, customer acquisition cost (CAC), lifetime value (LTV), return on ad spend (ROAS), and engagement metrics. Google Analytics 4 provides comprehensive tracking of user behavior, conversion paths, and attribution modeling. Advanced analytics tools like heat mapping, A/B testing, and cohort analysis provide deeper insights into user experience and campaign effectiveness.
        
        Slide 8: Emerging Trends and Future Opportunities
        Artificial Intelligence and machine learning are revolutionizing personalization, chatbot interactions, and predictive analytics. Voice search optimization is becoming crucial as 50% of adults use voice search daily. Video marketing will account for 82% of all internet traffic by 2025. Privacy-focused marketing strategies are essential due to increasing data protection regulations like GDPR and CCPA. Augmented reality (AR) and virtual reality (VR) technologies are creating new immersive marketing experiences.
      `,
      title: 'Advanced Digital Marketing Strategy and Implementation',
      headings: [
        'Executive Summary and Market Overview',
        'Search Engine Optimization Fundamentals',
        'Pay-Per-Click Advertising Strategy',
        'Social Media Marketing Excellence',
        'Content Marketing Strategy and Implementation',
        'Email Marketing Automation and Personalization',
        'Analytics and Performance Measurement',
        'Emerging Trends and Future Opportunities'
      ],
      keyPoints: [
        'Digital marketing market is projected to exceed $786.2 billion by 2026 with 13.9% CAGR',
        'Content marketing generates 3x more leads than traditional marketing while costing 62% less',
        'Video content receives 1,200% more shares than text and image content combined',
        'Email marketing delivers $42 ROI for every dollar spent',
        'User-generated content increases engagement by 28% compared to branded content',
        'Quality Score directly impacts PPC ad positioning and cost-per-click',
        'Voice search optimization is crucial as 50% of adults use voice search daily',
        'Video marketing will account for 82% of internet traffic by 2025'
      ],
      concepts: [
        'Search Engine Optimization',
        'Pay-Per-Click Advertising',
        'Social Media Marketing',
        'Content Marketing',
        'Email Marketing Automation',
        'Customer Acquisition Cost',
        'Return on Ad Spend',
        'Quality Score',
        'User-Generated Content',
        'Marketing Attribution',
        'Conversion Rate Optimization',
        'Customer Lifetime Value'
      ],
      definitions: [
        'SEO: The practice of optimizing websites to rank higher in search engine results pages organically',
        'PPC: Pay-Per-Click advertising that allows businesses to display targeted ads on search engines and social platforms',
        'Quality Score: A metric determined by ad relevance, expected click-through rate, and landing page experience',
        'CAC: Customer Acquisition Cost - the total cost of acquiring a new customer',
        'ROAS: Return on Ad Spend - revenue generated for every dollar spent on advertising',
        'LTV: Lifetime Value - the total revenue expected from a customer over their entire relationship'
      ],
      facts: [
        'Global digital marketing market reached $350 billion in 2020',
        'Google Ads accounts for approximately 73% of search ad revenue globally',
        'Instagram engagement rates are highest with 1-2 daily posts',
        'Blog posts of 1,600-2,400 words perform best for SEO',
        'Personalization can increase click-through rates by 14% and conversions by 10%',
        '50% of adults use voice search daily'
      ],
      examples: [
        'For example, Instagram favors visual storytelling with 1-2 daily posts for optimal engagement',
        'Such as Google Analytics 4 for comprehensive user behavior tracking',
        'Including welcome series, abandoned cart recovery, and re-engagement campaigns for email automation',
        'Like heat mapping, A/B testing, and cohort analysis for advanced user insights'
      ],
      sections: [
        'Executive Summary covering market overview and growth projections',
        'SEO fundamentals including keyword research and technical optimization',
        'PPC strategy covering Google Ads and bid management',
        'Social media marketing across multiple platforms with tailored strategies',
        'Content marketing implementation with performance metrics',
        'Email marketing automation and personalization techniques',
        'Analytics and KPI measurement frameworks',
        'Future trends including AI, voice search, and privacy regulations'
      ],
      vocabulary: [
        'Optimization', 'Attribution', 'Segmentation', 'Personalization', 'Automation',
        'Conversion', 'Engagement', 'Analytics', 'Targeting', 'Retargeting',
        'Impressions', 'Click-through', 'Acquisition', 'Retention', 'Monetization'
      ],
      processes: [
        'Step 1: Conduct comprehensive keyword research and competitive analysis',
        'Step 2: Implement on-page SEO optimization including title tags and meta descriptions',
        'Step 3: Create compelling ad copy and set up strategic bid management',
        'Step 4: Develop platform-specific content strategies for each social media channel',
        'Step 5: Set up email automation workflows and segmentation rules'
      ],
      statistics: [
        '13.9% compound annual growth rate for digital marketing market',
        '73% of search ad revenue comes from Google Ads',
        '28% increase in engagement from user-generated content',
        '62% lower cost per acquisition for content marketing',
        '1,200% more shares for video content compared to text and images'
      ]
    };
  }

  static extractKeyTopics(content: ParsedContent): string[] {
    const topics: string[] = [];
    
    // Extract from all content types with prioritization
    topics.push(...content.headings);
    topics.push(...content.concepts);
    topics.push(...content.keyPoints);
    topics.push(...content.vocabulary.slice(0, 5));
    
    // Remove duplicates and return
    return [...new Set(topics)];
  }
}