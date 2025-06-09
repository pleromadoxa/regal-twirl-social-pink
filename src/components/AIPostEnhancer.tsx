
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Wand2, Loader2 } from "lucide-react";
import { useOpenRouterAI } from "@/hooks/useOpenRouterAI";
import { useToast } from "@/hooks/use-toast";

interface AIPostEnhancerProps {
  onTextGenerated: (text: string) => void;
  currentText?: string;
}

const AIPostEnhancer = ({ onTextGenerated, currentText }: AIPostEnhancerProps) => {
  const [prompt, setPrompt] = useState('');
  const [showPromptInput, setShowPromptInput] = useState(false);
  const { generateText, enhanceText, loading } = useOpenRouterAI();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for text generation",
        variant: "destructive"
      });
      return;
    }

    const generatedText = await generateText(prompt);
    if (generatedText) {
      onTextGenerated(generatedText);
      setPrompt('');
      setShowPromptInput(false);
      toast({
        title: "Text generated!",
        description: "Your AI-generated content is ready"
      });
    }
  };

  const handleEnhance = async () => {
    if (!currentText?.trim()) {
      toast({
        title: "No text to enhance",
        description: "Please write some content first",
        variant: "destructive"
      });
      return;
    }

    const enhancedText = await enhanceText(currentText);
    if (enhancedText) {
      onTextGenerated(enhancedText);
      toast({
        title: "Text enhanced!",
        description: "Your content has been improved"
      });
    }
  };

  return (
    <div className="space-y-3">
      {showPromptInput && (
        <div className="flex gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
          <Input
            placeholder="Describe what you want to post about..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </Button>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowPromptInput(!showPromptInput)}
          className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI Generate
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleEnhance}
          disabled={loading || !currentText?.trim()}
          className="text-purple-600 border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wand2 className="w-4 h-4 mr-2" />
          )}
          Enhance
        </Button>
      </div>
    </div>
  );
};

export default AIPostEnhancer;
