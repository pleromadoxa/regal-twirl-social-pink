
export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  created_at: string;
  read_at?: string;
  edited_at?: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  metadata?: any;
  conversation_id: string;
  sender_profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  last_message_at: string;
  streak_count?: number;
  participant_1_profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
  participant_2_profile?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string;
  } | null;
  last_message?: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
    read_at?: string;
  } | null;
}
