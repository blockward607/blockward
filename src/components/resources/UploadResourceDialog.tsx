
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Classroom {
  id: string;
  name: string;
}

interface UploadResourceProps {
  classrooms: Classroom[];
  selectedClassroom: string;
  onClassroomChange: (id: string) => void;
  onUpload: () => void;
  uploading: boolean;
  selectedFile: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newResource: {
    title: string;
    description: string;
    classroom_id: string;
  };
  onResourceChange: (field: string, value: string) => void;
}

export const UploadResourceDialog: React.FC<UploadResourceProps> = ({
  classrooms,
  selectedClassroom,
  onClassroomChange,
  onUpload,
  uploading,
  selectedFile,
  onFileChange,
  newResource,
  onResourceChange,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Upload className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload New Resource</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Classroom
            </label>
            <select
              className="w-full p-2 rounded-md border border-gray-600 bg-background"
              value={selectedClassroom}
              onChange={(e) => onClassroomChange(e.target.value)}
            >
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {classroom.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              File
            </label>
            <Input
              type="file"
              onChange={onFileChange}
              className="cursor-pointer"
            />
          </div>
          <Input
            placeholder="Title"
            value={newResource.title}
            onChange={(e) => onResourceChange("title", e.target.value)}
          />
          <Textarea
            placeholder="Description"
            value={newResource.description}
            onChange={(e) => onResourceChange("description", e.target.value)}
          />
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={onUpload}
            disabled={uploading || !selectedFile}
          >
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
