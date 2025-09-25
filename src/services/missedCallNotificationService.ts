import { supabase } from '@/integrations/supabase/client';

interface MissedCallData {
  callId: string;
  callerId: string;
  receiverId: string;
  callType: 'audio' | 'video';
  duration?: number;
  conversationId?: string;
}

export const createMissedCallNotification = async (data: MissedCallData) => {
  try {
    console.log('[MissedCallService] Creating missed call notification:', data);

    // Get caller profile
    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('display_name, username')
      .eq('id', data.callerId)
      .single();

    const callerName = callerProfile?.display_name || callerProfile?.username || 'Unknown User';

    // Find or create conversation
    let conversationId = data.conversationId;
    
    if (!conversationId) {
      // Try to find existing conversation
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${data.callerId},participant_2.eq.${data.receiverId}),and(participant_1.eq.${data.receiverId},participant_2.eq.${data.callerId})`)
        .single();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            participant_1: data.callerId,
            participant_2: data.receiverId,
            last_message_at: new Date().toISOString()
          })
          .select('id')
          .single();

        conversationId = newConv?.id;
      }
    }

    if (!conversationId) {
      console.error('[MissedCallService] Could not find or create conversation');
      return;
    }

    // Create missed call message
    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: data.callerId,
        recipient_id: data.receiverId,
        content: `Missed ${data.callType} call from ${callerName}`,
        message_type: 'missed_call',
        metadata: {
          call_id: data.callId,
          call_type: data.callType,
          duration: data.duration,
          missed_at: new Date().toISOString()
        }
      });

    if (error) {
      console.error('[MissedCallService] Error creating missed call message:', error);
      return;
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('[MissedCallService] Missed call notification created successfully');
    
  } catch (error) {
    console.error('[MissedCallService] Error creating missed call notification:', error);
  }
};