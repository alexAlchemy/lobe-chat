/**
 * Utility functions for handling avatar values (emoji vs image URLs)
 */

/**
 * Check if a string is a URL (starts with http/https or a relative path)
 * @param str - The string to check
 * @returns true if the string appears to be a URL, false otherwise
 */
export const isImageUrl = (str: string): boolean => {
  if (!str) return false;
  
  // Check for common URL patterns
  return (
    str.startsWith('http://') ||
    str.startsWith('https://') ||
    str.startsWith('data:image/') ||
    str.startsWith('/') ||
    str.startsWith('./') ||
    str.startsWith('../') ||
    str.includes('client-s3://') ||
    str.includes('.')
  );
};

/**
 * Check if a string is an emoji (single character with emoji unicode range)
 * @param str - The string to check
 * @returns true if the string appears to be an emoji, false otherwise
 */
export const isEmoji = (str: string): boolean => {
  if (!str) return false;
  
  // Simple emoji detection - check if it's a single "character" that's not a URL
  if (isImageUrl(str)) return false;
  
  // Check if it's a single grapheme cluster (including complex emojis)
  const segments = [...new Intl.Segmenter().segment(str)];
  return segments.length === 1;
};

/**
 * Get avatar type from a string value
 * @param value - The avatar value to analyze
 * @returns 'emoji' | 'image' | 'unknown'
 */
export const getAvatarType = (value: string): 'emoji' | 'image' | 'unknown' => {
  if (!value) return 'unknown';
  
  if (isImageUrl(value)) return 'image';
  if (isEmoji(value)) return 'emoji';
  
  return 'unknown';
};