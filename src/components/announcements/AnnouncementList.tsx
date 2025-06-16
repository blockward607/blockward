
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trash2, Users, User, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  classroom_id?: string | null;
  recipients?: string[] | null;
  type?: string;
}

interface AnnouncementListProps {
  announcements: Notification[];
  loading: boolean;
  isTeacher: boolean;
  onAnnouncementDeleted: () => void;
}

export const AnnouncementList = ({ 
  announcements, 
  loading, 
  isTeacher,
  onAnnouncementDeleted
}: AnnouncementListProps) => {
  const { toast } = useToast();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      setDeletingId(id);
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Announcement deleted successfully"
      });
      
      onAnnouncementDeleted();
    } catch (error: any) {
      console.error("Error deleting announcement:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete announcement"
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getTargetingInfo = (announcement: Notification) => {
    if (announcement.recipients && announcement.recipients.length > 0) {
      return {
        icon: User,
        text: `${announcement.recipients.length} student${announcement.recipients.length > 1 ? 's' : ''}`,
        color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
      };
    } else if (announcement.classroom_id) {
      return {
        icon: Users,
        text: "Classroom",
        color: "bg-green-500/20 text-green-400 border-green-500/30"
      };
    } else {
      return {
        icon: Globe,
        text: "All students",
        color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card className="p-6 text-center bg-black/50 border-purple-500/20">
        <p className="text-gray-400">No announcements yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map((announcement) => {
        const targetInfo = getTargetingInfo(announcement);
        const TargetIcon = targetInfo.icon;
        
        return (
          <Card key={announcement.id} className="p-6 bg-black/50 border-purple-500/30 relative">
            <div className="flex justify-between items-start">
              <div className="flex-1 mr-8">
                <h3 className="text-xl font-bold mb-2">{announcement.title}</h3>
                <div className="text-sm text-gray-400 mb-4 flex flex-wrap gap-2 items-center">
                  <span>Posted {new Date(announcement.created_at).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{new Date(announcement.created_at).toLocaleTimeString()}</span>
                  <span>•</span>
                  <Badge className={`text-xs ${targetInfo.color}`}>
                    <TargetIcon className="w-3 h-3 mr-1" />
                    {targetInfo.text}
                  </Badge>
                </div>
              </div>
              
              {isTeacher && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-4 right-4 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#25293A] border border-purple-500/30">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this announcement? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-transparent border-purple-500/30 hover:bg-purple-600/20 text-white">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                        disabled={deletingId === announcement.id}
                      >
                        {deletingId === announcement.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            
            <p className="text-gray-300 whitespace-pre-wrap">{announcement.message}</p>
          </Card>
        );
      })}
    </div>
  );
};
