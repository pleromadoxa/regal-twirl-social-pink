
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const BIBLE_BOOKS = [
  // Old Testament
  { name: 'Genesis', code: 'GEN' },
  { name: 'Exodus', code: 'EXO' },
  { name: 'Leviticus', code: 'LEV' },
  { name: 'Numbers', code: 'NUM' },
  { name: 'Deuteronomy', code: 'DEU' },
  { name: 'Joshua', code: 'JOS' },
  { name: 'Judges', code: 'JDG' },
  { name: 'Ruth', code: 'RUT' },
  { name: '1 Samuel', code: '1SA' },
  { name: '2 Samuel', code: '2SA' },
  { name: '1 Kings', code: '1KI' },
  { name: '2 Kings', code: '2KI' },
  { name: '1 Chronicles', code: '1CH' },
  { name: '2 Chronicles', code: '2CH' },
  { name: 'Ezra', code: 'EZR' },
  { name: 'Nehemiah', code: 'NEH' },
  { name: 'Esther', code: 'EST' },
  { name: 'Job', code: 'JOB' },
  { name: 'Psalms', code: 'PSA' },
  { name: 'Proverbs', code: 'PRO' },
  { name: 'Ecclesiastes', code: 'ECC' },
  { name: 'Song of Solomon', code: 'SNG' },
  { name: 'Isaiah', code: 'ISA' },
  { name: 'Jeremiah', code: 'JER' },
  { name: 'Lamentations', code: 'LAM' },
  { name: 'Ezekiel', code: 'EZK' },
  { name: 'Daniel', code: 'DAN' },
  { name: 'Hosea', code: 'HOS' },
  { name: 'Joel', code: 'JOL' },
  { name: 'Amos', code: 'AMO' },
  { name: 'Obadiah', code: 'OBA' },
  { name: 'Jonah', code: 'JON' },
  { name: 'Micah', code: 'MIC' },
  { name: 'Nahum', code: 'NAM' },
  { name: 'Habakkuk', code: 'HAB' },
  { name: 'Zephaniah', code: 'ZEP' },
  { name: 'Haggai', code: 'HAG' },
  { name: 'Zechariah', code: 'ZEC' },
  { name: 'Malachi', code: 'MAL' },
  
  // New Testament
  { name: 'Matthew', code: 'MAT' },
  { name: 'Mark', code: 'MRK' },
  { name: 'Luke', code: 'LUK' },
  { name: 'John', code: 'JHN' },
  { name: 'Acts', code: 'ACT' },
  { name: 'Romans', code: 'ROM' },
  { name: '1 Corinthians', code: '1CO' },
  { name: '2 Corinthians', code: '2CO' },
  { name: 'Galatians', code: 'GAL' },
  { name: 'Ephesians', code: 'EPH' },
  { name: 'Philippians', code: 'PHP' },
  { name: 'Colossians', code: 'COL' },
  { name: '1 Thessalonians', code: '1TH' },
  { name: '2 Thessalonians', code: '2TH' },
  { name: '1 Timothy', code: '1TI' },
  { name: '2 Timothy', code: '2TI' },
  { name: 'Titus', code: 'TIT' },
  { name: 'Philemon', code: 'PHM' },
  { name: 'Hebrews', code: 'HEB' },
  { name: 'James', code: 'JAS' },
  { name: '1 Peter', code: '1PE' },
  { name: '2 Peter', code: '2PE' },
  { name: '1 John', code: '1JN' },
  { name: '2 John', code: '2JN' },
  { name: '3 John', code: '3JN' },
  { name: 'Jude', code: 'JUD' },
  { name: 'Revelation', code: 'REV' }
];

const BibleVersePicker = ({ onVerseSelect }: BibleVersePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [chapter, setChapter] = useState('');
  const [verse, setVerse] = useState('');
  const [verses, setVerses] = useState<BibleVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<BibleVerse | null>(null);
  
  const { toast } = useToast();

  const handleRandomVerse = async () => {
    setLoading(true);
    try {
      const randomVerse = await fetchRandomVerse();
      if (randomVerse) {
        setSelectedVerse(randomVerse);
        setVerses([randomVerse]);
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

  const handleBookSelection = async () => {
    if (!selectedBook) return;
    
    setLoading(true);
    try {
      // Construct verse reference
      let reference = selectedBook;
      if (chapter) {
        reference += `.${chapter}`;
        if (verse) {
          reference += `.${verse}`;
        } else {
          // If only chapter is provided, get the first verse
          reference += `.1`;
        }
      } else {
        // If no chapter, get first verse of first chapter
        reference += `.1.1`;
      }
      
      const fetchedVerse = await fetchVerse(reference);
      if (fetchedVerse) {
        setVerses([fetchedVerse]);
        setSelectedVerse(fetchedVerse);
      } else {
        toast({
          title: "Verse not found",
          description: "Please check the book, chapter, and verse numbers",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch verse",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerseSelect = (verseToSelect: BibleVerse) => {
    const formattedVerse = `"${verseToSelect.text}"\n\n- ${verseToSelect.reference} (${verseToSelect.translation})`;
    onVerseSelect(formattedVerse);
    setIsOpen(false);
    toast({
      description: "Bible verse added to your post!",
      duration: 2000,
    });
  };

  const copyToClipboard = (verseToCopy: BibleVerse) => {
    const formattedVerse = `"${verseToCopy.text}"\n\n- ${verseToCopy.reference} (${verseToCopy.translation})`;
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
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
              placeholder="Search by topic (love, hope, faith, peace...)"
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

          {/* Book Selection */}
          <div className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Browse by Book</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger>
                  <SelectValue placeholder="Select book" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {BIBLE_BOOKS.map((book) => (
                    <SelectItem key={book.code} value={book.code}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                placeholder="Chapter (optional)"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                type="number"
                min="1"
              />
              
              <Input
                placeholder="Verse (optional)"
                value={verse}
                onChange={(e) => setVerse(e.target.value)}
                type="number"
                min="1"
              />
              
              <Button 
                onClick={handleBookSelection} 
                disabled={!selectedBook || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Get Verse
              </Button>
            </div>
          </div>

          {/* Verses List */}
          <ScrollArea className="h-[400px] border rounded-lg p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : verses.length > 0 ? (
              <div className="space-y-4">
                {verses.map((verseItem, index) => (
                  <div 
                    key={index}
                    className="p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => setSelectedVerse(verseItem)}
                  >
                    <p className="text-slate-700 dark:text-slate-300 italic mb-2">
                      "{verseItem.text}"
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        - {verseItem.reference} ({verseItem.translation})
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(verseItem);
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerseSelect(verseItem);
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
                <p>Search for verses by topic, select a book, or click Random</p>
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
