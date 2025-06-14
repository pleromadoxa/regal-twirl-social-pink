
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Users, Star, Clock, Trophy } from 'lucide-react';
import GamePopup from '@/components/GamePopup';
import { useState } from 'react';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const games = [
    {
      id: 'tic-tac-toe',
      title: 'Tic Tac Toe',
      description: 'Classic 3x3 grid game',
      players: '2 Players',
      duration: '2-5 min',
      difficulty: 'Easy',
      rating: 4.2,
      image: '/lovable-uploads/game-placeholder.png'
    },
    {
      id: 'word-puzzle',
      title: 'Word Puzzle',
      description: 'Find words in the grid',
      players: '1 Player',
      duration: '5-10 min',
      difficulty: 'Medium',
      rating: 4.5,
      image: '/lovable-uploads/game-placeholder.png'
    },
    {
      id: 'memory-cards',
      title: 'Memory Cards',
      description: 'Match pairs of cards',
      players: '1-2 Players',
      duration: '3-7 min',
      difficulty: 'Easy',
      rating: 4.0,
      image: '/lovable-uploads/game-placeholder.png'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 flex gap-8 pl-80 pr-[420px]">
        <main className="flex-1 border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl max-w-3xl mx-auto">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Gamepad2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Games</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Card key={game.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <CardHeader className="p-4">
                    <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg mb-3 flex items-center justify-center">
                      <Gamepad2 className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle className="text-lg text-gray-900 dark:text-gray-100">{game.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Users className="w-4 h-4" />
                          {game.players}
                        </div>
                        <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          {game.duration}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {game.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {game.rating}
                        </div>
                      </div>

                      <Button 
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        onClick={() => setSelectedGame(game.id)}
                      >
                        Play Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Leaderboard Section */}
            <div className="mt-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((rank) => (
                      <div key={rank} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            rank === 1 ? 'bg-yellow-500' : 
                            rank === 2 ? 'bg-gray-400' : 
                            rank === 3 ? 'bg-amber-600' : 'bg-purple-500'
                          }`}>
                            {rank}
                          </div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            Player {rank}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600 dark:text-purple-400">
                            {Math.floor(Math.random() * 1000) + 500} pts
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.floor(Math.random() * 20) + 5} games
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
      
      <RightSidebar />

      {/* Game Popup */}
      {selectedGame && (
        <GamePopup
          gameId={selectedGame}
          isOpen={!!selectedGame}
          onClose={() => setSelectedGame(null)}
        />
      )}
    </div>
  );
};

export default Games;
