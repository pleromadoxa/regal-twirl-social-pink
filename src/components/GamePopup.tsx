
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Play, X, RotateCcw, Trophy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface GamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  game: {
    id: string;
    title: string;
    description: string;
    image: string;
    onSaveScore?: (gameType: string, score: number, level: number) => Promise<void>;
  } | null;
}

const GamePopup = ({ isOpen, onClose, game }: GamePopupProps) => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const { toast } = useToast();

  // Tic Tac Toe state
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<string | null>(null);

  // Memory Cards state
  const [cards, setCards] = useState<{ id: number; value: number; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);

  // Word Puzzle state
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [targetWords] = useState(['GAME', 'PLAY', 'WIN', 'FUN']);

  useEffect(() => {
    if (gameState === 'playing') {
      initializeGame();
    }
  }, [gameState, game?.id]);

  const initializeGame = () => {
    setScore(0);
    setLevel(1);
    setWinner(null);

    if (game?.id === 'tic-tac-toe') {
      setBoard(Array(9).fill(null));
      setCurrentPlayer('X');
    } else if (game?.id === 'memory-cards') {
      const cardValues = [1, 2, 3, 4, 5, 6, 7, 8];
      const shuffledCards = [...cardValues, ...cardValues]
        .sort(() => Math.random() - 0.5)
        .map((value, index) => ({
          id: index,
          value,
          isFlipped: false,
          isMatched: false
        }));
      setCards(shuffledCards);
      setFlippedCards([]);
      setMoves(0);
    } else if (game?.id === 'word-puzzle') {
      setFoundWords([]);
    }
  };

  const checkTicTacToeWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const handleTicTacToeClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkTicTacToeWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setScore(gameWinner === 'X' ? 100 : 0);
      setGameState('finished');
    } else if (newBoard.every(cell => cell !== null)) {
      setWinner('Draw');
      setScore(50);
      setGameState('finished');
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const handleMemoryCardClick = (cardId: number) => {
    if (flippedCards.length === 2) return;
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return;

    const newCards = [...cards];
    newCards[cardId].isFlipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlippedCards;
      
      if (cards[first].value === cards[second].value) {
        // Match found
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isMatched = true;
          updatedCards[second].isMatched = true;
          setCards(updatedCards);
          setFlippedCards([]);

          // Check if game is complete
          if (updatedCards.every(card => card.isMatched)) {
            const finalScore = Math.max(0, 1000 - (moves * 10));
            setScore(finalScore);
            setGameState('finished');
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          const updatedCards = [...newCards];
          updatedCards[first].isFlipped = false;
          updatedCards[second].isFlipped = false;
          setCards(updatedCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleWordFound = (word: string) => {
    if (!foundWords.includes(word) && targetWords.includes(word)) {
      const newFoundWords = [...foundWords, word];
      setFoundWords(newFoundWords);
      setScore(newFoundWords.length * 100);

      if (newFoundWords.length === targetWords.length) {
        setGameState('finished');
      }
    }
  };

  const saveScore = async () => {
    if (game?.onSaveScore && score > 0) {
      try {
        await game.onSaveScore(game.id, score, level);
        toast({
          title: "Score Saved!",
          description: `Your score of ${score} points has been saved to the leaderboard.`
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save score to leaderboard.",
          variant: "destructive"
        });
      }
    }
    onClose();
  };

  const renderTicTacToe = () => (
    <div className="text-center">
      <p className="mb-4">Current Player: <span className="font-bold text-lg">{currentPlayer}</span></p>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto mb-4">
        {board.map((cell, index) => (
          <button
            key={index}
            className="w-20 h-20 border-2 border-gray-300 text-2xl font-bold hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => handleTicTacToeClick(index)}
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );

  const renderMemoryCards = () => (
    <div className="text-center">
      <p className="mb-4">Moves: <span className="font-bold">{moves}</span></p>
      <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
        {cards.map((card) => (
          <button
            key={card.id}
            className={`w-16 h-16 border-2 text-lg font-bold rounded ${
              card.isFlipped || card.isMatched
                ? 'bg-purple-200 border-purple-400'
                : 'bg-gray-200 border-gray-400 hover:bg-gray-300'
            } ${card.isMatched ? 'opacity-50' : ''}`}
            onClick={() => handleMemoryCardClick(card.id)}
          >
            {(card.isFlipped || card.isMatched) ? card.value : '?'}
          </button>
        ))}
      </div>
    </div>
  );

  const renderWordPuzzle = () => (
    <div className="text-center">
      <p className="mb-4">Find these words: {targetWords.join(', ')}</p>
      <p className="mb-4">Found: <span className="font-bold">{foundWords.join(', ')}</span></p>
      <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto mb-4">
        {['G', 'A', 'M', 'E', 'P', 'L', 'A', 'Y', 'W', 'I', 'N', 'F', 'U', 'N', 'X', 'Z'].map((letter, index) => (
          <button
            key={index}
            className="w-12 h-12 border border-gray-300 text-lg font-bold hover:bg-purple-100"
            onClick={() => {
              // Simple word finding logic - click letters to form words
              const word = letter + 'AME'; // Simplified for demo
              if (word.length >= 3) {
                handleWordFound(word.substring(0, 4));
              }
            }}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {targetWords.map(word => (
          <Button
            key={word}
            variant="outline"
            size="sm"
            onClick={() => handleWordFound(word)}
          >
            Find "{word}"
          </Button>
        ))}
      </div>
    </div>
  );

  const renderGameContent = () => {
    if (gameState === 'menu') {
      return (
        <div className="space-y-4">
          <img 
            src={game?.image || '/placeholder.svg'} 
            alt={game?.title}
            className="w-full h-64 object-cover rounded-lg"
          />
          
          <p className="text-muted-foreground">{game?.description}</p>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg text-center">
            <Play className="w-16 h-16 mx-auto mb-4 text-purple-600" />
            <h3 className="text-xl font-bold mb-2">Ready to Play!</h3>
            <p className="text-muted-foreground mb-4">
              Get ready for an amazing gaming experience with {game?.title}
            </p>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => setGameState('playing')}
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing Now
            </Button>
          </div>
        </div>
      );
    }

    if (gameState === 'playing') {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">Score: {score}</p>
            <Button variant="outline" size="sm" onClick={() => setGameState('menu')}>
              <X className="w-4 h-4 mr-1" />
              Quit
            </Button>
          </div>
          
          {game?.id === 'tic-tac-toe' && renderTicTacToe()}
          {game?.id === 'memory-cards' && renderMemoryCards()}
          {game?.id === 'word-puzzle' && renderWordPuzzle()}
        </div>
      );
    }

    if (gameState === 'finished') {
      return (
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-yellow-500" />
          <h3 className="text-2xl font-bold">Game Over!</h3>
          {winner && game?.id === 'tic-tac-toe' && (
            <p className="text-lg">
              {winner === 'Draw' ? "It's a draw!" : `Player ${winner} wins!`}
            </p>
          )}
          <p className="text-xl">Final Score: <span className="font-bold text-purple-600">{score}</span></p>
          
          <div className="flex gap-2 justify-center">
            <Button 
              onClick={() => setGameState('playing')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button onClick={saveScore} variant="outline">
              <Trophy className="w-4 h-4 mr-2" />
              Save Score
            </Button>
          </div>
        </div>
      );
    }
  };

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
        
        {renderGameContent()}
      </DialogContent>
    </Dialog>
  );
};

export default GamePopup;
