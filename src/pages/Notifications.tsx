
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    subscribeToNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notifications"
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev]);
          toast({
            title: payload.new.title,
            description: payload.new.message,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Notifications</h1>
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="p-4">
            <div className="text-center text-gray-500">
              No notifications yet
            </div>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-full bg-purple-600/20">
                  <Bell className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
