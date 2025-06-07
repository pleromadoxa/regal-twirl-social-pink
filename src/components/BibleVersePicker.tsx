
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Book, Search, Shuffle, Copy } from 'lucide-react';
import { fetchRandomVerse, searchVerses, fetchVerse } from '@/services/bibleService';
import { useToast } from '@/hooks/use-toast';

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

interface BibleVersePickerProps {
  onVerseSelect: (verse: string) => void;
}

const BibleVersePicker = ({ onVerseSelect }: BibleVersePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  
  const { toast } = useToast();

  const handleRandomVerse = async () => {
    setLoading(true);
    try {
      const verse = await fetchRandomVerse();
      if (verse) {
        setSelectedVerse(verse);
        setVerses([verse]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch random verse",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const searchResults = await searchVerses(searchQuery);
      setVerses(searchResults);
      if (searchResults.length === 0) {
        toast({
          title: "No results",
          description: "Try searching for topics like 'love', 'hope', 'faith', 'peace', 'strength', or 'wisdom'",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search verses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerseSelect = (verse: BibleVerse) => {
    const formattedVerse = `"${verse.text}"\n\n- ${verse.reference} (${verse.translation})`;
    onVerseSelect(formattedVerse);
    setIsOpen(false);
    toast({
      description: "Bible verse added to your post!",
      duration: 2000,
    });
  };

  const copyToClipboard = (verse: BibleVerse) => {
    const formattedVerse = `"${verse.text}"\n\n- ${verse.reference} (${verse.translation})`;
    navigator.clipboard.writeText(formattedVerse);
    toast({
      description: "Verse copied to clipboard!",
      duration: 2000,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          type="button"
          variant="ghost" 
          size="sm"
          className="text-purple-500 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-2 transition-all duration-300 hover:scale-125 hover:rotate-12 rounded-full"
        >
          <Book className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Book className="w-5 h-5 text-purple-600" />
            Add Bible Verse
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search and Random Controls */}
          <div className="flex gap-2">
            <Input
              placeholder="Search by topic (love, hope, faith, peace, strength, wisdom...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={handleRandomVerse} disabled={loading}>
              <Shuffle className="w-4 h-4" />
              Random
            </Button>
          </div>

          {/* Verses List */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : verses.length > 0 ? (
              <div className="space-y-4">
                {verses.map((verse, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedVerse(verse)}
                  >
                    <p className="text-slate-700 dark:text-slate-300 italic mb-2">
                      "{verse.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        - {verse.reference} ({verse.translation})
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(verse);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerseSelect(verse);
                          }}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          Add to Post
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Book className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Search for verses by topic or click Random to get started</p>
                <p className="text-sm mt-2">Try: love, hope, faith, peace, strength, wisdom</p>
              </div>
            )}
          </ScrollArea>

          {/* Selected Verse Preview */}
          {selectedVerse && (
            <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-800/30 dark:to-blue-800/30 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Selected verse:</p>
              <p className="italic text-slate-700 dark:text-slate-300 mb-2">
                "{selectedVerse.text}"
              </p>
              <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                - {selectedVerse.reference} ({selectedVerse.translation})
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BibleVersePicker;
