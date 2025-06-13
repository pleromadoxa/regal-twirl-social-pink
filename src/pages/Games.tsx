import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Gamepad, 
  Trophy, 
  Clock, 
  Play, 
  RotateCcw,
  Brain,
  Zap,
  Target,
  Calculator,
  BookOpen,
  Lightbulb,
  Timer,
  Check,
  Shuffle,
  Eye,
  MousePointer,
  Puzzle,
  Hash,
  Repeat,
  Layers
} from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Games = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<any[]>([]);
  const [saves, setSaves] = useState<any[]>([]);
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  // Game states for all 13 games
  const [memoryGame, setMemoryGame] = useState({
    cards: [] as {id: number, value: number, flipped: boolean, matched: boolean}[],
    flippedCards: [] as number[],
    moves: 0,
    score: 0,
    isCompleted: false,
    timeElapsed: 0
  });

  const [mathQuiz, setMathQuiz] = useState({
    currentQuestion: { num1: 0, num2: 0, operator: '+', answer: 0 },
    userAnswer: '',
    score: 0,
    totalQuestions: 0,
    timeElapsed: 0,
    isCompleted: false
  });

  const [patternGame, setPatternGame] = useState({
    sequence: [] as number[],
    userSequence: [] as number[],
    level: 1,
    score: 0,
    showingPattern: false,
    gamePhase: 'waiting' as 'waiting' | 'showing' | 'input' | 'correct' | 'wrong'
  });

  const [wordScramble, setWordScramble] = useState({
    originalWord: '',
    scrambledWord: '',
    userGuess: '',
    score: 0,
    level: 1,
    isCompleted: false
  });

  const [colorMatch, setColorMatch] = useState({
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    targetColor: '',
    timeLeft: 30,
    score: 0,
    isActive: false
  });

  const [reactionTime, setReactionTime] = useState({
    isWaiting: false,
    isReady: false,
    startTime: 0,
    bestTime: Infinity,
    currentTime: 0,
    attempts: 0
  });

  const [numberSequence, setNumberSequence] = useState({
    sequence: [] as number[],
    userInput: '',
    level: 1,
    score: 0,
    isShowing: false
  });

  const [spatialPuzzle, setSpatialPuzzle] = useState({
    pieces: [] as {id: number, position: number, correctPosition: number}[],
    moves: 0,
    isCompleted: false,
    score: 0
  });

  const [wordAssociation, setWordAssociation] = useState({
    currentWord: '',
    userResponse: '',
    score: 0,
    level: 1,
    timeLeft: 30
  });

  const [logicPuzzle, setLogicPuzzle] = useState({
    puzzle: '',
    options: [] as string[],
    correctAnswer: 0,
    userAnswer: -1,
    score: 0,
    level: 1
  });

  const [visualTracking, setVisualTracking] = useState({
    targets: [] as {id: number, x: number, y: number, clicked: boolean}[],
    timeLeft: 20,
    score: 0,
    isActive: false
  });

  const [cognitiveLoad, setCognitiveLoad] = useState({
    tasks: [] as {type: string, value: any, completed: boolean}[],
    currentTask: 0,
    score: 0,
    timeLeft: 60
  });

  const [flexibilityTest, setFlexibilityTest] = useState({
    rules: [] as string[],
    currentRule: 0,
    stimuli: [] as {shape: string, color: string, size: string}[],
    score: 0,
    level: 1
  });

  useEffect(() => {
    if (user) {
      fetchGameData();
    }
  }, [user]);

  const fetchGameData = async () => {
    if (!user) return;

    try {
      const [scoresRes, savesRes] = await Promise.all([
        supabase.from('game_scores').select('*').eq('user_id', user.id).order('score', { ascending: false }),
        supabase.from('game_saves').select('*').eq('user_id', user.id).order('updated_at', { ascending: false })
      ]);

      setScores(scoresRes.data || []);
      setSaves(savesRes.data || []);
    } catch (error) {
      console.error('Error fetching game data:', error);
    }
  };

  const saveScore = async (gameType: string, score: number, level: number = 1, data: any = {}) => {
    if (!user) return;

    try {
      await supabase.from('game_scores').insert({
        user_id: user.id,
        game_type: gameType,
        score,
        level,
        data
      });

      toast({
        title: "Score Saved!",
        description: `Your score of ${score} has been recorded.`
      });

      fetchGameData();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  // Game initialization functions
  const initializeMemoryGame = () => {
    const cards = [];
    const cardCount = 16;
    for (let i = 0; i < cardCount / 2; i++) {
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
      isCompleted: false,
      timeElapsed: 0
    });
  };

  const generateMathQuestion = () => {
    const operators = ['+', '-', '×', '÷'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    let num1, num2, answer;

    switch (operator) {
      case '+':
        num1 = Math.floor(Math.random() * 100) + 1;
        num2 = Math.floor(Math.random() * 100) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * 100) + 50;
        num2 = Math.floor(Math.random() * 50) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        answer = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        num1 = answer * num2;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
    }

    return { num1, num2, operator, answer };
  };

  const startMathQuiz = () => {
    setMathQuiz({
      currentQuestion: generateMathQuestion(),
      userAnswer: '',
      score: 0,
      totalQuestions: 0,
      timeElapsed: 0,
      isCompleted: false
    });
  };

  const startWordScramble = () => {
    const words = ['ELEPHANT', 'COMPUTER', 'HAPPINESS', 'KNOWLEDGE', 'CREATIVE', 'BUILDING', 'SOLUTION', 'THINKING'];
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    
    setWordScramble({
      originalWord: word,
      scrambledWord: scrambled,
      userGuess: '',
      score: 0,
      level: 1,
      isCompleted: false
    });
  };

  const startColorMatch = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    setColorMatch({
      colors,
      targetColor: colors[Math.floor(Math.random() * colors.length)],
      timeLeft: 30,
      score: 0,
      isActive: true
    });
  };

  const startReactionTime = () => {
    setReactionTime({
      isWaiting: true,
      isReady: false,
      startTime: 0,
      bestTime: Infinity,
      currentTime: 0,
      attempts: 0
    });

    const delay = Math.random() * 4000 + 1000;
    setTimeout(() => {
      setReactionTime(prev => ({
        ...prev,
        isWaiting: false,
        isReady: true,
        startTime: Date.now()
      }));
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionTime.isReady) {
      const currentTime = Date.now() - reactionTime.startTime;
      setReactionTime(prev => ({
        ...prev,
        currentTime,
        bestTime: Math.min(prev.bestTime, currentTime),
        attempts: prev.attempts + 1,
        isReady: false
      }));
    }
  };

  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test your visual memory by matching pairs of cards',
      icon: Brain,
      color: 'bg-blue-500',
      benefits: 'Improves working memory and concentration'
    },
    {
      id: 'math_quiz',
      title: 'Speed Math',
      description: 'Solve math problems as quickly as possible',
      icon: Calculator,
      color: 'bg-green-500',
      benefits: 'Enhances numerical processing and mental agility'
    },
    {
      id: 'pattern_memory',
      title: 'Pattern Memory',
      description: 'Remember and repeat sequences of patterns',
      icon: Target,
      color: 'bg-purple-500',
      benefits: 'Strengthens sequential memory and attention'
    },
    {
      id: 'word_scramble',
      title: 'Word Scramble',
      description: 'Unscramble letters to form words',
      icon: Shuffle,
      color: 'bg-orange-500',
      benefits: 'Improves vocabulary and letter recognition'
    },
    {
      id: 'color_match',
      title: 'Color Match',
      description: 'Match colors quickly under time pressure',
      icon: Eye,
      color: 'bg-pink-500',
      benefits: 'Enhances visual processing and reaction time'
    },
    {
      id: 'reaction_time',
      title: 'Reaction Time',
      description: 'Test your reflexes and reaction speed',
      icon: Timer,
      color: 'bg-red-500',
      benefits: 'Improves response time and alertness'
    },
    {
      id: 'number_sequence',
      title: 'Number Sequence',
      description: 'Remember and input number sequences',
      icon: Hash,
      color: 'bg-teal-500',
      benefits: 'Strengthens numerical memory and attention'
    },
    {
      id: 'spatial_puzzle',
      title: 'Spatial Puzzle',
      description: 'Arrange pieces in correct spatial order',
      icon: Puzzle,
      color: 'bg-indigo-500',
      benefits: 'Develops spatial reasoning and problem solving'
    },
    {
      id: 'word_association',
      title: 'Word Association',
      description: 'Generate related words quickly',
      icon: BookOpen,
      color: 'bg-amber-500',
      benefits: 'Expands vocabulary and semantic memory'
    },
    {
      id: 'logic_puzzle',
      title: 'Logic Puzzles',
      description: 'Solve logical reasoning challenges',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      benefits: 'Develops logical thinking and problem solving'
    },
    {
      id: 'visual_tracking',
      title: 'Visual Tracking',
      description: 'Track and click moving targets',
      icon: MousePointer,
      color: 'bg-cyan-500',
      benefits: 'Improves visual attention and coordination'
    },
    {
      id: 'cognitive_load',
      title: 'Cognitive Load',
      description: 'Handle multiple tasks simultaneously',
      icon: Layers,
      color: 'bg-violet-500',
      benefits: 'Enhances multitasking and working memory'
    },
    {
      id: 'flexibility_test',
      title: 'Mental Flexibility',
      description: 'Switch between different rule sets',
      icon: Repeat,
      color: 'bg-emerald-500',
      benefits: 'Improves cognitive flexibility and adaptation'
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
                <Brain className="w-8 h-8" />
                Mind Enhancement Games
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Train your brain with 13 scientifically-designed cognitive games
              </p>
            </div>

            <Tabs defaultValue="games" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="scores">High Scores</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
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
                          <p className="text-xs text-muted-foreground mb-3">{game.benefits}</p>
                          <div className="flex justify-between items-center">
                            <Badge variant="outline">
                              Best: {scores.find(s => s.game_type === game.id)?.score || 0}
                            </Badge>
                            <Button
                              onClick={() => {
                                setCurrentGame(game.id);
                                if (game.id === 'memory') initializeMemoryGame();
                                if (game.id === 'math_quiz') startMathQuiz();
                                if (game.id === 'word_scramble') startWordScramble();
                                if (game.id === 'color_match') startColorMatch();
                                if (game.id === 'reaction_time') startReactionTime();
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
                      {currentGame === 'memory' && (
                        <div className="text-center">
                          <div className="mb-4">
                            <p>Moves: {memoryGame.moves} | Score: {memoryGame.score}</p>
                          </div>
                          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
                            {memoryGame.cards.map((card) => (
                              <div
                                key={card.id}
                                onClick={() => {
                                  if (card.matched || card.flipped || memoryGame.flippedCards.length >= 2) return;
                                  
                                  const newCards = memoryGame.cards.map(c => 
                                    c.id === card.id ? { ...c, flipped: true } : c
                                  );
                                  
                                  const newFlippedCards = [...memoryGame.flippedCards, card.id];
                                  
                                  setMemoryGame(prev => ({
                                    ...prev,
                                    cards: newCards,
                                    flippedCards: newFlippedCards
                                  }));

                                  if (newFlippedCards.length === 2) {
                                    setTimeout(() => {
                                      const [first, second] = newFlippedCards;
                                      const firstCard = newCards.find(c => c.id === first);
                                      const secondCard = newCards.find(c => c.id === second);

                                      if (firstCard?.value === secondCard?.value) {
                                        setMemoryGame(prev => ({
                                          ...prev,
                                          cards: prev.cards.map(c => 
                                            c.id === first || c.id === second ? { ...c, matched: true } : c
                                          ),
                                          flippedCards: [],
                                          moves: prev.moves + 1,
                                          score: prev.score + 100
                                        }));
                                      } else {
                                        setMemoryGame(prev => ({
                                          ...prev,
                                          cards: prev.cards.map(c => 
                                            c.id === first || c.id === second ? { ...c, flipped: false } : c
                                          ),
                                          flippedCards: [],
                                          moves: prev.moves + 1
                                        }));
                                      }
                                    }, 1000);
                                  }
                                }}
                                className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                                  card.flipped || card.matched
                                    ? 'bg-blue-500 text-white transform scale-105'
                                    : 'bg-slate-200 hover:bg-slate-300'
                                } ${card.matched ? 'bg-green-500' : ''}`}
                              >
                                {card.flipped || card.matched ? (
                                  <span className="text-2xl">🧠</span>
                                ) : '?'}
                              </div>
                            ))}
                          </div>
                          <Button
                            className="mt-4"
                            onClick={initializeMemoryGame}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            New Game
                          </Button>
                        </div>
                      )}

                      {currentGame === 'word_scramble' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Level {wordScramble.level}</p>
                            <p className="text-lg mb-2">Score: {wordScramble.score}</p>
                          </div>
                          {!wordScramble.isCompleted ? (
                            <div className="space-y-4">
                              <div className="text-3xl font-bold p-6 bg-slate-100 rounded-lg">
                                {wordScramble.scrambledWord}
                              </div>
                              <Input
                                type="text"
                                value={wordScramble.userGuess}
                                onChange={(e) => setWordScramble(prev => ({ ...prev, userGuess: e.target.value.toUpperCase() }))}
                                placeholder="Your answer"
                                className="text-center text-xl"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    if (wordScramble.userGuess === wordScramble.originalWord) {
                                      const newScore = wordScramble.score + 100;
                                      setWordScramble(prev => ({ ...prev, score: newScore, isCompleted: true }));
                                      saveScore('word_scramble', newScore, wordScramble.level);
                                    }
                                  }
                                }}
                              />
                              <Button 
                                onClick={() => {
                                  if (wordScramble.userGuess === wordScramble.originalWord) {
                                    const newScore = wordScramble.score + 100;
                                    setWordScramble(prev => ({ ...prev, score: newScore, isCompleted: true }));
                                    saveScore('word_scramble', newScore, wordScramble.level);
                                  }
                                }}
                                className="w-full"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Submit Answer
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold">Correct!</h3>
                              <p className="text-lg">Score: {wordScramble.score}</p>
                              <Button onClick={startWordScramble} className="w-full">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Play Again
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {currentGame === 'reaction_time' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6">
                            <p className="text-lg mb-2">Best Time: {reactionTime.bestTime === Infinity ? 'N/A' : `${reactionTime.bestTime}ms`}</p>
                            <p className="text-sm text-muted-foreground">Attempts: {reactionTime.attempts}</p>
                          </div>
                          <div 
                            onClick={handleReactionClick}
                            className={`w-64 h-64 mx-auto rounded-lg cursor-pointer transition-all ${
                              reactionTime.isWaiting ? 'bg-red-500' : 
                              reactionTime.isReady ? 'bg-green-500' : 'bg-gray-300'
                            } flex items-center justify-center`}
                          >
                            <span className="text-white text-xl font-bold">
                              {reactionTime.isWaiting ? 'Wait...' :
                               reactionTime.isReady ? 'CLICK!' : 'Click to Start'}
                            </span>
                          </div>
                          {reactionTime.currentTime > 0 && (
                            <p className="mt-4 text-lg">Last: {reactionTime.currentTime}ms</p>
                          )}
                          <Button onClick={startReactionTime} className="mt-4">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            New Test
                          </Button>
                        </div>
                      )}

                      {/* Placeholder implementations for other games */}
                      {['color_match', 'number_sequence', 'spatial_puzzle', 'word_association', 'logic_puzzle', 'visual_tracking', 'cognitive_load', 'flexibility_test'].includes(currentGame) && (
                        <div className="text-center">
                          <p className="text-muted-foreground">
                            {games.find(g => g.id === currentGame)?.title} - Fully functional implementation coming soon!
                          </p>
                          <p className="text-sm mt-2">
                            {games.find(g => g.id === currentGame)?.benefits}
                          </p>
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
                                <p className="font-medium capitalize">{score.game_type.replace('_', ' ')}</p>
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

              <TabsContent value="progress">
                <div className="space-y-4">
                  {saves.length > 0 ? (
                    saves.map((save) => (
                      <Card key={save.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Clock className="w-5 h-5 text-blue-500" />
                              <div>
                                <p className="font-medium capitalize">{save.game_type.replace('_', ' ')}</p>
                                <p className="text-sm text-slate-500">
                                  Last played {new Date(save.updated_at).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setCurrentGame(save.game_type);
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
                      <p className="text-slate-500">No saved progress yet. Your game progress will be saved automatically!</p>
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
