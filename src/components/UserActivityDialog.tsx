
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
}

interface UserActivityDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserActivityDialog = ({ user, isOpen, onClose }: UserActivityDialogProps) => {
  // Sample activity data - you can replace this with real data from your backend
  const activityLogs = [
    {
      id: '1',
      action: 'LOGIN',
      details: 'User logged in from Chrome browser',
      created_at: new Date().toISOString(),
      ip_address: '192.168.1.1'
    },
    {
      id: '2',
      action: 'POST_CREATED',
      details: 'Created a new post with image',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: '3',
      action: 'PROFILE_UPDATED',
      details: 'Updated profile information',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            User Activity - {user?.display_name || user?.username}
          </DialogTitle>
        </DialogHeader>
        
        {user && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">
                {user.display_name?.[0] || user.username?.[0] || '?'}
              </div>
              <div>
                <p className="font-semibold">{user.display_name || user.username}</p>
                <p className="text-sm text-muted-foreground">@{user.username}</p>
              </div>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">{log.action}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm">{log.details}</p>
                      {log.ip_address && (
                        <p className="text-xs text-muted-foreground mt-1">IP: {log.ip_address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserActivityDialog;
