import React, { useState } from 'react';
import { Users, PlusCircle } from 'lucide-react';
import { useCollaboration } from '@/hooks/useCollaboration';
import CollaborationInvites from '@/components/CollaborationInvites';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const Collaboration = () => {
  const { invites, drafts, createDraft, loading, refetchInvites, refetchDrafts } = useCollaboration();
  const isMobile = useIsMobile();
  const [isCreateDraftOpen, setIsCreateDraftOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftContent, setDraftContent] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className={`flex-1 ${isMobile ? 'px-2 pb-20' : 'px-4'}`} style={isMobile ? {} : { marginLeft: '320px', marginRight: '384px' }}>
        <main className={`w-full ${isMobile ? '' : 'max-w-2xl border-x border-purple-200 dark:border-purple-800'} bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto`}>
          {/* Header */}
          <div className={`sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl ${isMobile ? '' : 'border-b border-purple-200 dark:border-purple-800'} p-4 z-10`}>
            <div className="flex items-center space-x-3">
              <Users className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} text-primary`} />
              <h1 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-foreground`}>Collaboration</h1>
            </div>
          </div>

          {/* Content */}
          <div className={`${isMobile ? 'p-2' : 'p-4'}`}>
            <Tabs defaultValue="invites" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="invites" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Invites ({invites.length})</span>
                </TabsTrigger>
                <TabsTrigger value="drafts" className="flex items-center space-x-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Drafts ({drafts.length})</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="invites" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Collaboration Invites</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage your collaboration invitations
                    </p>
                  </CardHeader>
                  <CardContent>
                    <CollaborationInvites 
                      invites={invites} 
                      onInviteUpdate={refetchInvites}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="drafts" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Collaborative Drafts</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Work together on posts before publishing
                    </p>
                  </CardHeader>
                  <CardContent>
                    {drafts.length === 0 ? (
                      <div className="text-center py-8">
                        <PlusCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">No collaborative drafts</h3>
                        <p className="text-muted-foreground mb-4">
                          Create or join collaborative drafts to work together on posts.
                        </p>
                        <Dialog open={isCreateDraftOpen} onOpenChange={setIsCreateDraftOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <PlusCircle className="w-4 h-4 mr-2" />
                              Create Draft
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Create Collaborative Draft</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                  id="title"
                                  placeholder="Enter draft title..."
                                  value={draftTitle}
                                  onChange={(e) => setDraftTitle(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="content">Content (optional)</Label>
                                <Textarea
                                  id="content"
                                  placeholder="Start writing your draft..."
                                  value={draftContent}
                                  onChange={(e) => setDraftContent(e.target.value)}
                                  rows={5}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsCreateDraftOpen(false);
                                  setDraftTitle('');
                                  setDraftContent('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={async () => {
                                  if (draftTitle.trim()) {
                                    await createDraft(draftTitle, draftContent);
                                    setIsCreateDraftOpen(false);
                                    setDraftTitle('');
                                    setDraftContent('');
                                  }
                                }}
                                disabled={!draftTitle.trim() || loading}
                              >
                                {loading ? 'Creating...' : 'Create Draft'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {drafts.map((draft) => (
                          <Card key={draft.id} className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{draft.title}</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {draft.content.slice(0, 100)}...
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <span className="text-xs text-muted-foreground">
                                    {draft.collaborators.length} collaborator(s)
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {draft.status}
                                  </span>
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Collaboration;