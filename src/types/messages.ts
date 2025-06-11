
export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  read_at: string | null;
  sender_profile: UserProfile | null;
}

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  last_message_at: string | null;
  participant_1_profile: UserProfile | null;
  participant_2_profile: UserProfile | null;
  profiles_participant_1: UserProfile | null;
  profiles_participant_2: UserProfile | null;
  other_user: UserProfile | null;
  last_message: Message | null;
  streak_count: number;
}
