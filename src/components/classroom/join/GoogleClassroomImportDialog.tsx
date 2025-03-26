
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Import } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useGoogleClassroomImport } from "./hooks/useGoogleClassroomImport";
import { ClassDetails } from "./ClassDetails";
import { ImportOptions } from "./ImportOptions";

export const GoogleClassroomImportDialog = () => {
  const [open, setOpen] = useState(false);
  const {
    courses,
    selectedCourse,
    loading,
    students,
    studentsLoaded,
    handleImportClass,
    handleSelectCourse,
    handleAuthenticate,
    isAuthenticated,
  } = useGoogleClassroomImport();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Import className="w-4 h-4 mr-2" /> 
          Import from Google Classroom
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Class from Google Classroom</DialogTitle>
        </DialogHeader>
        
        {!isAuthenticated ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Connect to your Google Classroom account to import classes and students.
            </p>
            <Button onClick={handleAuthenticate}>
              Authenticate with Google
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <ImportOptions 
              courses={courses}
              selectedCourse={selectedCourse}
              onSelectCourse={handleSelectCourse}
              loading={loading}
            />
            
            {selectedCourse && (
              <>
                <ClassDetails 
                  course={selectedCourse} 
                  loading={loading} 
                  students={students}
                  studentsLoaded={studentsLoaded}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={() => {
                      handleImportClass();
                      setOpen(false);
                    }}
                    disabled={!selectedCourse || loading}
                  >
                    Import Class
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
