import { supabase } from '@/integrations/supabase/client';

export const forwardMessageToConversation = async (
  messageContent: string,
  senderId: string,
  targetConversationId: string
) => {
  try {
    // Get the target conversation to find the recipient
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', targetConversationId)
      .single();

    if (conversationError) throw conversationError;
    if (!conversation) throw new Error('Conversation not found');

    // Determine the recipient ID
    const recipientId = conversation.participant_1 === senderId 
      ? conversation.participant_2 
      : conversation.participant_1;

    // Send the forwarded message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: senderId,
        recipient_id: recipientId,
        content: messageContent,
        message_type: 'text'
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', targetConversationId);

    return message;
  } catch (error) {
    console.error('Error forwarding message:', error);
    throw error;
  }
};