
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Flag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ReportPostDialogProps {
  postId: string;
  trigger?: React.ReactNode;
}

const ReportPostDialog = ({ postId, trigger }: ReportPostDialogProps) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const reportReasons = [
    'Spam',
    'Harassment or bullying',
    'Hate speech',
    'Violence or threats',
    'Nudity or sexual content',
    'False information',
    'Copyright infringement',
    'Other'
  ];

  const handleSubmitReport = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report posts",
        variant: "destructive"
      });
      return;
    }

    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You must select a reason for reporting this post",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Use type assertion to work around TypeScript issues until types are regenerated
      const { error } = await (supabase as any)
        .from('post_reports')
        .insert({
          post_id: postId,
          reporter_id: user.id,
          reason: reason,
          details: details.trim() || null
        });

      if (error) {
        console.error('Error submitting report:', error);
        toast({
          title: "Error submitting report",
          description: error.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review your report."
      });

      setOpen(false);
      setReason('');
      setDetails('');
    } catch (error) {
      console.error('Error in handleSubmitReport:', error);
      toast({
        title: "Something went wrong",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Flag className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this post?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {reportReasons.map((reportReason) => (
                <div key={reportReason} className="flex items-center space-x-2">
                  <RadioGroupItem value={reportReason} id={reportReason} />
                  <Label htmlFor={reportReason} className="text-sm">
                    {reportReason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional details (optional)</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide more context about why you're reporting this post..."
              className="min-h-[80px]"
              maxLength={500}
            />
            <p className="text-xs text-slate-500">{details.length}/500 characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReport}
              disabled={loading || !reason}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportPostDialog;
