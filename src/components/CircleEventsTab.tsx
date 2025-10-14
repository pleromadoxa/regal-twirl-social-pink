import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useCircleEvents } from '@/hooks/useCircleEvents';
import { Calendar, MapPin, Video, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';

interface CircleEventsTabProps {
  circleId: string;
}

export const CircleEventsTab = ({ circleId }: CircleEventsTabProps) => {
  const { events, loading, createEvent } = useCircleEvents(circleId);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    starts_at: '',
    ends_at: '',
    is_online: false,
    event_link: '',
    max_attendees: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createEvent({
      ...formData,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
    });
    if (result) {
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        starts_at: '',
        ends_at: '',
        is_online: false,
        event_link: '',
        max_attendees: ''
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading events...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Circle Events</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Circle Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Event Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_online}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
                />
                <Label>Online Event</Label>
              </div>
              {formData.is_online ? (
                <div>
                  <Label>Event Link</Label>
                  <Input
                    type="url"
                    value={formData.event_link}
                    onChange={(e) => setFormData({ ...formData, event_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              ) : (
                <div>
                  <Label>Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.starts_at}
                    onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.ends_at}
                    onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Max Attendees (optional)</Label>
                <Input
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              <Button type="submit" className="w-full">Create Event</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No events yet. Create one to get started!</p>
          </Card>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-lg mb-2">{event.title}</h4>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(event.starts_at), 'PPp')}
                    </div>
                    {event.is_online ? (
                      <div className="flex items-center gap-2 text-primary">
                        <Video className="w-4 h-4" />
                        Online Event
                      </div>
                    ) : (
                      event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )
                    )}
                    {event.max_attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Max {event.max_attendees} attendees
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm">RSVP</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
