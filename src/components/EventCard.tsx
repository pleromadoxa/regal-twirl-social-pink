import React from 'react';
import { Calendar, MapPin, Users, Globe, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Event } from '@/hooks/useEvents';
import { formatDistanceToNow, format } from 'date-fns';
import UserLink from './UserLink';

interface EventCardProps {
  event: Event;
  onAttendanceChange: (eventId: string, status: 'going' | 'interested' | 'not_going') => void;
}

const EventCard = ({ event, onAttendanceChange }: EventCardProps) => {
  const isUpcoming = new Date(event.starts_at) > new Date();
  const attendanceButtons = [
    { status: 'going' as const, label: 'Going', variant: 'default' as const },
    { status: 'interested' as const, label: 'Interested', variant: 'secondary' as const },
    { status: 'not_going' as const, label: 'Can\'t go', variant: 'outline' as const },
  ];

  return (
    <Card className="overflow-hidden">
      {event.cover_image_url && (
        <div className="h-48 overflow-hidden">
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center mt-2 space-x-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={event.profiles.avatar_url} />
                <AvatarFallback>
                  {event.profiles.display_name?.[0]?.toUpperCase() || 
                   event.profiles.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <UserLink
                userId={event.user_id}
                username={event.profiles.username}
                displayName={event.profiles.display_name}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {event.profiles.display_name || event.profiles.username}
              </UserLink>
            </div>
          </div>
          {event.is_online && (
            <Badge variant="secondary" className="ml-2">
              <Globe className="w-3 h-3 mr-1" />
              Online
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {event.description && (
          <p className="text-muted-foreground text-sm line-clamp-3">
            {event.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
            <div>
              <div className="font-medium">
                {format(new Date(event.starts_at), 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {format(new Date(event.starts_at), 'h:mm a')}
                {event.ends_at && (
                  <span> - {format(new Date(event.ends_at), 'h:mm a')}</span>
                )}
              </div>
            </div>
          </div>

          {event.location && !event.is_online && (
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>
              {event.attendees_count} going
              {event.max_attendees && ` • ${event.max_attendees} max`}
            </span>
          </div>
        </div>

        {isUpcoming && (
          <div className="flex flex-wrap gap-2 pt-2">
            {attendanceButtons.map(({ status, label, variant }) => (
              <Button
                key={status}
                size="sm"
                variant={event.userAttendance === status ? 'default' : variant}
                onClick={() => onAttendanceChange(event.id, status)}
                className="text-xs"
              >
                {label}
              </Button>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-1">
          Created {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;