import { supabase } from '@/integrations/supabase/client';
import { subscriptionManager } from '@/utils/subscriptionManager';

interface CallParticipant {
  id: string;
  name: string;
  avatar?: string;
  status: 'connected' | 'connecting' | 'disconnected';
  joinedAt?: string;
}

interface EnhancedCall {
  id: string;
  roomId: string;
  callType: 'audio' | 'video' | 'group';
  status: 'initiating' | 'ringing' | 'active' | 'ended';
  participants: CallParticipant[];
  startedAt: string;
  endedAt?: string;
  callerId: string;
}

class EnhancedCallService {
  private activeCall: EnhancedCall | null = null;
  private callUnsubscribe: (() => void) | null = null;

  /**
   * Start a new call and set up real-time management
   */
  async startCall(
    callType: 'audio' | 'video' | 'group',
    callerId: string,
    participants: string[],
    callerProfile: { display_name?: string; username?: string; avatar_url?: string }
  ): Promise<EnhancedCall> {
    try {
      // Create call in database
      const roomId = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('active_calls')
        .insert({
          caller_id: callerId,
          call_type: callType,
          participants: [callerId, ...participants],
          room_id: roomId,
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      // Create enhanced call object
      this.activeCall = {
        id: data.id,
        roomId: data.room_id,
        callType: callType as 'audio' | 'video' | 'group',
        status: 'initiating',
        participants: [
          {
            id: callerId,
            name: callerProfile.display_name || callerProfile.username || 'You',
            avatar: callerProfile.avatar_url,
            status: 'connected',
            joinedAt: new Date().toISOString()
          }
        ],
        startedAt: data.created_at,
        callerId
      };

      // Set up real-time call management
      this.setupCallManagement();

      return this.activeCall;
    } catch (error) {
      console.error('Error starting enhanced call:', error);
      throw error;
    }
  }

  /**
   * Join an existing call
   */
  async joinCall(
    callId: string,
    userId: string,
    userProfile: { display_name?: string; username?: string; avatar_url?: string }
  ): Promise<void> {
    try {
      // Update database
      const { data: currentCall, error: fetchError } = await supabase
        .from('active_calls')
        .select('participants, room_id, call_type, caller_id, created_at')
        .eq('id', callId)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!currentCall) throw new Error('Call not found');

      const currentParticipants = Array.isArray(currentCall.participants) 
        ? currentCall.participants 
        : JSON.parse(currentCall.participants as string);

      const updatedParticipants = currentParticipants.includes(userId) 
        ? currentParticipants 
        : [...currentParticipants, userId];

      const { error } = await supabase
        .from('active_calls')
        .update({ participants: updatedParticipants })
        .eq('id', callId);

      if (error) throw error;

      // Update local call state
      if (this.activeCall) {
        this.activeCall.participants.push({
          id: userId,
          name: userProfile.display_name || userProfile.username || 'User',
          avatar: userProfile.avatar_url,
          status: 'connected',
          joinedAt: new Date().toISOString()
        });
      } else {
        // Create call object if joining existing call
        this.activeCall = {
          id: callId,
          roomId: currentCall.room_id,
          callType: currentCall.call_type as 'audio' | 'video' | 'group',
          status: 'active',
          participants: [
            {
              id: userId,
              name: userProfile.display_name || userProfile.username || 'You',
              avatar: userProfile.avatar_url,
              status: 'connected',
              joinedAt: new Date().toISOString()
            }
          ],
          startedAt: currentCall.created_at,
          callerId: currentCall.caller_id
        };
      }

      // Set up call management if not already done
      if (!this.callUnsubscribe) {
        this.setupCallManagement();
      }

      // Broadcast join event
      await this.broadcastCallEvent('participant-joined', {
        participantId: userId,
        participantName: userProfile.display_name || userProfile.username || 'User'
      });

    } catch (error) {
      console.error('Error joining enhanced call:', error);
      throw error;
    }
  }

  /**
   * End the current call
   */
  async endCall(userId: string, userName?: string): Promise<void> {
    if (!this.activeCall) return;

    try {
      // Update database
      await supabase
        .from('active_calls')
        .update({
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', this.activeCall.id);

      // Broadcast end event
      await this.broadcastCallEvent('call-ended', {
        ended_by: userId,
        ended_by_name: userName || 'User'
      });

      // Clean up
      this.cleanup();
    } catch (error) {
      console.error('Error ending enhanced call:', error);
      throw error;
    }
  }

  /**
   * Update participant status (connected, disconnected, etc.)
   */
  updateParticipantStatus(participantId: string, status: 'connected' | 'connecting' | 'disconnected'): void {
    if (!this.activeCall) return;

    const participant = this.activeCall.participants.find(p => p.id === participantId);
    if (participant) {
      participant.status = status;
    }
  }

  /**
   * Get current call information
   */
  getCurrentCall(): EnhancedCall | null {
    return this.activeCall;
  }

  /**
   * Set up real-time call management
   */
  private setupCallManagement(): void {
    if (!this.activeCall || this.callUnsubscribe) return;

    const channelName = `enhanced-call-${this.activeCall.id}`;
    
    this.callUnsubscribe = subscriptionManager.subscribe(channelName, {
      broadcast: [
        {
          event: 'participant-joined',
          callback: (payload: any) => {
            console.log('[EnhancedCallService] Participant joined:', payload.payload);
            // Handle participant joining
          }
        },
        {
          event: 'participant-left', 
          callback: (payload: any) => {
            console.log('[EnhancedCallService] Participant left:', payload.payload);
            // Handle participant leaving
          }
        },
        {
          event: 'call-ended',
          callback: (payload: any) => {
            console.log('[EnhancedCallService] Call ended:', payload.payload);
            this.cleanup();
          }
        }
      ]
    });
  }

  /**
   * Broadcast call events to all participants
   */
  private async broadcastCallEvent(event: string, payload: any): Promise<void> {
    if (!this.activeCall) return;

    const channelName = `enhanced-call-${this.activeCall.id}`;
    const channel = supabase.channel(`broadcast-${Date.now()}`);
    
    await channel.send({
      type: 'broadcast',
      event,
      payload
    });
  }

  /**
   * Clean up call resources
   */
  private cleanup(): void {
    if (this.callUnsubscribe) {
      this.callUnsubscribe();
      this.callUnsubscribe = null;
    }
    
    if (this.activeCall) {
      this.activeCall.status = 'ended';
      this.activeCall.endedAt = new Date().toISOString();
    }
    
    this.activeCall = null;
  }

  /**
   * Get call statistics
   */
  getCallStats(): { duration: number; participantCount: number } | null {
    if (!this.activeCall) return null;

    const startTime = new Date(this.activeCall.startedAt).getTime();
    const endTime = this.activeCall.endedAt 
      ? new Date(this.activeCall.endedAt).getTime()
      : Date.now();

    return {
      duration: Math.floor((endTime - startTime) / 1000), // in seconds
      participantCount: this.activeCall.participants.length
    };
  }
}

// Export singleton instance
export const enhancedCallService = new EnhancedCallService();
export type { EnhancedCall, CallParticipant };