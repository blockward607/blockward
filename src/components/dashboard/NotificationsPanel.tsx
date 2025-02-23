
import { useState } from "react";
import { Bell, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Notification } from "@/types/notification";

interface NotificationsPanelProps {
  notifications: Partial<Notification>[];
}

export const NotificationsPanel = ({ notifications }: NotificationsPanelProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="p-6 glass-card">
      <div 
        className="flex justify-between items-center mb-4 cursor-pointer" 
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-semibold">Recent Notifications</h2>
        </div>
        {expanded ? <ChevronUp /> : <ChevronDown />}
      </div>
      
      {expanded && (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className="p-4 bg-purple-900/10 border-purple-500/20">
              <h3 className="font-semibold text-purple-300">{notification.title}</h3>
              <p className="text-sm text-gray-300">{notification.message}</p>
              <span className="text-xs text-gray-400">
                {notification.created_at ? new Date(notification.created_at).toLocaleDateString() : 'Date not available'}
              </span>
            </Card>
          ))}
        </div>
      )}
    </Card>
  );
};
