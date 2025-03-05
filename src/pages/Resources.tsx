
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResourceList } from "@/components/resources/ResourceList";
import { UploadResourceDialog } from "@/components/resources/UploadResourceDialog";
import { ResourcesService, Resource } from "@/services/ResourcesService";

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    classroom_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const initializeResources = async () => {
      try {
        await ResourcesService.createResourcesBucketIfNeeded();
        const fetchedClassrooms = await ResourcesService.fetchClassrooms();
        
        setClassrooms(fetchedClassrooms);
        if (fetchedClassrooms.length > 0) {
          setSelectedClassroom(fetchedClassrooms[0].id);
        }
      } catch (error) {
        console.error("Error initializing resources:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to initialize resources"
        });
      }
    };

    initializeResources();
  }, [toast]);

  useEffect(() => {
    const loadResources = async () => {
      if (!selectedClassroom) return;
      
      try {
        const fetchedResources = await ResourcesService.fetchResources(selectedClassroom);
        setResources(fetchedResources);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load resources"
        });
      } finally {
        setLoading(false);
      }
    };

    loadResources();
  }, [selectedClassroom, toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setNewResource(prev => ({
        ...prev,
        title: e.target.files[0].name
      }));
    }
  };

  const handleResourceChange = (field: string, value: string) => {
    setNewResource(prev => ({ ...prev, [field]: value }));
  };

  const handleUploadResource = async () => {
    if (!selectedFile || !selectedClassroom) return;

    setUploading(true);
    try {
      const uploadedResource = await ResourcesService.uploadResource(selectedFile, {
        ...newResource,
        classroom_id: selectedClassroom
      });

      setResources(prev => [uploadedResource, ...prev]);
      toast({
        title: "Success",
        description: "Resource uploaded successfully"
      });

      setSelectedFile(null);
      setNewResource({
        title: "",
        description: "",
        classroom_id: "",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload resource. " + (error.message || "")
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteResource = async (id: string, url: string) => {
    try {
      await ResourcesService.deleteResource(id, url);
      setResources(prev => prev.filter(resource => resource.id !== id));
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource"
      });
    }
  };

  const handleClassroomChange = (id: string) => {
    setSelectedClassroom(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resources</h1>
        <UploadResourceDialog
          classrooms={classrooms}
          selectedClassroom={selectedClassroom}
          onClassroomChange={handleClassroomChange}
          onUpload={handleUploadResource}
          uploading={uploading}
          selectedFile={selectedFile}
          onFileChange={handleFileChange}
          newResource={newResource}
          onResourceChange={handleResourceChange}
        />
      </div>

      <ResourceList 
        resources={resources} 
        loading={loading} 
        onDelete={handleDeleteResource} 
      />
    </div>
  );
};

export default Resources;
