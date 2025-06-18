
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Classroom } from "@/types/classroom";

interface ClassroomListProps {
  classrooms: Classroom[];
  userRole: 'teacher' | 'student' | null;
}

export const ClassroomList = ({ classrooms, userRole }: ClassroomListProps) => {
  const navigate = useNavigate();

  const handleClassroomClick = (classroom: Classroom) => {
    if (userRole === 'teacher') {
      navigate(`/class/${classroom.id}`);
    } else {
      navigate(`/class/${classroom.id}`);
    }
  };

  if (classrooms.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-300 mb-2">
          {userRole === 'teacher' ? 'No classes created yet' : 'No classes joined yet'}
        </h3>
        <p className="text-gray-500">
          {userRole === 'teacher' 
            ? 'Create your first class to get started' 
            : 'Join a class using a class code or invitation link'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {classrooms.map((classroom, index) => (
        <motion.div
          key={classroom.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/20 hover:border-purple-400/40"
            onClick={() => handleClassroomClick(classroom)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold text-white mb-1">
                    {classroom.name}
                  </CardTitle>
                  {classroom.section && (
                    <Badge variant="secondary" className="text-xs bg-purple-600/20 text-purple-300">
                      {classroom.section}
                    </Badge>
                  )}
                </div>
                {userRole === 'teacher' && (
                  <Settings className="w-4 h-4 text-gray-400 hover:text-purple-400 transition-colors" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {classroom.description && (
                <CardDescription className="text-gray-300 mb-4 line-clamp-2">
                  {classroom.description}
                </CardDescription>
              )}
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>Students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};
