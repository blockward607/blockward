
import { ClassroomInvite } from "./invite/ClassroomInvite";

interface InviteStudentsProps {
  classroomId: string;
}

export const InviteStudents = ({ classroomId }: InviteStudentsProps) => {
  return <ClassroomInvite classroomId={classroomId} />;
};
