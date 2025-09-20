import React from 'react';
import { Calendar } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import CreateEventDialog from '@/components/CreateEventDialog';
import SidebarNav from '@/components/SidebarNav';
import RightSidebar from '@/components/RightSidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import MobileBottomNav from '@/components/MobileBottomNav';

const Events = () => {
  const { events, loading, updateAttendance } = useEvents();
  const isMobile = useIsMobile();

  const handleAttendanceChange = async (eventId: string, status: 'going' | 'interested' | 'not_going') => {
    await updateAttendance(eventId, status);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-slate-900 dark:via-purple-900 dark:to-slate-900 flex relative">
      <SidebarNav />
      
      <div className="flex-1 px-4" style={{ marginLeft: '320px', marginRight: '384px' }}>
        <main className="w-full max-w-2xl border-x border-purple-200 dark:border-purple-800 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-purple-200 dark:border-purple-800 p-4 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Events</h1>
              </div>
              <CreateEventDialog />
            </div>
          </div>

          {/* Events List */}
          <div className="p-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-48 bg-muted rounded-lg mb-3"></div>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No upcoming events</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create an event in your community!
                </p>
                <CreateEventDialog
                  trigger={
                    <button className="text-primary hover:underline">
                      Create your first event
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="space-y-6">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onAttendanceChange={handleAttendanceChange}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
      
      {!isMobile && <RightSidebar />}
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default Events;