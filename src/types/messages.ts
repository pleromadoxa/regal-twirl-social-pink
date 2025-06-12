
export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at?: string;
  };
  participant_1_profile?: UserProfile;
  participant_2_profile?: UserProfile;
  streak_count?: number;
  is_pinned?: boolean;
  is_archived?: boolean;
  other_user?: UserProfile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'file';
  attachments?: any[];
  reply_to?: string;
  edited_at?: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
  sender_profile?: UserProfile;
}
