
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Maximize2, X } from "lucide-react";
import { useState } from "react";

interface MaximizedReelViewerProps {
  videoUrl: string;
  title?: string;
}

const MaximizedReelViewer = ({ videoUrl, title }: MaximizedReelViewerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full h-[90vh] p-0 bg-black">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/70 rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-full object-contain"
            style={{ width: 'auto', height: 'auto' }}
          />
          {title && (
            <div className="absolute bottom-4 left-4 text-white bg-black/50 px-3 py-2 rounded">
              <p className="text-sm font-medium">{title}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MaximizedReelViewer;
