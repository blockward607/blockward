
import { JoinClassProvider } from "./join/JoinClassContext";
import { JoinClassSection as JoinSection } from "./join/JoinClassSection";

export const JoinClassSection = () => {
  return (
    <JoinClassProvider>
      <JoinSection />
    </JoinClassProvider>
  );
};
