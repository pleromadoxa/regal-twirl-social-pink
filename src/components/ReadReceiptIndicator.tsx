import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadReceiptIndicatorProps {
  isRead: boolean;
  isSent: boolean;
  className?: string;
}

export const ReadReceiptIndicator: React.FC<ReadReceiptIndicatorProps> = ({
  isRead,
  isSent,
  className,
}) => {
  if (!isSent) {
    return (
      <Check className={cn('w-3 h-3 text-muted-foreground', className)} />
    );
  }

  if (isRead) {
    return (
      <CheckCheck className={cn('w-3 h-3 text-primary', className)} />
    );
  }

  return (
    <CheckCheck className={cn('w-3 h-3 text-muted-foreground', className)} />
  );
};
