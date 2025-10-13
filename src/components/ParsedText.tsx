import { Link } from 'react-router-dom';
import { parseTextWithMentionsAndHashtags } from '@/utils/textParsing';

interface ParsedTextProps {
  text: string;
  className?: string;
}

const ParsedText = ({ text, className = '' }: ParsedTextProps) => {
  const parts = parseTextWithMentionsAndHashtags(text);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          const username = part.content.substring(1);
          return (
            <Link
              key={index}
              to={`/profile/${username}`}
              className="text-primary hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </Link>
          );
        } else if (part.type === 'hashtag') {
          const tag = part.content.substring(1);
          return (
            <Link
              key={index}
              to={`/hashtag/${tag}`}
              className="text-blue-500 hover:underline font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {part.content}
            </Link>
          );
        } else {
          return <span key={index}>{part.content}</span>;
        }
      })}
    </span>
  );
};

export default ParsedText;
