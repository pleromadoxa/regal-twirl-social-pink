import { Link } from 'react-router-dom';

/**
 * Parse text content to detect and format mentions (@username) and hashtags (#tag)
 */
export const parseTextWithMentionsAndHashtags = (text: string) => {
  const parts: Array<{ type: 'text' | 'mention' | 'hashtag'; content: string }> = [];
  
  // Regex to match @mentions and #hashtags
  const regex = /(@[\w]+)|(#[\w]+)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.substring(lastIndex, match.index)
      });
    }

    // Add mention or hashtag
    if (match[1]) {
      // Mention
      parts.push({
        type: 'mention',
        content: match[1]
      });
    } else if (match[2]) {
      // Hashtag
      parts.push({
        type: 'hashtag',
        content: match[2]
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.substring(lastIndex)
    });
  }

  return parts;
};

/**
 * Extract all mentions from text
 */
export const extractMentions = (text: string): string[] => {
  const mentions = text.match(/@[\w]+/g);
  return mentions ? mentions.map(m => m.substring(1)) : [];
};

/**
 * Extract all hashtags from text
 */
export const extractHashtags = (text: string): string[] => {
  const hashtags = text.match(/#[\w]+/g);
  return hashtags ? hashtags.map(h => h.substring(1)) : [];
};
