
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InviteStudents } from "@/components/classroom/InviteStudents";
import { useEffect, useState } from "react";

const ClassroomInvite = () => {
  const { classroomId, inviteToken } = useParams<{ classroomId: string; inviteToken: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentClassroomId, setCurrentClassroomId] = useState<string | null>(null);

  useEffect(() => {
    // Extract classroomId from either params or URL
    const extractClassroomId = () => {
      // If classroomId is in params, use it
      if (classroomId) {
        setCurrentClassroomId(classroomId);
        return;
      }

      // If inviteToken is in params, it's an invitation page
      if (inviteToken) {
        // The actual joining logic should be in the JoinClassSection component
        // We don't need classroomId here as it will be determined by the token
        return;
      }

      // If neither, check if classroomId is in the URL path
      const pathSegments = location.pathname.split('/');
      const idIndex = pathSegments.indexOf('classroom') + 1;
      
      if (idIndex > 0 && idIndex < pathSegments.length) {
        setCurrentClassroomId(pathSegments[idIndex]);
      }
    };

    extractClassroomId();
  }, [classroomId, inviteToken, location]);

  if (inviteToken) {
    // For invitation token view
    return (
      <div className="container px-4 py-6 max-w-6xl">
        <div className="mb-6 flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold gradient-text">Join Classroom</h1>
        </div>
        
        {/* TODO: Add JoinClassSection component here with inviteToken when implementing invitation flow */}
      </div>
    );
  }

  // For classroom invite management view
  if (!currentClassroomId) {
    return (
      <div className="container px-4 py-6 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/classes')}
            className="mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Classrooms
          </Button>
        </div>
        <div className="p-8 text-center">
          <h2 className="text-xl mb-4">Classroom ID is required</h2>
          <Button onClick={() => navigate('/classes')}>
            Go to Classrooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-6 max-w-6xl">
      <div className="mb-6 flex items-center">
        <Button 
          variant="ghost" 
          onClick={() => navigate(`/class/${currentClassroomId}`)}
          className="mr-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classroom
        </Button>
        <h1 className="text-3xl font-bold gradient-text">Invite Students</h1>
      </div>
      
      <div className="w-full">
        <InviteStudents classroomId={currentClassroomId} />
      </div>
    </div>
  );
};

export default ClassroomInvite;
