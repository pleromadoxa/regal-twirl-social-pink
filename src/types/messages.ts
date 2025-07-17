
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
  created_at: string;
  read_at?: string;
  edited_at?: string;
  metadata?: any;
  conversation_id?: string;
  attachments?: any[];
  profiles?: any;
  sender_profile?: any;
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string | null;
  created_at: string;
  streak_count: number;
  participant_1_profile?: Profile;
  participant_2_profile?: Profile;
  last_message?: string;
}
