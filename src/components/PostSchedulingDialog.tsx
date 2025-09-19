import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { 
  Clock, 
  Calendar as CalendarIcon, 
  Send, 
  Globe, 
  Users, 
  Lock,
  Image,
  Video,
  Hash,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface PostSchedulingDialogProps {
  onSchedulePost?: (postData: any) => void;
}

const PostSchedulingDialog = ({ onSchedulePost }: PostSchedulingDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [currentMention, setCurrentMention] = useState('');

  const { toast } = useToast();

  const addHashtag = () => {
    if (currentHashtag.trim() && !hashtags.includes(currentHashtag.trim())) {
      setHashtags(prev => [...prev, currentHashtag.trim()]);
      setCurrentHashtag('');
    }
  };

  const addMention = () => {
    const mention = currentMention.trim().replace('@', '');
    if (mention && !mentions.includes(mention)) {
      setMentions(prev => [...prev, mention]);
      setCurrentMention('');
    }
  };

  const removeHashtag = (hashtag: string) => {
    setHashtags(prev => prev.filter(h => h !== hashtag));
  };

  const removeMention = (mention: string) => {
    setMentions(prev => prev.filter(m => m !== mention));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const schedulePost = () => {
    if (!postContent.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your post",
        variant: "destructive"
      });
      return;
    }

    if (!scheduledDate || !scheduledTime) {
      toast({
        title: "Schedule required",
        description: "Please select date and time for scheduling",
        variant: "destructive"
      });
      return;
    }

    const scheduleDateTime = new Date(scheduledDate);
    const [hours, minutes] = scheduledTime.split(':');
    scheduleDateTime.setHours(parseInt(hours), parseInt(minutes));

    if (scheduleDateTime <= new Date()) {
      toast({
        title: "Invalid time",
        description: "Please select a future date and time",
        variant: "destructive"
      });
      return;
    }

    const postData = {
      content: postContent,
      scheduledFor: scheduleDateTime.toISOString(),
      visibility,
      attachments: attachments.map(file => file.name),
      hashtags,
      mentions,
      createdAt: new Date().toISOString()
    };

    if (onSchedulePost) {
      onSchedulePost(postData);
    }

    toast({
      title: "Post scheduled",
      description: `Your post will be published on ${format(scheduleDateTime, 'PPP')} at ${scheduledTime}`,
    });

    // Reset form
    setPostContent('');
    setScheduledDate(undefined);
    setScheduledTime('');
    setVisibility('public');
    setAttachments([]);
    setHashtags([]);
    setMentions([]);
    setIsOpen(false);
  };

  const getVisibilityIcon = () => {
    switch (visibility) {
      case 'public': return <Globe className="w-4 h-4" />;
      case 'followers': return <Users className="w-4 h-4" />;
      case 'private': return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'followers': return 'Followers only';
      case 'private': return 'Private';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Clock className="w-4 h-4" />
          Schedule Post
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Schedule Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Post Content */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Post Content</label>
            <Textarea
              placeholder="What's happening?"
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground text-right">
              {postContent.length}/280
            </div>
          </div>

          {/* Hashtags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hashtags</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Add hashtag"
                  value={currentHashtag}
                  onChange={(e) => setCurrentHashtag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addHashtag()}
                />
              </div>
              <Button size="sm" onClick={addHashtag}>Add</Button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((hashtag) => (
                  <Badge
                    key={hashtag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeHashtag(hashtag)}
                  >
                    #{hashtag} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Mentions */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mentions</label>
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Add mention"
                  value={currentMention}
                  onChange={(e) => setCurrentMention(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMention()}
                />
              </div>
              <Button size="sm" onClick={addMention}>Add</Button>
            </div>
            {mentions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {mentions.map((mention) => (
                  <Badge
                    key={mention}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeMention(mention)}
                  >
                    @{mention} ×
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Attachments</label>
            <div className="border-2 border-dashed border-muted rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <div className="flex gap-2">
                  <Image className="w-5 h-5" />
                  <Video className="w-5 h-5" />
                </div>
                <p className="text-sm">Click to upload images or videos</p>
              </label>
            </div>
            
            {attachments.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="relative bg-muted rounded-lg p-2 flex items-center gap-2"
                  >
                    <div className="flex-1 truncate text-sm">{file.name}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4" />
                Schedule Date
              </label>
              <Calendar
                mode="single"
                selected={scheduledDate}
                onSelect={setScheduledDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>

            {/* Time and Settings */}
            <div className="space-y-4">
              {/* Time Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Visibility</label>
                <div className="space-y-2">
                  {(['public', 'followers', 'private'] as const).map((option) => (
                    <label key={option} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="visibility"
                        value={option}
                        checked={visibility === option}
                        onChange={(e) => setVisibility(e.target.value as any)}
                      />
                      <div className="flex items-center gap-2">
                        {option === 'public' && <Globe className="w-4 h-4" />}
                        {option === 'followers' && <Users className="w-4 h-4" />}
                        {option === 'private' && <Lock className="w-4 h-4" />}
                        <span className="capitalize">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {scheduledDate && scheduledTime && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Scheduled for:</p>
                  <p className="text-sm text-muted-foreground">
                    {format(scheduledDate, 'PPP')} at {scheduledTime}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {getVisibilityIcon()}
                    <span className="text-xs">{getVisibilityLabel()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={schedulePost} className="flex-1 gap-2">
              <Send className="w-4 h-4" />
              Schedule Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostSchedulingDialog;