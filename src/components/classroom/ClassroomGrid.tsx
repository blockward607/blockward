
import { Card } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { ClassroomHeader } from "./ClassroomHeader";
import { StudentCountIndicator } from "./StudentCountIndicator";
import { ClassroomActions } from "./ClassroomActions";
import { useClassroomData } from "./useClassroomData";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Classroom = Database['public']['Tables']['classrooms']['Row'];

interface ClassroomGridProps {
  classroom: Classroom;
  onDelete?: (classroomId: string) => void;
  userRole?: string | null;
}

const colorGradients = [
  "from-purple-700 via-purple-500 to-indigo-600",
  "from-blue-700 via-cyan-500 to-blue-400",
  "from-green-700 via-emerald-500 to-lime-400",
  "from-pink-600 via-fuchsia-500 to-rose-400",
  "from-yellow-500 via-amber-400 to-orange-400",
  "from-indigo-800 via-indigo-600 to-purple-400",
];

export const ClassroomGrid = ({ classroom, onDelete = () => {}, userRole }: ClassroomGridProps) => {
  const { userRole: detectedRole, studentCount } = useClassroomData(classroom.id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Pick a color based on class name hash, so it's consistent.
  const colorIdx = classroom.name
    ? classroom.name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % colorGradients.length
    : 0;
  const gradient = colorGradients[colorIdx];

  // State for join action (for student)
  const [joining, setJoining] = useState(false);

  // We need to display classroom code for students, but smaller & subtle.
  const [classCode, setClassCode] = useState<string | null>(null);

  const fetchClassroomCode = async () => {
    setClassCode(null);
    // Classroom code (if exists) from classroom_codes table, only active, not expired
    try {
      const { data, error } = await supabase
        .from("classroom_codes")
        .select("code")
        .eq("classroom_id", classroom.id)
        .eq("is_active", true)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.code) setClassCode(data.code);
      else setClassCode(null);
    } catch (e) {
      setClassCode(null);
    }
  };

  // On mount, fetch code (students only)
  React.useEffect(() => {
    if (userRole === "student") fetchClassroomCode();
    // eslint-disable-next-line
  }, [classroom.id, userRole]);

  // Handle join action
  const handleJoinClass = async () => {
    if (!classCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This classroom doesn't have an active join code.",
      });
      return;
    }
    if (!user) {
      toast({
        variant: "destructive",
        title: "Not logged in",
        description: "Please sign in to join a class."
      });
      return;
    }
    setJoining(true);
    // Get student profile ID
    const { data: studentProfile } = await supabase
      .from("students")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!studentProfile || !studentProfile.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Your student profile could not be found."
      });
      setJoining(false);
      return;
    }
    // Call join_classroom_with_code database function
    const { data, error } = await supabase.rpc("join_classroom_with_code", {
      p_code: classCode,
      p_student_id: studentProfile.id
    });
    setJoining(false);
    if (error || !data) {
      toast({
        variant: "destructive",
        title: "Join Failed",
        description: error?.message || "Couldn't join class. Make sure you haven't already joined.",
      });
      return;
    }
    if (!data.success) {
      toast({
        variant: "destructive",
        title: "Join Failed",
        description: data.error || "Couldn't join class. Make sure you haven't already joined.",
      });
      return;
    }
    toast({
      title: "Joined!",
      description: `Welcome to ${classroom.name}`,
    });
    // Go to class details
    navigate(`/class/${classroom.id}`);
  };

  // Render student classroom card
  if (userRole === "student") {
    return (
      <Card
        className={`transition-all shadow-xl hover:scale-105 cursor-pointer bg-gradient-to-br ${gradient} text-white min-h-[210px] flex flex-col`}
        onClick={() => navigate(`/class/${classroom.id}`)}
        style={{ border: "2px solid rgba(255,255,255,.10)", boxShadow: "0 8px 32px rgba(80,0,240,0.09)" }}
      >
        <div className="flex-1 flex flex-col gap-2 p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg sm:text-xl font-semibold truncate drop-shadow">{classroom.name}</h3>
            {studentCount !== undefined &&
              <StudentCountIndicator count={studentCount} />}
          </div>
          {classroom.description && (
            <p className="text-sm text-purple-100/80 truncate">{classroom.description}</p>
          )}
        </div>
        <div className="flex items-center justify-between p-3 pt-2">
          {classCode ?
            <span className="text-[13px] bg-white/10 border border-white/10 px-3 py-[2px] font-mono rounded text-white tracking-[0.12em]" style={{letterSpacing: "0.15em"}}>
              {classCode}
            </span>
            :
            <span className="text-xs text-purple-100/80 italic">No code</span>
          }
          <Button
            type="button"
            size="sm"
            className="bg-white/90 hover:bg-white/100 text-purple-700 font-semibold rounded-full px-5 py-1 shadow"
            style={{ fontSize: "13px" }}
            disabled={joining || !classCode}
            onClick={e => { e.stopPropagation(); handleJoinClass(); }}
          >
            {joining ? <Loader2 className="animate-spin w-4 h-4" /> : "Join"}
          </Button>
        </div>
      </Card>
    );
  }

  // Teacher/other role default (as before)
  return (
    <div className="space-y-4">
      <Card 
        className="p-4 glass-card hover:bg-purple-900/10 transition-all cursor-pointer"
        onClick={() => navigate(`/class/${classroom.id}`)}
      >
        <div className="flex flex-col h-full">
          <ClassroomHeader
            name={classroom.name}
            description={classroom.description}
            id={classroom.id}
            userRole={userRole || detectedRole}
            onDelete={onDelete}
          />
          <div className="mt-auto">
            <StudentCountIndicator count={studentCount} />
            <ClassroomActions 
              userRole={userRole || detectedRole}
              classroomId={classroom.id}
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

