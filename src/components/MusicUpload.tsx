
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Upload, Music, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MusicUploadProps {
  onUploadComplete?: () => void;
}

const MusicUpload = ({ onUploadComplete }: MusicUploadProps) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [trackType, setTrackType] = useState('featured');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'audio/mpeg' && file.type !== 'audio/mp3') {
        toast({
          title: "Invalid file type",
          description: "Please upload an MP3 file",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }
      
      setAudioFile(file);
      
      // Auto-fill title from filename if empty
      if (!title) {
        const filename = file.name.replace(/\.[^/.]+$/, "");
        setTitle(filename);
      }
    }
  };

  const getDurationFromFile = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => {
        resolve(0);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleUpload = async () => {
    if (!audioFile || !title || !artist || !user) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, artist, and select an audio file",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Get duration from file
      const duration = await getDurationFromFile(audioFile);
      
      // Upload file to storage
      const fileExt = 'mp3';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('music-files')
        .upload(fileName, audioFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload failed",
          description: uploadError.message,
          variant: "destructive"
        });
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('music-files')
        .getPublicUrl(fileName);

      // Save track metadata to database
      const { error: dbError } = await supabase
        .from('music_tracks')
        .insert({
          user_id: user.id,
          title,
          artist,
          album: album || null,
          genre: genre || null,
          description: description || null,
          file_url: publicUrl,
          file_size: audioFile.size,
          duration,
          track_type: trackType
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Clean up uploaded file
        await supabase.storage.from('music-files').remove([fileName]);
        toast({
          title: "Database error",
          description: dbError.message,
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Upload successful",
        description: "Your music track has been uploaded successfully"
      });

      // Reset form
      setTitle('');
      setArtist('');
      setAlbum('');
      setGenre('');
      setDescription('');
      setTrackType('featured');
      setAudioFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setOpen(false);
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Something went wrong during upload",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setAudioFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Music
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Music Track</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="audio-file">Audio File (MP3)</Label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="audio-file"
                type="file"
                accept="audio/mpeg,audio/mp3,.mp3"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Music className="w-4 h-4 mr-2" />
                {audioFile ? audioFile.name : 'Choose MP3 file'}
              </Button>
              {audioFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={removeFile}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {audioFile && (
              <p className="text-sm text-muted-foreground">
                Size: {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Track Type</Label>
            <RadioGroup value={trackType} onValueChange={setTrackType}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="featured" id="featured" />
                <Label htmlFor="featured">Featured</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="affirmation" id="affirmation" />
                <Label htmlFor="affirmation">Affirmation</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Song title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artist *</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Artist name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album">Album</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Album name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Music genre"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={uploading || !audioFile || !title || !artist}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload Track'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MusicUpload;
