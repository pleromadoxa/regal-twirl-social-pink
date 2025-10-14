import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCirclePolls } from '@/hooks/useCirclePolls';
import { Plus, X, BarChart3 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CirclePollsTabProps {
  circleId: string;
}

export const CirclePollsTab = ({ circleId }: CirclePollsTabProps) => {
  const { polls, loading, createPoll, vote } = useCirclePolls(circleId);
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [anonymous, setAnonymous] = useState(false);

  const handleAddOption = () => {
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) return;

    const result = await createPoll({
      question,
      options: validOptions,
      anonymous
    });

    if (result) {
      setOpen(false);
      setQuestion('');
      setOptions(['', '']);
      setAnonymous(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading polls...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Circle Polls</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Poll</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Question</Label>
                <Input
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask your question..."
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Options</Label>
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleUpdateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      required
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddOption} className="w-full">
                  Add Option
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={anonymous} onCheckedChange={setAnonymous} />
                <Label>Anonymous voting</Label>
              </div>
              <Button type="submit" className="w-full">Create Poll</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {polls.length === 0 ? (
          <Card className="p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No polls yet. Create one to gather opinions!</p>
          </Card>
        ) : (
          polls.map((poll) => {
            const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
            return (
              <Card key={poll.id} className="p-4">
                <h4 className="font-semibold mb-4">{poll.question}</h4>
                <div className="space-y-3">
                  {poll.options.map((option, index) => {
                    const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{option.text}</span>
                          <span className="text-muted-foreground">{option.votes} votes</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
                {poll.anonymous && (
                  <p className="text-xs text-muted-foreground mt-3">Anonymous poll</p>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
