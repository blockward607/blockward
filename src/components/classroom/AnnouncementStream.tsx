
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface Announcement {
  id: string;
  classroom_id: string | null;
  created_at: string;
  title: string;
  message: string;
  created_by: string | null;
}

interface AnnouncementStreamProps {
  classroomId: string;
  isTeacher: boolean;
}

export const AnnouncementStream: React.FC<AnnouncementStreamProps> = ({
  classroomId,
  isTeacher,
}) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  // State for new announcement
  const [form, setForm] = useState({ title: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("classroom_id", classroomId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch announcements",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    // Optionally, use Realtime subscription here in future!
  }, [classroomId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast({
        variant: "destructive",
        title: "Missing fields",
        description: "Please enter a title and message",
      });
      return;
    }
    try {
      setSubmitting(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { error } = await supabase.from("notifications").insert({
        title: form.title,
        message: form.message,
        classroom_id: classroomId,
        created_by: session.user.id,
        type: "announcement",
      });
      if (error) throw error;
      toast({
        title: "Announcement Posted",
        description: "The announcement is now visible to your students.",
      });
      setForm({ title: "", message: "" });
      fetchAnnouncements();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {isTeacher && (
        <Card className="p-4 mb-6 bg-black/30 border-purple-500/20">
          <form className="space-y-3" onSubmit={handleCreate}>
            <Input
              placeholder="Announcement title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              disabled={submitting}
            />
            <Textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              disabled={submitting}
              rows={3}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting || !form.title.trim()}>
                {submitting ? "Posting..." : "Post Announcement"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        ) : announcements.length === 0 ? (
          <Card className="p-4 bg-black/40 border-purple-500/20 text-center">
            <span className="text-gray-400">No announcements yet</span>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card
                key={a.id}
                className="p-4 bg-black/50 border-purple-500/10 flex flex-col gap-1"
              >
                <span className="text-lg font-semibold">{a.title}</span>
                <span className="text-gray-300 whitespace-pre-wrap">{a.message}</span>
                <span className="text-xs text-gray-400 mt-2">
                  {new Date(a.created_at).toLocaleDateString()}{" "}
                  {new Date(a.created_at).toLocaleTimeString()}
                </span>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
