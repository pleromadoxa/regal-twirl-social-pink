
import { supabase } from '@/integrations/supabase/client';

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  attachment_type: 'image' | 'video' | 'audio' | 'document';
  created_at: string;
}

export const uploadMessageAttachment = async (
  file: File,
  userId: string,
  attachmentType: 'image' | 'video' | 'audio' | 'document'
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('message-attachments')
    .upload(fileName, file);

  if (error) {
    console.error('Error uploading file:', error);
    throw error;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('message-attachments')
    .getPublicUrl(data.path);

  return publicUrl;
};

export const createMessageAttachment = async (
  messageId: string,
  fileName: string,
  fileType: string,
  fileSize: number,
  fileUrl: string,
  attachmentType: 'image' | 'video' | 'audio' | 'document'
): Promise<MessageAttachment> => {
  const { data, error } = await supabase
    .from('message_attachments')
    .insert({
      message_id: messageId,
      file_name: fileName,
      file_type: fileType,
      file_size: fileSize,
      file_url: fileUrl,
      attachment_type: attachmentType
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating attachment:', error);
    throw error;
  }

  return data;
};

export const getMessageAttachments = async (messageId: string): Promise<MessageAttachment[]> => {
  const { data, error } = await supabase
    .from('message_attachments')
    .select('*')
    .eq('message_id', messageId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching attachments:', error);
    throw error;
  }

  return data || [];
};
