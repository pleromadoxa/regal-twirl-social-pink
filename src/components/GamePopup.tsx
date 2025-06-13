
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';

interface GamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    title: string;
    description: string;
    image: string;
  } | null;
}

const GamePopup = ({ isOpen, onClose, game }: GamePopupProps) => {
  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            {game.title}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <img 
            src={game.image} 
            alt={game.title}
            className="w-full h-64 object-cover rounded-lg"
          />
          
          <p className="text-muted-foreground">{game.description}</p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg text-center">
            <Play className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold mb-2">Ready to Play!</h3>
            <p className="text-muted-foreground mb-4">
              Get ready for an amazing gaming experience with {game.title}
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GamePopup;
