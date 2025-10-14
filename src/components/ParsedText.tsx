import { Link } from 'react-router-dom';
import { parseTextWithMentionsAndHashtags } from '@/utils/textParsing';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ParsedTextProps {
  text: string;
  className?: string;
}

const ParsedText = ({ text, className = '' }: ParsedTextProps) => {
  const parts = parseTextWithMentionsAndHashtags(text);
  const [userIdMap, setUserIdMap] = useState<Record<string, string>>({});

  useEffect(() => {
    // Extract all unique mentioned usernames
    const mentionedUsernames = parts
      .filter(part => part.type === 'mention')
      .map(part => part.content.substring(1));

    if (mentionedUsernames.length === 0) return;

    // Fetch user IDs for all mentioned usernames
    const fetchUserIds = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, username')
        .in('username', mentionedUsernames);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach(profile => {
          if (profile.username) {
            map[profile.username] = profile.id;
          }
        });
        setUserIdMap(map);
      }
    };

    fetchUserIds();
  }, [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention') {
          const username = part.content.substring(1);
          const userId = userIdMap[username];
          
          // If we have the user ID, link to their profile, otherwise just display the mention
          if (userId) {
            return (
              <Link
                key={index}
                to={`/profile/${userId}`}
                className="text-primary hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {part.content}
              </Link>
            );
          } else {
            return (
              <span key={index} className="text-primary font-medium">
                {part.content}
              </span>
            );
          }
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
