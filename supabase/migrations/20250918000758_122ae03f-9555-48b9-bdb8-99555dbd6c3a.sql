-- Enable realtime for group conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE group_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE group_conversation_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;

-- Set replica identity for better real-time updates
ALTER TABLE group_conversations REPLICA IDENTITY FULL;
ALTER TABLE group_conversation_members REPLICA IDENTITY FULL;
ALTER TABLE group_messages REPLICA IDENTITY FULL;