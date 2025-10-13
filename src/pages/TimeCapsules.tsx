import React, { useState } from 'react';
import { useTimeCapsules } from '@/hooks/useTimeCapsules';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Archive, Clock, Lock, PlusCircle, Eye, Trash } from 'lucide-react';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { format, isPast } from 'date-fns';

const TimeCapsules = () => {
  const { capsules, loading, createCapsule, deleteCapsule, revealCapsule } = useTimeCapsules();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [revealDate, setRevealDate] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'recipients' | 'public'>('private');
  const isMobile = useIsMobile();

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !revealDate) return;
    
    await createCapsule({
      title,
      content,
      media_urls: [],
      reveal_date: revealDate,
      recipients: [],
      visibility
    });
    
    setTitle('');
    setContent('');
    setRevealDate('');
    setVisibility('private');
    setOpen(false);
  };

  const canReveal = (capsule: any) => {
    return !capsule.is_revealed && isPast(new Date(capsule.reveal_date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      {!isMobile && <SidebarNav />}
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10 space-y-3`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Archive className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
                <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Time Capsules</h1>
              </div>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button size={isMobile ? "sm" : "default"}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Time Capsule</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    <Textarea 
                      placeholder="What do you want to remember?" 
                      value={content} 
                      onChange={(e) => setContent(e.target.value)}
                      rows={6}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Reveal Date</label>
                      <Input 
                        type="datetime-local" 
                        value={revealDate} 
                        onChange={(e) => setRevealDate(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    <Select value={visibility} onValueChange={(val: any) => setVisibility(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">🔒 Private - Only Me</SelectItem>
                        <SelectItem value="recipients">👥 Select Recipients</SelectItem>
                        <SelectItem value="public">🌍 Public</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleCreate} disabled={loading} className="w-full">
                      Create Time Capsule
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <p className="text-sm text-muted-foreground">
              Create time-locked memories and messages to be revealed in the future to yourself or friends.
            </p>
          </div>

          {/* Capsules List */}
          <div className="p-4 space-y-4">
            {capsules.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No time capsules yet</h3>
                  <p className="text-muted-foreground">
                    Create a time capsule to preserve memories for the future
                  </p>
                </CardContent>
              </Card>
            ) : (
              capsules.map((capsule) => (
                <Card key={capsule.id} className={`transition-all hover:shadow-lg duration-fast ${capsule.is_revealed ? 'border-green-500' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {capsule.is_revealed ? (
                            <Eye className="w-5 h-5 text-green-500" />
                          ) : (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          )}
                          <Badge variant={capsule.is_revealed ? "default" : "secondary"}>
                            {capsule.is_revealed ? 'Revealed' : 'Sealed'}
                          </Badge>
                        </div>
                        <CardTitle>{capsule.title}</CardTitle>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteCapsule(capsule.id)}
                      >
                        <Trash className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {capsule.is_revealed ? (
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm whitespace-pre-wrap">{capsule.content}</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-muted/50 rounded-lg text-center">
                        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          This capsule is sealed until {format(new Date(capsule.reveal_date), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {capsule.is_revealed 
                            ? `Revealed ${format(new Date(capsule.revealed_at || capsule.reveal_date), 'MMM d, yyyy')}`
                            : `Opens ${format(new Date(capsule.reveal_date), 'MMM d, yyyy')}`
                          }
                        </span>
                      </div>
                      {canReveal(capsule) && (
                        <Button 
                          size="sm"
                          onClick={() => revealCapsule(capsule.id)}
                          disabled={loading}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Reveal Now
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default TimeCapsules;