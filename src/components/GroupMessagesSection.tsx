
import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';

const GroupMessagesSection = () => {
  return (
    <div className="p-4">
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No group conversations yet</p>
        <p className="text-sm">Create or join a group to start messaging</p>
      </div>
    </div>
  );
};

export default GroupMessagesSection;
