
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gamepad, 
  Trophy, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { supabase } from '@/integrations/supabase/client';

interface GameScore {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  level: number;
  data: any;
  created_at: string;
}

interface GameSave {
  id: string;
  user_id: string;
  game_type: string;
  save_data: any;
  updated_at: string;
}

const Games = () => {
  const { user } = useAuth();
  const [scores, setScores] = useState<GameScore[]>([]);
  const [saves, setSaves] = useState<GameSave[]>([]);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameStates, setGameStates] = useState<{[key: string]: any}>({});

  // Snake Game State
  const [snakeGame, setSnakeGame] = useState({
    snake: [{x: 10, y: 10}],
    food: {x: 15, y: 15},
    direction: 'RIGHT',
    score: 0,
    gameOver: false,
    isPlaying: false
  });

  // Memory Game State
  const [memoryGame, setMemoryGame] = useState({
    cards: [] as {id: number, value: number, flipped: boolean, matched: boolean}[],
    flippedCards: [] as number[],
    moves: 0,
    score: 0,
    isCompleted: false
  });

  // Number Puzzle State
  const [puzzleGame, setPuzzleGame] = useState({
    tiles: [] as number[],
    emptyIndex: 15,
    moves: 0,
    isCompleted: false
  });

  useEffect(() => {
    if (user) {
      loadGameData();
    }
  }, [user]);

  const loadGameData = async () => {
    if (!user) return;

    // Load high scores
    const { data: scoresData } = await supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('score', { ascending: false });

    // Load saved games
    const { data: savesData } = await supabase
      .from('game_saves')
      .select('*')
      .eq('user_id', user.id);

    if (scoresData) setScores(scoresData);
    if (savesData) setSaves(savesData);
  };

  const saveGameState = async (gameType: string, saveData: any) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('game_saves')
      .upsert({
        user_id: user.id,
        game_type: gameType,
        save_data: saveData
      });

    if (!error) {
      loadGameData();
    }
  };

  const saveScore = async (gameType: string, score: number, level: number = 1, data: any = {}) => {
    if (!user) return;

    const { error } = await supabase
      .from('game_scores')
      .insert({
        user_id: user.id,
        game_type: gameType,
        score,
        level,
        data
      });

    if (!error) {
      loadGameData();
    }
  };

  const initializeMemoryGame = () => {
    const cards = [];
    for (let i = 0; i < 8; i++) {
      cards.push(
        { id: i * 2, value: i, flipped: false, matched: false },
        { id: i * 2 + 1, value: i, flipped: false, matched: false }
      );
    }
    setMemoryGame({
      cards: cards.sort(() => Math.random() - 0.5),
      flippedCards: [],
      moves: 0,
      score: 0,
      isCompleted: false
    });
  };

  const initializePuzzleGame = () => {
    const tiles = Array.from({ length: 15 }, (_, i) => i + 1);
    tiles.push(0); // Empty space
    
    // Shuffle
    for (let i = tiles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
    }
    
    setPuzzleGame({
      tiles,
      emptyIndex: tiles.indexOf(0),
      moves: 0,
      isCompleted: false
    });
  };

  const games = [
    {
      id: 'snake',
      title: 'Snake Game',
      description: 'Classic snake game',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Match pairs of cards',
      icon: Brain,
      color: 'bg-blue-500'
    },
    {
      id: 'puzzle',
      title: '15 Puzzle',
      description: 'Slide tiles to arrange numbers',
      icon: Zap,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Gamepad className="w-8 h-8" />
                Web Games
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Play games, compete for high scores, and save your progress
              </p>
            </div>

            <Tabs defaultValue="games" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="scores">High Scores</TabsTrigger>
                <TabsTrigger value="saved">Saved Games</TabsTrigger>
              </TabsList>

              <TabsContent value="games" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {games.map((game) => {
                    const Icon = game.icon;
                    return (
                      <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{game.title}</CardTitle>
                              <p className="text-sm text-slate-500">{game.description}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">
                              Best: {scores.find(s => s.game_type === game.id)?.score || 0}
                            </Badge>
                            <Button
                              onClick={() => {
                                setCurrentGame(game.id);
                                if (game.id === 'memory') initializeMemoryGame();
                                if (game.id === 'puzzle') initializePuzzleGame();
                              }}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Play
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Game Area */}
                {currentGame && (
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{games.find(g => g.id === currentGame)?.title}</CardTitle>
                        <Button
                          variant="outline"
                          onClick={() => setCurrentGame(null)}
                        >
                          Close Game
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {currentGame === 'snake' && (
                        <div className="text-center">
                          <div className="bg-slate-800 w-96 h-96 mx-auto mb-4 border-2 border-slate-600 relative">
                            <p className="text-white p-4">Snake Game Area</p>
                            <p className="text-white">Score: {snakeGame.score}</p>
                          </div>
                          <Button
                            onClick={() => setSnakeGame(prev => ({ ...prev, isPlaying: !prev.isPlaying }))}
                            className="mr-2"
                          >
                            {snakeGame.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setSnakeGame({
                              snake: [{x: 10, y: 10}],
                              food: {x: 15, y: 15},
                              direction: 'RIGHT',
                              score: 0,
                              gameOver: false,
                              isPlaying: false
                            })}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Reset
                          </Button>
                        </div>
                      )}

                      {currentGame === 'memory' && (
                        <div className="text-center">
                          <div className="mb-4">
                            <p>Moves: {memoryGame.moves} | Score: {memoryGame.score}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                            {memoryGame.cards.map((card) => (
                              <div
                                key={card.id}
                                className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                                  card.flipped || card.matched
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-200 hover:bg-slate-300'
                                }`}
                                onClick={() => {
                                  if (!card.flipped && !card.matched && memoryGame.flippedCards.length < 2) {
                                    // Handle card flip logic here
                                  }
                                }}
                              >
                                {card.flipped || card.matched ? card.value : '?'}
                              </div>
                            ))}
                          </div>
                          <Button
                            className="mt-4"
                            onClick={initializeMemoryGame}
                          >
                            New Game
                          </Button>
                        </div>
                      )}

                      {currentGame === 'puzzle' && (
                        <div className="text-center">
                          <div className="mb-4">
                            <p>Moves: {puzzleGame.moves}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-1 max-w-xs mx-auto">
                            {puzzleGame.tiles.map((tile, index) => (
                              <div
                                key={index}
                                className={`w-16 h-16 border rounded flex items-center justify-center cursor-pointer transition-colors ${
                                  tile === 0
                                    ? 'bg-slate-100'
                                    : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                                onClick={() => {
                                  // Handle tile move logic here
                                }}
                              >
                                {tile === 0 ? '' : tile}
                              </div>
                            ))}
                          </div>
                          <Button
                            className="mt-4"
                            onClick={initializePuzzleGame}
                          >
                            Shuffle
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="scores">
                <div className="space-y-4">
                  {scores.length > 0 ? (
                    scores.map((score) => (
                      <Card key={score.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Trophy className="w-5 h-5 text-yellow-500" />
                              <div>
                                <p className="font-medium capitalize">{score.game_type}</p>
                                <p className="text-sm text-slate-500">
                                  {new Date(score.created_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold">{score.score}</p>
                              <p className="text-sm text-slate-500">Level {score.level}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No high scores yet. Start playing to set records!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="saved">
                <div className="space-y-4">
                  {saves.length > 0 ? (
                    saves.map((save) => (
                      <Card key={save.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium capitalize">{save.game_type}</p>
                                <p className="text-sm text-slate-500">
                                  Saved {new Date(save.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentGame(save.game_type);
                                // Load save data logic here
                              }}
                            >
                              Resume
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500">No saved games yet. Your progress will be saved automatically!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <RightSidebar />
      </div>
    </div>
  );
};

export default Games;
