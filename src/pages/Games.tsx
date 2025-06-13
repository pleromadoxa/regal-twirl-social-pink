import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
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
  Layers,
  Star,
  Award,
  TrendingUp,
  Car,
  Plane,
  Map,
  Camera,
  Mountain,
  Waves,
  Building,
  Trees,
  Gamepad2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Games = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<any[]>([]);
  const [saves, setSaves] = useState<any[]>([]);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [gameTimer, setGameTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Enhanced game states with proper initialization
  const [memoryGame, setMemoryGame] = useState({
    cards: [] as {id: number, value: number, flipped: boolean, matched: boolean}[],
    flippedCards: [] as number[],
    moves: 0,
    score: 0,
    isCompleted: false,
    timeElapsed: 0,
    isStarted: false
  });

  const [mathQuiz, setMathQuiz] = useState({
    currentQuestion: { num1: 0, num2: 0, operator: '+', answer: 0 },
    userAnswer: '',
    score: 0,
    totalQuestions: 0,
    timeElapsed: 0,
    isCompleted: false,
    streak: 0
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
    isCompleted: false,
    wordsCompleted: 0
  });

  const [reactionTime, setReactionTime] = useState({
    isWaiting: false,
    isReady: false,
    startTime: 0,
    bestTime: Infinity,
    currentTime: 0,
    attempts: 0,
    averageTime: 0
  });

  const [concentrationGame, setConcentrationGame] = useState({
    numbers: [] as number[],
    userAnswer: '',
    score: 0,
    level: 1,
    timeLeft: 10,
    isActive: false
  });

  // Timer effect for active games
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

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

  const saveGameProgress = async (gameType: string, saveData: any) => {
    if (!user) return;

    try {
      await supabase.from('game_saves').upsert({
        user_id: user.id,
        game_type: gameType,
        save_data: saveData
      });
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  // Enhanced Memory Game Implementation
  const initializeMemoryGame = () => {
    const cards = [];
    const cardCount = 16;
    const symbols = ['🧠', '⭐', '🎯', '💎', '🔥', '⚡', '🎨', '🚀'];
    
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
      timeElapsed: 0,
      isStarted: true
    });
    
    setGameTimer(0);
    setTimerActive(true);
  };

  const handleMemoryCardClick = (cardId: number) => {
    const card = memoryGame.cards.find(c => c.id === cardId);
    if (!card || card.matched || card.flipped || memoryGame.flippedCards.length >= 2) return;
    
    const newCards = memoryGame.cards.map(c => 
      c.id === cardId ? { ...c, flipped: true } : c
    );
    
    const newFlippedCards = [...memoryGame.flippedCards, cardId];
    
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
          const matchedCards = newCards.map(c => 
            c.id === first || c.id === second ? { ...c, matched: true } : c
          );
          
          const newScore = memoryGame.score + 100;
          const isCompleted = matchedCards.every(c => c.matched);
          
          setMemoryGame(prev => ({
            ...prev,
            cards: matchedCards,
            flippedCards: [],
            moves: prev.moves + 1,
            score: newScore,
            isCompleted
          }));

          if (isCompleted) {
            setTimerActive(false);
            const bonusScore = Math.max(0, 1000 - gameTimer * 10);
            const finalScore = newScore + bonusScore;
            saveScore('memory', finalScore, 1, { moves: memoryGame.moves + 1, time: gameTimer });
          }
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
  };

  // Enhanced Math Quiz Implementation
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
      isCompleted: false,
      streak: 0
    });
    setGameTimer(0);
    setTimerActive(true);
  };

  const submitMathAnswer = () => {
    const isCorrect = parseInt(mathQuiz.userAnswer) === mathQuiz.currentQuestion.answer;
    const newScore = isCorrect ? mathQuiz.score + (10 + mathQuiz.streak * 2) : mathQuiz.score;
    const newStreak = isCorrect ? mathQuiz.streak + 1 : 0;
    const newTotal = mathQuiz.totalQuestions + 1;

    setMathQuiz(prev => ({
      ...prev,
      score: newScore,
      streak: newStreak,
      totalQuestions: newTotal,
      currentQuestion: generateMathQuestion(),
      userAnswer: ''
    }));

    if (newTotal >= 10) {
      setTimerActive(false);
      saveScore('math_quiz', newScore, 1, { questions: newTotal, time: gameTimer, streak: newStreak });
      setMathQuiz(prev => ({ ...prev, isCompleted: true }));
    }
  };

  // Enhanced Pattern Memory Game
  const startPatternGame = () => {
    const newSequence = [Math.floor(Math.random() * 4)];
    setPatternGame({
      sequence: newSequence,
      userSequence: [],
      level: 1,
      score: 0,
      showingPattern: true,
      gamePhase: 'showing'
    });
    
    setTimeout(() => {
      setPatternGame(prev => ({
        ...prev,
        showingPattern: false,
        gamePhase: 'input'
      }));
    }, 1000 * newSequence.length);
  };

  const handlePatternClick = (buttonId: number) => {
    if (patternGame.gamePhase !== 'input') return;
    
    const newUserSequence = [...patternGame.userSequence, buttonId];
    const isCorrect = newUserSequence[newUserSequence.length - 1] === patternGame.sequence[newUserSequence.length - 1];
    
    if (!isCorrect) {
      setPatternGame(prev => ({ ...prev, gamePhase: 'wrong' }));
      setTimeout(() => {
        saveScore('pattern_memory', patternGame.score, patternGame.level);
        setCurrentGame(null);
      }, 1000);
      return;
    }
    
    if (newUserSequence.length === patternGame.sequence.length) {
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
        setPatternGame(prev => ({
          ...prev,
          gamePhase: 'showing'
        }));
        
        setTimeout(() => {
          setPatternGame(prev => ({
            ...prev,
            showingPattern: false,
            gamePhase: 'input'
          }));
        }, 1000 * newSequence.length);
      }, 500);
    } else {
      setPatternGame(prev => ({
        ...prev,
        userSequence: newUserSequence
      }));
    }
  };

  // Enhanced Word Scramble
  const words = [
    'ELEPHANT', 'COMPUTER', 'HAPPINESS', 'KNOWLEDGE', 'CREATIVE', 'BUILDING', 
    'SOLUTION', 'THINKING', 'BEAUTIFUL', 'ADVENTURE', 'WONDERFUL', 'FANTASTIC',
    'EDUCATION', 'EXPERIENCE', 'FRIENDSHIP', 'INNOVATION', 'DISCOVERY', 'EXCELLENCE'
  ];

  const startWordScramble = () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const scrambled = word.split('').sort(() => Math.random() - 0.5).join('');
    
    setWordScramble({
      originalWord: word,
      scrambledWord: scrambled,
      userGuess: '',
      score: 0,
      level: 1,
      isCompleted: false,
      wordsCompleted: 0
    });
  };

  const submitWordGuess = () => {
    if (wordScramble.userGuess.toUpperCase() === wordScramble.originalWord) {
      const newScore = wordScramble.score + (wordScramble.originalWord.length * 10);
      const newWordsCompleted = wordScramble.wordsCompleted + 1;
      
      if (newWordsCompleted >= 5) {
        setWordScramble(prev => ({ ...prev, score: newScore, isCompleted: true }));
        saveScore('word_scramble', newScore, wordScramble.level);
      } else {
        const nextWord = words[Math.floor(Math.random() * words.length)];
        const nextScrambled = nextWord.split('').sort(() => Math.random() - 0.5).join('');
        
        setWordScramble({
          originalWord: nextWord,
          scrambledWord: nextScrambled,
          userGuess: '',
          score: newScore,
          level: wordScramble.level,
          isCompleted: false,
          wordsCompleted: newWordsCompleted
        });
      }
    }
  };

  // Reaction Time Game
  const startReactionTime = () => {
    setReactionTime({
      isWaiting: true,
      isReady: false,
      startTime: 0,
      bestTime: reactionTime.bestTime,
      currentTime: 0,
      attempts: reactionTime.attempts,
      averageTime: reactionTime.averageTime
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
      const newAttempts = reactionTime.attempts + 1;
      const newAverage = ((reactionTime.averageTime * reactionTime.attempts) + currentTime) / newAttempts;
      
      setReactionTime(prev => ({
        ...prev,
        currentTime,
        bestTime: Math.min(prev.bestTime, currentTime),
        attempts: newAttempts,
        averageTime: newAverage,
        isReady: false
      }));

      if (newAttempts >= 5) {
        const score = Math.max(0, 1000 - Math.floor(newAverage / 10));
        saveScore('reaction_time', score, 1, { 
          bestTime: Math.min(reactionTime.bestTime, currentTime),
          averageTime: newAverage,
          attempts: newAttempts 
        });
      }
    }
  };

  // Concentration Game
  const startConcentrationGame = () => {
    const numbers = Array.from({length: 5}, () => Math.floor(Math.random() * 100));
    setConcentrationGame({
      numbers,
      userAnswer: '',
      score: 0,
      level: 1,
      timeLeft: 10,
      isActive: true
    });

    const timer = setInterval(() => {
      setConcentrationGame(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(timer);
          return { ...prev, timeLeft: 0, isActive: false };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  };

  const submitConcentrationAnswer = () => {
    const sum = concentrationGame.numbers.reduce((a, b) => a + b, 0);
    const isCorrect = parseInt(concentrationGame.userAnswer) === sum;
    
    if (isCorrect) {
      const newScore = concentrationGame.score + (concentrationGame.level * 50);
      const newNumbers = Array.from({length: 5 + concentrationGame.level}, () => 
        Math.floor(Math.random() * 100)
      );
      
      setConcentrationGame({
        numbers: newNumbers,
        userAnswer: '',
        score: newScore,
        level: concentrationGame.level + 1,
        timeLeft: Math.max(5, 10 - concentrationGame.level),
        isActive: true
      });
    } else {
      setConcentrationGame(prev => ({ ...prev, isActive: false }));
      saveScore('concentration', concentrationGame.score, concentrationGame.level);
    }
  };

  const games = [
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Test your visual memory by matching pairs of cards',
      icon: Brain,
      color: 'bg-blue-500',
      benefits: 'Improves working memory and concentration',
      difficulty: 'Easy',
      category: 'cognitive'
    },
    {
      id: 'math_quiz',
      title: 'Speed Math',
      description: 'Solve math problems as quickly as possible',
      icon: Calculator,
      color: 'bg-green-500',
      benefits: 'Enhances numerical processing and mental agility',
      difficulty: 'Medium',
      category: 'cognitive'
    },
    {
      id: 'pattern_memory',
      title: 'Pattern Memory',
      description: 'Remember and repeat sequences of patterns',
      icon: Target,
      color: 'bg-purple-500',
      benefits: 'Strengthens sequential memory and attention',
      difficulty: 'Medium',
      category: 'cognitive'
    },
    {
      id: 'word_scramble',
      title: 'Word Scramble',
      description: 'Unscramble letters to form words',
      icon: Shuffle,
      color: 'bg-orange-500',
      benefits: 'Improves vocabulary and letter recognition',
      difficulty: 'Easy',
      category: 'cognitive'
    },
    {
      id: 'reaction_time',
      title: 'Reaction Time',
      description: 'Test your reflexes and reaction speed',
      icon: Timer,
      color: 'bg-red-500',
      benefits: 'Improves response time and alertness',
      difficulty: 'Easy',
      category: 'cognitive'
    },
    {
      id: 'concentration',
      title: 'Number Sum',
      description: 'Add numbers shown briefly on screen',
      icon: Hash,
      color: 'bg-teal-500',
      benefits: 'Enhances focus and mental arithmetic',
      difficulty: 'Hard',
      category: 'cognitive'
    },
    {
      id: 'color_match',
      title: 'Color Match',
      description: 'Match colors quickly under time pressure',
      icon: Eye,
      color: 'bg-pink-500',
      benefits: 'Enhances visual processing and reaction time',
      difficulty: 'Medium',
      category: 'cognitive'
    },
    {
      id: 'spatial_puzzle',
      title: 'Spatial Puzzle',
      description: 'Arrange pieces in correct spatial order',
      icon: Puzzle,
      color: 'bg-indigo-500',
      benefits: 'Develops spatial reasoning and problem solving',
      difficulty: 'Hard',
      category: 'cognitive'
    },
    {
      id: 'word_association',
      title: 'Word Association',
      description: 'Generate related words quickly',
      icon: BookOpen,
      color: 'bg-amber-500',
      benefits: 'Expands vocabulary and semantic memory',
      difficulty: 'Medium',
      category: 'cognitive'
    },
    {
      id: 'logic_puzzle',
      title: 'Logic Puzzles',
      description: 'Solve logical reasoning challenges',
      icon: Lightbulb,
      color: 'bg-yellow-500',
      benefits: 'Develops logical thinking and problem solving',
      difficulty: 'Hard',
      category: 'cognitive'
    },
    {
      id: 'visual_tracking',
      title: 'Visual Tracking',
      description: 'Track and click moving targets',
      icon: MousePointer,
      color: 'bg-cyan-500',
      benefits: 'Improves visual attention and coordination',
      difficulty: 'Medium',
      category: 'cognitive'
    },
    {
      id: 'cognitive_load',
      title: 'Cognitive Load',
      description: 'Handle multiple tasks simultaneously',
      icon: Layers,
      color: 'bg-violet-500',
      benefits: 'Enhances multitasking and working memory',
      difficulty: 'Hard',
      category: 'cognitive'
    },
    {
      id: 'flexibility_test',
      title: 'Mental Flexibility',
      description: 'Switch between different rule sets',
      icon: Repeat,
      color: 'bg-emerald-500',
      benefits: 'Improves cognitive flexibility and adaptation',
      difficulty: 'Hard',
      category: 'cognitive'
    },
    
    {
      id: 'racing_simulator',
      title: 'Racing Simulator',
      description: 'Experience realistic car racing on famous tracks',
      icon: Car,
      color: 'bg-red-600',
      benefits: 'Improves reaction time and hand-eye coordination',
      difficulty: 'Medium',
      category: 'photorealistic'
    },
    {
      id: 'flight_simulator',
      title: 'Flight Simulator',
      description: 'Pilot realistic aircraft through various weather conditions',
      icon: Plane,
      color: 'bg-sky-600',
      benefits: 'Enhances spatial awareness and multitasking',
      difficulty: 'Hard',
      category: 'photorealistic'
    },
    {
      id: 'city_explorer',
      title: 'City Explorer',
      description: 'Navigate through photorealistic city environments',
      icon: Building,
      color: 'bg-gray-600',
      benefits: 'Develops navigation skills and spatial memory',
      difficulty: 'Easy',
      category: 'photorealistic'
    },
    {
      id: 'nature_photographer',
      title: 'Nature Photographer',
      description: 'Capture stunning wildlife and landscapes',
      icon: Camera,
      color: 'bg-green-600',
      benefits: 'Improves observation skills and patience',
      difficulty: 'Medium',
      category: 'photorealistic'
    },
    {
      id: 'mountain_climber',
      title: 'Mountain Climber',
      description: 'Scale realistic mountain peaks with proper equipment',
      icon: Mountain,
      color: 'bg-stone-600',
      benefits: 'Builds perseverance and strategic planning',
      difficulty: 'Hard',
      category: 'photorealistic'
    },
    {
      id: 'ocean_explorer',
      title: 'Ocean Explorer',
      description: 'Dive into realistic underwater environments',
      icon: Waves,
      color: 'bg-blue-600',
      benefits: 'Enhances focus and environmental awareness',
      difficulty: 'Medium',
      category: 'photorealistic'
    },
    {
      id: 'survival_challenge',
      title: 'Survival Challenge',
      description: 'Survive in realistic wilderness environments',
      icon: Trees,
      color: 'bg-emerald-700',
      benefits: 'Develops problem-solving and resource management',
      difficulty: 'Hard',
      category: 'photorealistic'
    },
    {
      id: 'space_mission',
      title: 'Space Mission',
      description: 'Command realistic space missions and exploration',
      icon: Star,
      color: 'bg-indigo-700',
      benefits: 'Improves analytical thinking and precision',
      difficulty: 'Hard',
      category: 'photorealistic'
    }
  ];

  const cognitiveGames = games.filter(game => game.category === 'cognitive');
  const photorealisticGames = games.filter(game => game.category === 'photorealistic');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex">
      <SidebarNav />
      
      <div className="flex-1 flex gap-6 pl-80">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                <Brain className="w-8 h-8" />
                Gaming Center
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Explore cognitive training games and photorealistic experiences
              </p>
              {timerActive && (
                <div className="mt-4 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Time: {Math.floor(gameTimer / 60)}:{(gameTimer % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>

            <Tabs defaultValue="games" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="games">Games</TabsTrigger>
                <TabsTrigger value="scores">High Scores</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="games" className="space-y-8">
                {/* Cognitive Games Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Cognitive Training Games</h2>
                    <Badge variant="outline">{cognitiveGames.length} games</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cognitiveGames.map((game) => {
                      const Icon = game.icon;
                      const bestScore = scores.find(s => s.game_type === game.id)?.score || 0;
                      
                      return (
                        <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{game.title}</CardTitle>
                                <p className="text-sm text-slate-500">{game.description}</p>
                                <Badge variant="outline" className="mt-1">
                                  {game.difficulty}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground mb-3">{game.benefits}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Best: {bestScore}</span>
                              </div>
                              <Button
                                onClick={() => {
                                  setCurrentGame(game.id);
                                  setGameTimer(0);
                                  setTimerActive(false);
                                  
                                  // Initialize specific games
                                  if (game.id === 'memory') initializeMemoryGame();
                                  if (game.id === 'math_quiz') startMathQuiz();
                                  if (game.id === 'word_scramble') startWordScramble();
                                  if (game.id === 'reaction_time') startReactionTime();
                                  if (game.id === 'pattern_memory') startPatternGame();
                                  if (game.id === 'concentration') startConcentrationGame();
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
                </div>

                {/* Photorealistic Games Section */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Gamepad2 className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Photorealistic Experiences</h2>
                    <Badge variant="outline">{photorealisticGames.length} games</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {photorealisticGames.map((game) => {
                      const Icon = game.icon;
                      const bestScore = scores.find(s => s.game_type === game.id)?.score || 0;
                      
                      return (
                        <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                          <CardHeader>
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-lg ${game.color} flex items-center justify-center shadow-lg`}>
                                <Icon className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg">{game.title}</CardTitle>
                                <p className="text-sm text-slate-500">{game.description}</p>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {game.difficulty}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                    Photorealistic
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-xs text-muted-foreground mb-3">{game.benefits}</p>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="text-sm">Best: {bestScore}</span>
                              </div>
                              <Button
                                onClick={() => {
                                  toast({
                                    title: "Coming Soon!",
                                    description: `${game.title} will be available in the next update with stunning photorealistic graphics.`
                                  });
                                }}
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Preview
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                {/* Enhanced Game Area - keep existing game implementations */}
                {currentGame && (
                  <Card className="mt-6">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                          {games.find(g => g.id === currentGame)?.title}
                          {timerActive && (
                            <Badge variant="outline">
                              {Math.floor(gameTimer / 60)}:{(gameTimer % 60).toString().padStart(2, '0')}
                            </Badge>
                          )}
                        </CardTitle>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentGame(null);
                            setTimerActive(false);
                          }}
                        >
                          Close Game
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Memory Game */}
                      {currentGame === 'memory' && (
                        <div className="text-center">
                          <div className="mb-4 flex justify-center gap-6">
                            <div>Moves: {memoryGame.moves}</div>
                            <div>Score: {memoryGame.score}</div>
                            {memoryGame.isCompleted && (
                              <Badge className="bg-green-500">Completed!</Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto mb-4">
                            {memoryGame.cards.map((card) => {
                              const symbols = ['🧠', '⭐', '🎯', '💎', '🔥', '⚡', '🎨', '🚀'];
                              return (
                                <div
                                  key={card.id}
                                  onClick={() => handleMemoryCardClick(card.id)}
                                  className={`w-16 h-16 border-2 rounded-lg flex items-center justify-center cursor-pointer transition-all text-2xl ${
                                    card.flipped || card.matched
                                      ? 'bg-blue-500 text-white transform scale-105'
                                      : 'bg-slate-200 hover:bg-slate-300'
                                  } ${card.matched ? 'bg-green-500' : ''}`}
                                >
                                  {card.flipped || card.matched ? symbols[card.value] : '?'}
                                </div>
                              );
                            })}
                          </div>
                          <Button onClick={initializeMemoryGame}>
                            <RotateCcw className="w-4 h-4 mr-2" />
                            New Game
                          </Button>
                        </div>
                      )}

                      {/* Math Quiz */}
                      {currentGame === 'math_quiz' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6 flex justify-center gap-6">
                            <div>Score: {mathQuiz.score}</div>
                            <div>Question: {mathQuiz.totalQuestions + 1}/10</div>
                            <div>Streak: {mathQuiz.streak}</div>
                          </div>
                          {!mathQuiz.isCompleted ? (
                            <div className="space-y-4">
                              <div className="text-4xl font-bold p-6 bg-slate-100 rounded-lg">
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
                              <p className="text-lg">Final Score: {mathQuiz.score}</p>
                              <p>Best Streak: {mathQuiz.streak}</p>
                              <Button onClick={startMathQuiz} className="w-full">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Play Again
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Pattern Memory Game */}
                      {currentGame === 'pattern_memory' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6 flex justify-center gap-6">
                            <div>Level: {patternGame.level}</div>
                            <div>Score: {patternGame.score}</div>
                          </div>
                          <div className="mb-4">
                            <p className="mb-2">
                              {patternGame.gamePhase === 'showing' && 'Watch the pattern...'}
                              {patternGame.gamePhase === 'input' && 'Repeat the pattern!'}
                              {patternGame.gamePhase === 'correct' && 'Correct! Next level...'}
                              {patternGame.gamePhase === 'wrong' && 'Wrong! Game Over.'}
                              {patternGame.gamePhase === 'waiting' && 'Click Start to begin!'}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            {[0, 1, 2, 3].map((buttonId) => (
                              <button
                                key={buttonId}
                                onClick={() => handlePatternClick(buttonId)}
                                disabled={patternGame.gamePhase !== 'input'}
                                className={`w-20 h-20 rounded-lg border-2 transition-all ${
                                  patternGame.showingPattern && patternGame.sequence[patternGame.userSequence.length] === buttonId
                                    ? 'bg-yellow-400 border-yellow-600'
                                    : 'bg-blue-400 border-blue-600 hover:bg-blue-500'
                                } ${patternGame.gamePhase !== 'input' ? 'opacity-50' : ''}`}
                              >
                                {buttonId + 1}
                              </button>
                            ))}
                          </div>
                          {patternGame.gamePhase === 'waiting' && (
                            <Button onClick={startPatternGame}>
                              <Play className="w-4 h-4 mr-2" />
                              Start Game
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Word Scramble */}
                      {currentGame === 'word_scramble' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6 flex justify-center gap-6">
                            <div>Score: {wordScramble.score}</div>
                            <div>Words: {wordScramble.wordsCompleted}/5</div>
                          </div>
                          {!wordScramble.isCompleted ? (
                            <div className="space-y-4">
                              <div className="text-3xl font-bold p-6 bg-slate-100 rounded-lg tracking-wider">
                                {wordScramble.scrambledWord}
                              </div>
                              <Input
                                type="text"
                                value={wordScramble.userGuess}
                                onChange={(e) => setWordScramble(prev => ({ ...prev, userGuess: e.target.value }))}
                                placeholder="Unscramble the word"
                                className="text-center text-xl"
                                onKeyPress={(e) => e.key === 'Enter' && submitWordGuess()}
                              />
                              <Button onClick={submitWordGuess} className="w-full">
                                <Check className="w-4 h-4 mr-2" />
                                Submit Answer
                              </Button>
                              <p className="text-sm text-muted-foreground">
                                Hint: {wordScramble.originalWord.length} letters
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold">Excellent!</h3>
                              <p className="text-lg">Final Score: {wordScramble.score}</p>
                              <Button onClick={startWordScramble} className="w-full">
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Play Again
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Reaction Time */}
                      {currentGame === 'reaction_time' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6 flex justify-center gap-6 text-sm">
                            <div>Best: {reactionTime.bestTime === Infinity ? 'N/A' : `${reactionTime.bestTime}ms`}</div>
                            <div>Attempts: {reactionTime.attempts}/5</div>
                            {reactionTime.averageTime > 0 && (
                              <div>Avg: {Math.round(reactionTime.averageTime)}ms</div>
                            )}
                          </div>
                          <div 
                            onClick={handleReactionClick}
                            className={`w-64 h-64 mx-auto rounded-lg cursor-pointer transition-all flex items-center justify-center ${
                              reactionTime.isWaiting ? 'bg-red-500' : 
                              reactionTime.isReady ? 'bg-green-500' : 'bg-gray-300'
                            }`}
                          >
                            <span className="text-white text-xl font-bold">
                              {reactionTime.isWaiting ? 'Wait for green...' :
                               reactionTime.isReady ? 'CLICK NOW!' : 'Click to Start'}
                            </span>
                          </div>
                          {reactionTime.currentTime > 0 && (
                            <p className="mt-4 text-lg">Last: {reactionTime.currentTime}ms</p>
                          )}
                          <div className="mt-4">
                            <Button onClick={startReactionTime}>
                              <RotateCcw className="w-4 h-4 mr-2" />
                              {reactionTime.attempts === 0 ? 'Start Test' : 'Next Attempt'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Concentration Game */}
                      {currentGame === 'concentration' && (
                        <div className="text-center max-w-md mx-auto">
                          <div className="mb-6 flex justify-center gap-6">
                            <div>Score: {concentrationGame.score}</div>
                            <div>Level: {concentrationGame.level}</div>
                            <div>Time: {concentrationGame.timeLeft}s</div>
                          </div>
                          {concentrationGame.isActive ? (
                            <div className="space-y-4">
                              <div className="text-2xl font-bold p-4 bg-slate-100 rounded-lg">
                                Add these numbers:
                              </div>
                              <div className="text-4xl font-bold p-6 bg-blue-100 rounded-lg">
                                {concentrationGame.numbers.join(' + ')}
                              </div>
                              <Progress value={(concentrationGame.timeLeft / (Math.max(5, 10 - concentrationGame.level + 1))) * 100} />
                              <Input
                                type="number"
                                value={concentrationGame.userAnswer}
                                onChange={(e) => setConcentrationGame(prev => ({ ...prev, userAnswer: e.target.value }))}
                                placeholder="Sum"
                                className="text-center text-xl"
                                onKeyPress={(e) => e.key === 'Enter' && submitConcentrationAnswer()}
                              />
                              <Button onClick={submitConcentrationAnswer} className="w-full">
                                Submit
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <h3 className="text-2xl font-bold">
                                {concentrationGame.score > 0 ? 'Time\'s Up!' : 'Get Ready!'}
                              </h3>
                              {concentrationGame.score > 0 && (
                                <p className="text-lg">Final Score: {concentrationGame.score}</p>
                              )}
                              <Button onClick={startConcentrationGame} className="w-full">
                                <Play className="w-4 h-4 mr-2" />
                                {concentrationGame.score > 0 ? 'Play Again' : 'Start Game'}
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Placeholder for other games */}
                      {!['memory', 'math_quiz', 'pattern_memory', 'word_scramble', 'reaction_time', 'concentration'].includes(currentGame) && (
                        <div className="text-center">
                          <p className="text-muted-foreground mb-4">
                            {games.find(g => g.id === currentGame)?.title} - Advanced implementation coming soon!
                          </p>
                          <p className="text-sm">
                            {games.find(g => g.id === currentGame)?.benefits}
                          </p>
                          <Button 
                            onClick={() => setCurrentGame(null)}
                            className="mt-4"
                          >
                            Choose Another Game
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
                              onClick={() => setCurrentGame(save.game_type)}
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
