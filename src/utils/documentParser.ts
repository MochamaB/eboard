/**
 * Document Parser Utility
 * Extracts text from PDF and DOCX files and parses agenda items
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set PDF.js worker from CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface ParsedAgendaItem {
  title: string;
  description: string;
  itemType: 'discussion' | 'decision' | 'information' | 'committee_report';
  estimatedDuration: number;
  orderIndex: number;
  parentOrderIndex?: number; // For nested items
  level?: number; // Indentation level (0 = root, 1 = child, etc.)
}

export interface ParseResult {
  items: ParsedAgendaItem[];
  rawText: string;
  fileName: string;
}

/**
 * Supported file extensions for document parsing
 */
export const SUPPORTED_DOCUMENT_TYPES = ['.pdf', '.docx', '.txt'];

/**
 * Extract text from PDF file using pdf.js
 */
async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: { str?: string }) => item.str || '')
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

/**
 * Extract text from DOCX file using mammoth
 * Uses HTML extraction to preserve numbered list formatting
 */
async function extractTextFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  
  // Try HTML extraction first (preserves list numbering)
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
  
  console.log('🔍 HTML extraction preview:', htmlResult.value.substring(0, 800));
  
  // Parse HTML and convert to numbered text
  const html = htmlResult.value;
  let result = '';
  const listStack: number[] = []; // Stack to track list item counters at each depth
  
  // Simple HTML parser using regex to process tags in order
  let pos = 0;
  const tagPattern = /<(\/?)(ol|li|p|br|strong|em|b|i)[^>]*>|([^<]+)/gi;
  let match;
  
  while ((match = tagPattern.exec(html)) !== null) {
    const [fullMatch, closingSlash, tagName, textContent] = match;
    
    if (textContent) {
      // Plain text content
      result += textContent.trim() + ' ';
    } else if (tagName === 'ol') {
      if (!closingSlash) {
        // Opening <ol> - start new list level
        listStack.push(0);
      } else {
        // Closing </ol> - end current list level
        listStack.pop();
      }
    } else if (tagName === 'li' && !closingSlash) {
      // Opening <li> - increment counter and add number
      if (listStack.length > 0) {
        listStack[listStack.length - 1]++;
        
        // Build hierarchical number
        const numberStr = listStack.join('.');
        result += `\n${numberStr}. `;
      }
    } else if (tagName === 'p' || tagName === 'br') {
      // Paragraph breaks
      if (!closingSlash) {
        result += '\n';
      }
    }
    // Ignore formatting tags like strong, em, b, i
  }
  
  // Decode HTML entities
  result = result.replace(/&nbsp;/g, ' ');
  result = result.replace(/&amp;/g, '&');
  result = result.replace(/&lt;/g, '<');
  result = result.replace(/&gt;/g, '>');
  result = result.replace(/&quot;/g, '"');
  result = result.replace(/&#39;/g, "'");
  
  // Clean up whitespace
  result = result.replace(/ +/g, ' '); // Multiple spaces to single
  result = result.replace(/\n +/g, '\n'); // Remove leading spaces
  result = result.replace(/\n{3,}/g, '\n\n'); // Max 2 line breaks
  
  return result.trim();
}

/**
 * Extract text from plain text file
 */
async function extractTextFromTxt(file: File): Promise<string> {
  return await file.text();
}

/**
 * Clean up title text
 */
function cleanTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[–—]/g, '-') // Normalize dashes
    .replace(/^\W+/, '') // Remove leading non-word chars
    .replace(/\s*[-–—:]\s*$/, '') // Remove trailing punctuation
    .trim();
}

/**
 * Guess item type based on keywords in title
 */
function guessItemType(title: string): ParsedAgendaItem['itemType'] {
  const lower = title.toLowerCase();

  // Decision indicators
  if (
    lower.includes('approv') ||
    lower.includes('vote') ||
    lower.includes('resolution') ||
    lower.includes('motion') ||
    lower.includes('ratif') ||
    lower.includes('adopt') ||
    lower.includes('elect')
  ) {
    return 'decision';
  }

  // Report indicators
  if (
    lower.includes('report') ||
    lower.includes('committee') ||
    lower.includes('update from') ||
    lower.includes('presentation')
  ) {
    return 'committee_report';
  }

  // Information indicators
  if (
    lower.includes('call to order') ||
    lower.includes('opening') ||
    lower.includes('adjourn') ||
    lower.includes('closing') ||
    lower.includes('welcome') ||
    lower.includes('introduction') ||
    lower.includes('announcement') ||
    lower.includes('roll call') ||
    lower.includes('quorum')
  ) {
    return 'information';
  }

  // Default to discussion
  return 'discussion';
}

/**
 * Get default duration based on item type
 */
function getDefaultDuration(type: ParsedAgendaItem['itemType']): number {
  switch (type) {
    case 'decision':
      return 20;
    case 'committee_report':
      return 15;
    case 'information':
      return 10;
    case 'discussion':
      return 15;
    default:
      return 15;
  }
}

/**
 * Normalize text by adding line breaks before numbered items
 * Fixes concatenated text from DOCX extraction
 */
function normalizeText(text: string): string {
  let normalized = text;
  
  // Add line breaks before main numbered items (1., 2., 3.)
  normalized = normalized.replace(/(\d+)\.\s+([A-Z])/g, '\n$1. $2');
  
  // Add line breaks before decimal numbered items (1.1., 1.2., 2.1.)
  normalized = normalized.replace(/(\d+\.\d+)\.\s+([A-Z])/g, '\n$1. $2');
  
  // Add line breaks before deeper nested items (1.1.1., 1.1.2.)
  normalized = normalized.replace(/(\d+\.\d+\.\d+)\.\s+([A-Z])/g, '\n$1. $2');
  
  // Clean up multiple consecutive line breaks
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  return normalized.trim();
}

/**
 * Parse a hierarchical number (e.g., "1.2.3") into its components
 * Returns: { full: "1.2.3", parts: [1, 2, 3], level: 2, parent: "1.2" }
 */
function parseHierarchicalNumber(numStr: string): {
  full: string;
  parts: number[];
  level: number;
  parent: string | null;
} {
  const parts = numStr.split('.').filter(p => p).map(p => parseInt(p, 10));
  const level = parts.length - 1; // 0 for root, 1 for first level child, etc.
  
  let parent: string | null = null;
  if (parts.length > 1) {
    parent = parts.slice(0, -1).join('.');
  }
  
  return { full: numStr, parts, level, parent };
}

/**
 * Parse extracted text into agenda items using pattern matching
 * Supports hierarchical structures with decimal numbering (1.1, 1.2, 2.1)
 */
function parseTextToAgendaItems(text: string): ParsedAgendaItem[] {
  console.log('📄 Extracted text preview:', text.substring(0, 500));
  
  const items: ParsedAgendaItem[] = [];
  const lines = text.split('\n');
  const seenTitles = new Set<string>();
  
  // Map to track items by their number for parent lookup
  const itemsByNumber = new Map<string, number>(); // number -> orderIndex
  
  let orderIndex = 0;
  
  console.log('📊 Total lines:', lines.length);
  
  // Patterns for different numbering formats
  // Match: 1.2.3. Title or 1.2. Title or 1. Title
  const hierarchicalPattern = /^\s*((?:\d+\.)+)\s+(.+)$/;
  
  // Match: 1) Title or 2) Title (parentheses style)
  const parenthesesPattern = /^\s*(\d+)\)\s+(.+)$/;
  
  // Match: • Title or - Title (bullets for sub-items)
  const bulletPattern = /^\s*([•●○◦\-*])\s+(.+)$/;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty or very short lines
    if (trimmedLine.length < 3) continue;
    
    let match;
    let title = '';
    let numberInfo: ReturnType<typeof parseHierarchicalNumber> | null = null;
    
    // Try hierarchical numbering first (1., 1.1., 1.2.3.)
    if ((match = trimmedLine.match(hierarchicalPattern))) {
      const numberStr = match[1].replace(/\.$/, ''); // Remove trailing dot
      title = cleanTitle(match[2]);
      numberInfo = parseHierarchicalNumber(numberStr);
      
      console.log(`✅ Found ${numberInfo.level === 0 ? 'main' : 'sub'} item [${numberInfo.full}]:`, title);
    }
    // Try parentheses style (1), 2))
    else if ((match = trimmedLine.match(parenthesesPattern))) {
      const numberStr = match[1];
      title = cleanTitle(match[2]);
      numberInfo = parseHierarchicalNumber(numberStr);
      
      console.log(`✅ Found numbered item [${numberInfo.full}]:`, title);
    }
    // Try bullets (for sub-items without numbers)
    else if ((match = trimmedLine.match(bulletPattern))) {
      title = cleanTitle(match[2]);
      // Bullets are treated as level 1 sub-items
      // We'll skip these for now as they need a parent context
      console.log('⚠️ Found bullet item (skipping - needs parent context):', title);
      continue;
    }
    else {
      // Not a recognized format
      continue;
    }
    
    // Filter out noise
    if (title.length < 3 || title.length > 200) {
      console.log('❌ Filtered (length):', title, 'Length:', title.length);
      continue;
    }
    
    if (seenTitles.has(title.toLowerCase())) {
      console.log('❌ Filtered (duplicate):', title);
      continue;
    }
    
    seenTitles.add(title.toLowerCase());
    const itemType = guessItemType(title);
    
    // Create the item
    const item: ParsedAgendaItem = {
      title,
      description: '',
      itemType,
      estimatedDuration: getDefaultDuration(itemType),
      orderIndex: orderIndex,
      level: numberInfo.level,
    };
    
    // Set parent relationship if this is a sub-item
    if (numberInfo.parent && itemsByNumber.has(numberInfo.parent)) {
      item.parentOrderIndex = itemsByNumber.get(numberInfo.parent);
      console.log(`  └─ Parent: ${numberInfo.parent} (orderIndex: ${item.parentOrderIndex})`);
    }
    
    // Track this item by its number for future parent lookups
    itemsByNumber.set(numberInfo.full, orderIndex);
    
    items.push(item);
    orderIndex++;
  }
  
  console.log('🎯 Total items found:', items.length);
  console.log('📋 Items structure:');
  items.forEach(item => {
    const indent = '  '.repeat(item.level || 0);
    const parentInfo = item.parentOrderIndex !== undefined ? ` (parent: ${item.parentOrderIndex})` : '';
    console.log(`${indent}${item.level === 0 ? '→' : '○'} ${item.title}${parentInfo}`);
  });
  
  return items;
}

/**
 * Main function: Parse document file to agenda items
 * @param file - The uploaded file (PDF, DOCX, or TXT)
 * @returns ParseResult with extracted items and raw text
 */
export async function parseDocumentToAgendaItems(file: File): Promise<ParseResult> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  let text: string;

  switch (extension) {
    case 'pdf':
      text = await extractTextFromPdf(file);
      break;
    case 'docx':
      text = await extractTextFromDocx(file);
      break;
    case 'txt':
      text = await extractTextFromTxt(file);
      break;
    default:
      throw new Error(
        `Unsupported file format: .${extension}. Please use PDF, DOCX, or TXT.`
      );
  }

  const items = parseTextToAgendaItems(text);

  if (items.length === 0) {
    throw new Error(
      'Could not find any agenda items in the document. Please ensure items are numbered (1., 2., 3.) or bulleted (-, *).'
    );
  }

  return {
    items,
    rawText: text,
    fileName: file.name,
  };
}

/**
 * Validate if a file is a supported document type
 */
export function isValidDocumentType(file: File): boolean {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_DOCUMENT_TYPES.includes(extension);
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsText(): string {
  return 'PDF, Word (.docx), or Text files';
}
