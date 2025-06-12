
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
  Check
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

  // Memory Game State
  const [memoryGame, setMemoryGame] = useState({
    cards: [] as {id: number, value: number, flipped: boolean, matched: boolean}[],
    flippedCards: [] as number[],
    moves: 0,
    score: 0,
    isCompleted: false,
    timeElapsed: 0
  });

  // Math Quiz State
  const [mathQuiz, setMathQuiz] = useState({
    currentQuestion: { num1: 0, num2: 0, operator: '+', answer: 0 },
    userAnswer: '',
    score: 0,
    totalQuestions: 0,
    timeElapsed: 0,
    isCompleted: false
  });

  // Word Chain State
  const [wordChain, setWordChain] = useState({
    words: [] as string[],
    currentWord: '',
    score: 0,
    timeElapsed: 0,
    isGameActive: false
  });

  // Pattern Memory State
  const [patternGame, setPatternGame] = useState({
    sequence: [] as number[],
    userSequence: [] as number[],
    level: 1,
    score: 0,
    showingPattern: false,
    gamePhase: 'waiting' as 'waiting' | 'showing' | 'input' | 'correct' | 'wrong'
  });

  // Speed Reading State
  const [speedReading, setSpeedReading] = useState({
    text: '',
    currentWordIndex: 0,
    wpm: 250,
    isReading: false,
    comprehensionScore: 0
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

  const initializeMemoryGame = () => {
    const cards = [];
    const cardCount = 16; // 8 pairs
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

  const flipCard = (cardId: number) => {
    if (memoryGame.flippedCards.length >= 2) return;
    
    const newCards = memoryGame.cards.map(card => 
      card.id === cardId ? { ...card, flipped: true } : card
    );
    
    const newFlippedCards = [...memoryGame.flippedCards, cardId];
    
    setMemoryGame(prev => ({
      ...prev,
      cards: newCards,
      flippedCards: newFlippedCards
    }));

    if (newFlippedCards.length === 2) {
      const [first, second] = newFlippedCards;
      const firstCard = newCards.find(c => c.id === first);
      const secondCard = newCards.find(c => c.id === second);

      setTimeout(() => {
        if (firstCard?.value === secondCard?.value) {
          // Match found
          setMemoryGame(prev => ({
            ...prev,
            cards: prev.cards.map(card => 
              card.id === first || card.id === second ? { ...card, matched: true } : card
            ),
            flippedCards: [],
            moves: prev.moves + 1,
            score: prev.score + 100
          }));
        } else {
          // No match
          setMemoryGame(prev => ({
            ...prev,
            cards: prev.cards.map(card => 
              card.id === first || card.id === second ? { ...card, flipped: false } : card
            ),
            flippedCards: [],
            moves: prev.moves + 1
          }));
        }
      }, 1000);
    }
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

  const submitMathAnswer = () => {
    const isCorrect = parseInt(mathQuiz.userAnswer) === mathQuiz.currentQuestion.answer;
    const newScore = isCorrect ? mathQuiz.score + 10 : mathQuiz.score;
    const newTotal = mathQuiz.totalQuestions + 1;

    if (newTotal >= 10) {
      setMathQuiz(prev => ({ ...prev, isCompleted: true, score: newScore }));
      saveScore('math_quiz', newScore, 1, { accuracy: (newScore / (newTotal * 10)) * 100 });
    } else {
      setMathQuiz({
        currentQuestion: generateMathQuestion(),
        userAnswer: '',
        score: newScore,
        totalQuestions: newTotal,
        timeElapsed: mathQuiz.timeElapsed,
        isCompleted: false
      });
    }
  };

  const startPatternGame = () => {
    const sequence = [Math.floor(Math.random() * 4)];
    setPatternGame({
      sequence,
      userSequence: [],
      level: 1,
      score: 0,
      showingPattern: true,
      gamePhase: 'showing'
    });

    setTimeout(() => {
      setPatternGame(prev => ({ ...prev, showingPattern: false, gamePhase: 'input' }));
    }, 1000);
  };

  const handlePatternInput = (index: number) => {
    const newUserSequence = [...patternGame.userSequence, index];
    
    if (newUserSequence[newUserSequence.length - 1] !== patternGame.sequence[newUserSequence.length - 1]) {
      // Wrong input
      setPatternGame(prev => ({ ...prev, gamePhase: 'wrong' }));
      saveScore('pattern_memory', patternGame.score, patternGame.level);
      return;
    }

    if (newUserSequence.length === patternGame.sequence.length) {
      // Level completed
      const newScore = patternGame.score + (patternGame.level * 10);
      const newLevel = patternGame.level + 1;
      const newSequence = [...patternGame.sequence, Math.floor(Math.random() * 4)];
      
      setPatternGame({
        sequence: newSequence,
        userSequence: [],
        level: newLevel,
        score: newScore,
        showingPattern: true,
        gamePhase: 'correct'
      });

      setTimeout(() => {
        setPatternGame(prev => ({ ...prev, showingPattern: false, gamePhase: 'input' }));
      }, 1500);
    } else {
      setPatternGame(prev => ({ ...prev, userSequence: newUserSequence }));
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
      id: 'word_chain',
      title: 'Word Association',
      description: 'Create chains of related words to boost vocabulary',
      icon: BookOpen,
      color: 'bg-orange-500',
      benefits: 'Expands vocabulary and semantic memory'
    },
    {
      id: 'speed_reading',
      title: 'Speed Reading',
      description: 'Improve reading speed while maintaining comprehension',
      icon: Zap,
      color: 'bg-red-500',
      benefits: 'Increases reading speed and text processing'
    },
    {
      id: 'logic_puzzle',
      title: 'Logic Puzzles',
      description: 'Solve logical reasoning challenges',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      benefits: 'Develops logical thinking and problem solving'
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
                Train your brain with scientifically-designed cognitive games
              </p>
            </div>

            <Tabs defaultValue="games" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="scores">High Scores</TabsTrigger>
                <TabsTrigger value="saved">Progress</TabsTrigger>
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
                                if (game.id === 'pattern_memory') startPatternGame();
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
                                onClick={() => !card.matched && !card.flipped && flipCard(card.id)}
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

                      {currentGame === 'math_quiz' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6">
                            <p className="text-sm text-muted-foreground mb-2">Question {mathQuiz.totalQuestions + 1}/10</p>
                            <p className="text-lg mb-2">Score: {mathQuiz.score}</p>
                          </div>
                          {!mathQuiz.isCompleted ? (
                            <div className="space-y-4">
                              <div className="text-3xl font-bold p-6 bg-slate-100 rounded-lg">
                                {mathQuiz.currentQuestion.num1} {mathQuiz.currentQuestion.operator} {mathQuiz.currentQuestion.num2} = ?
                              </div>
                              <Input
                                type="number"
                                value={mathQuiz.userAnswer}
                                onChange={(e) => setMathQuiz(prev => ({ ...prev, userAnswer: e.target.value }))}
                                placeholder="Your answer"
                                className="text-center text-xl"
                                onKeyPress={(e) => e.key === 'Enter' && submitMathAnswer()}
                              />
                              <Button onClick={submitMathAnswer} className="w-full">
                                <Check className="w-4 h-4 mr-2" />
                                Submit Answer
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold">Quiz Complete!</h3>
                              <p className="text-lg">Final Score: {mathQuiz.score}/100</p>
                              <p className="text-muted-foreground">
                                Accuracy: {((mathQuiz.score / 100) * 100).toFixed(1)}%
                              </p>
                              <Button onClick={startMathQuiz} className="w-full">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Play Again
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {currentGame === 'pattern_memory' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6">
                            <p className="text-lg mb-2">Level: {patternGame.level} | Score: {patternGame.score}</p>
                            <p className="text-sm text-muted-foreground">
                              {patternGame.gamePhase === 'showing' && 'Watch the pattern...'}
                              {patternGame.gamePhase === 'input' && 'Repeat the pattern'}
                              {patternGame.gamePhase === 'correct' && 'Correct! Next level...'}
                              {patternGame.gamePhase === 'wrong' && 'Game Over!'}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mb-6">
                            {[0, 1, 2, 3].map((index) => (
                              <div
                                key={index}
                                onClick={() => patternGame.gamePhase === 'input' && handlePatternInput(index)}
                                className={`w-24 h-24 rounded-lg cursor-pointer transition-all ${
                                  patternGame.showingPattern && patternGame.sequence.includes(index)
                                    ? 'bg-yellow-400 scale-110'
                                    : 'bg-slate-200 hover:bg-slate-300'
                                } ${patternGame.gamePhase === 'input' ? 'hover:scale-105' : ''}`}
                              />
                            ))}
                          </div>
                          <Button onClick={startPatternGame} className="w-full">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Start New Game
                          </Button>
                        </div>
                      )}

                      {currentGame === 'word_chain' && (
                        <div className="text-center">
                          <p className="text-muted-foreground">Word Association Game - Coming Soon!</p>
                          <p className="text-sm mt-2">Create chains of related words to expand your vocabulary</p>
                        </div>
                      )}

                      {currentGame === 'speed_reading' && (
                        <div className="text-center">
                          <p className="text-muted-foreground">Speed Reading Trainer - Coming Soon!</p>
                          <p className="text-sm mt-2">Improve your reading speed while maintaining comprehension</p>
                        </div>
                      )}

                      {currentGame === 'logic_puzzle' && (
                        <div className="text-center">
                          <p className="text-muted-foreground">Logic Puzzles - Coming Soon!</p>
                          <p className="text-sm mt-2">Challenge your logical reasoning with various puzzle types</p>
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
