import React, { useState } from 'react';
import { CalendarPlus, MapPin, Globe, Users, Clock, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEvents } from '@/hooks/useEvents';

interface CreateEventDialogProps {
  trigger?: React.ReactNode;
}

const CreateEventDialog = ({ trigger }: CreateEventDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    starts_at: '',
    ends_at: '',
    is_online: false,
    max_attendees: '',
    cover_image_url: ''
  });

  const { createEvent, loading } = useEvents();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      ends_at: formData.ends_at || undefined,
      cover_image_url: formData.cover_image_url || undefined
    };

    const success = await createEvent(eventData);
    if (success) {
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        location: '',
        starts_at: '',
        ends_at: '',
        is_online: false,
        max_attendees: '',
        cover_image_url: ''
      });
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <CalendarPlus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your event"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="starts_at">Start Date & Time *</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              value={formData.starts_at}
              onChange={(e) => handleInputChange('starts_at', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ends_at">End Date & Time</Label>
            <Input
              id="ends_at"
              type="datetime-local"
              value={formData.ends_at}
              onChange={(e) => handleInputChange('ends_at', e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_online"
              checked={formData.is_online}
              onCheckedChange={(checked) => handleInputChange('is_online', checked)}
            />
            <Label htmlFor="is_online" className="flex items-center">
              <Globe className="w-4 h-4 mr-1" />
              Online Event
            </Label>
          </div>

          {!formData.is_online && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="max_attendees">Max Attendees</Label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                placeholder="Leave empty for unlimited"
                className="pl-10"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover_image_url">Cover Image URL</Label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="cover_image_url"
                value={formData.cover_image_url}
                onChange={(e) => handleInputChange('cover_image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog;