
import { JoinClassProvider } from "./join/JoinClassContext";
import { JoinClassSection as JoinSection } from "./join/JoinClassSection";
import { useParams } from "react-router-dom";

export const JoinClassSection = () => {
  // Get inviteToken from URL parameters if present
  const { inviteToken } = useParams<{ inviteToken?: string }>();
  
  return (
    <JoinClassProvider>
      <JoinSection />
    </JoinClassProvider>
  );
};
