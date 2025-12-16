import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotificationDropdown() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
    >
      <Bell className="h-5 w-5" />
      <span className="sr-only">Notifications</span>
    </Button>
  );
}

