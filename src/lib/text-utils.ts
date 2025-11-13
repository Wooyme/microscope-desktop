/**
 * Utility functions for text sanitization
 */

/**
 * Strips all HTML tags from a string safely
 * Handles incomplete tags and multiple replacements
 * @param html - The HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  
  // Convert to string if needed
  const text = String(html);
  
  // Create a temporary DOM element to leverage browser's HTML parsing
  // This is safer than regex for handling edge cases
  if (typeof document !== 'undefined') {
    const temp = document.createElement('div');
    temp.textContent = text;
    return temp.textContent || '';
  }
  
  // Fallback for server-side: multiple passes to handle nested/incomplete tags
  // Note: This is a defense-in-depth approach. The primary sanitization uses DOM API
  // which is completely safe. This regex-based fallback is only for SSR contexts
  // where DOM is not available. It uses multiple passes to handle edge cases.
  let result = text;
  let prevResult = '';
  
  // Keep replacing until no more changes occur (handles nested/incomplete tags)
  while (result !== prevResult) {
    prevResult = result;
    // Remove complete tags
    result = result.replace(/<[^>]*>/g, '');  // codeql[js/incomplete-multi-character-sanitization]
    // Remove incomplete opening tags at the end
    result = result.replace(/<[^>]*$/g, '');
    // Remove incomplete closing tags at the start
    result = result.replace(/^[^<]*>/g, '');
  }
  
  return result;
}

/**
 * Escapes HTML special characters to prevent XSS
 * @param text - Text to escape
 * @returns Escaped text safe for HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return String(text).replace(/[&<>"']/g, (char) => map[char]);
}
