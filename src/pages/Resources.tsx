import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ResourceList } from "@/components/resources/ResourceList";
import { UploadResourceDialog } from "@/components/resources/UploadResourceDialog";
import { ResourcesService, Resource } from "@/services/ResourcesService";
import { JoinClassSection } from "@/components/classroom/JoinClassSection";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    classroom_id: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        setUserRole(roleData?.role || null);
      } catch (error) {
        console.error('Error checking user role:', error);
      }
    };

    checkUserRole();
  }, []);

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
        {userRole === 'teacher' && (
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
        )}
      </div>

      {userRole === 'student' && (
        <JoinClassSection />
      )}

      <Tabs defaultValue="resources">
        <TabsList>
          <TabsTrigger value="resources">Class Resources</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resources">
          {classrooms.length > 0 ? (
            <ResourceList 
              resources={resources} 
              loading={loading} 
              onDelete={userRole === 'teacher' ? handleDeleteResource : undefined} 
            />
          ) : (
            <Card className="p-6">
              <div className="text-center text-gray-400">
                {userRole === 'teacher' 
                  ? "No classes created yet. Create your first class to upload resources." 
                  : "You're not enrolled in any classes yet. Join a class to see resources."}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
