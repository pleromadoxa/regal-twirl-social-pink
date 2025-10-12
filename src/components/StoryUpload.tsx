import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Image, Video, X, Type, Palette } from 'lucide-react';
import { useStories } from '@/hooks/useStories';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StoryUploadProps {
  onClose: () => void;
}

const gradientOptions = [
  { id: 1, gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 2, gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 3, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 4, gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { id: 5, gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 6, gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { id: 7, gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { id: 8, gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { id: 9, gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 10, gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)' },
  { id: 11, gradient: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)' },
  { id: 12, gradient: 'linear-gradient(135deg, #f77062 0%, #fe5196 100%)' },
];

export const StoryUpload = ({ onClose }: StoryUploadProps) => {
  const [mode, setMode] = useState<'media' | 'text'>('media');
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  // Text story states
  const [textContent, setTextContent] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(gradientOptions[0].gradient);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState('large');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const { createStory } = useStories();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleBackgroundImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setBackgroundImage(url);
    }
  };

  const handleUpload = async () => {
    if (mode === 'media' && !file) return;
    if (mode === 'text' && !textContent.trim()) return;

    setUploading(true);
    try {
      if (mode === 'media') {
        await createStory(file!, caption);
      } else {
        // Create a canvas to render the text story
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1920;
        const ctx = canvas.getContext('2d')!;

        // Draw background
        if (backgroundImage) {
          const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new window.Image();
            image.crossOrigin = 'anonymous';
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = backgroundImage;
          });
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Add overlay for better text readability
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Draw gradient
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          const gradientColors = selectedGradient.match(/hsl\([^)]+\)|#[0-9a-f]{6}|rgb\([^)]+\)/gi) || [];
          if (gradientColors.length >= 2) {
            gradient.addColorStop(0, gradientColors[0]);
            gradient.addColorStop(1, gradientColors[1]);
          }
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const fontSizeMap = {
          small: 60,
          medium: 80,
          large: 100,
        };
        ctx.font = `bold ${fontSizeMap[fontSize as keyof typeof fontSizeMap]}px Arial`;

        // Word wrap
        const maxWidth = canvas.width - 100;
        const words = textContent.split(' ');
        const lines: string[] = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
          const word = words[i];
          const width = ctx.measureText(currentLine + ' ' + word).width;
          if (width < maxWidth) {
            currentLine += ' ' + word;
          } else {
            lines.push(currentLine);
            currentLine = word;
          }
        }
        lines.push(currentLine);

        const lineHeight = fontSizeMap[fontSize as keyof typeof fontSizeMap] * 1.2;
        const startY = (canvas.height - lines.length * lineHeight) / 2;

        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });

        // Convert canvas to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png');
        });

        // Create file from blob
        const file = new File([blob], 'text-story.png', { type: 'image/png' });
        await createStory(file, '');
      }
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as 'media' | 'text')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Media
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              Text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="media" className="space-y-4">
            {!file ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-8 text-center cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 transition-colors"
              >
                <Upload className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-2">
                  Upload image or video
                </p>
                <p className="text-sm text-slate-500">
                  Max 50MB • JPG, PNG, MP4, MOV
                </p>
              </div>
            ) : (
              <div className="relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {file.type.startsWith('image/') ? (
                    <img 
                      src={preview!} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video 
                      src={preview!} 
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={clearFile}
                  className="absolute top-2 right-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            {/* Preview */}
            <div 
              className="aspect-[9/16] rounded-lg overflow-hidden relative flex items-center justify-center p-8"
              style={{
                background: backgroundImage ? `url(${backgroundImage})` : selectedGradient,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              {backgroundImage && (
                <div className="absolute inset-0 bg-black/30" />
              )}
              <p 
                className="text-center font-bold relative z-10"
                style={{
                  color: textColor,
                  fontSize: fontSize === 'small' ? '1.5rem' : fontSize === 'medium' ? '2rem' : '2.5rem',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {textContent || 'Your text here...'}
              </p>
            </div>

            {/* Text Input */}
            <Textarea
              placeholder="Type your message..."
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="resize-none"
              rows={3}
              maxLength={150}
            />

            {/* Background Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Background</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => bgImageInputRef.current?.click()}
                  className="gap-2"
                >
                  <Image className="w-4 h-4" />
                  Upload Image
                </Button>
                <input
                  ref={bgImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageSelect}
                  className="hidden"
                />
              </div>

              {!backgroundImage && (
                <div className="grid grid-cols-6 gap-2">
                  {gradientOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedGradient(option.gradient)}
                      className={`aspect-square rounded-lg border-2 transition-all ${
                        selectedGradient === option.gradient
                          ? 'border-primary scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ background: option.gradient }}
                    />
                  ))}
                </div>
              )}

              {backgroundImage && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBackgroundImage(null)}
                  className="w-full"
                >
                  Remove Background Image
                </Button>
              )}
            </div>

            {/* Text Customization */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Text Size</label>
                <div className="flex gap-2">
                  {['small', 'medium', 'large'].map((size) => (
                    <Button
                      key={size}
                      variant={fontSize === size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFontSize(size)}
                      className="flex-1 capitalize"
                    >
                      {size}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Text Color</label>
                <div className="flex gap-2">
                  {['#ffffff', '#000000', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setTextColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        textColor === color ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleUpload}
            disabled={(mode === 'media' && !file) || (mode === 'text' && !textContent.trim()) || uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {uploading ? 'Uploading...' : 'Share Story'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};