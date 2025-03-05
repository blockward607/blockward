import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, Folder, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  created_at: string;
  classroom_id: string;
}

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
    createResourcesBucketIfNeeded();
    fetchClassrooms();
    fetchResources();
  }, [selectedClassroom]);

  const createResourcesBucketIfNeeded = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('resources');
      if (error && error.message.includes('The resource was not found')) {
        console.log('Resources bucket does not exist, creating it...');
        const { error: createError } = await supabase.storage.createBucket('resources', {
          public: true
        });
        if (createError) throw createError;
        console.log('Resources bucket created successfully');
      }
    } catch (error) {
      console.error('Error checking/creating resources bucket:', error);
    }
  };

  const fetchClassrooms = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (roleData?.role === 'teacher') {
        const { data: teacherProfile } = await supabase
          .from('teacher_profiles')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (teacherProfile) {
          const { data: classroomsData } = await supabase
            .from('classrooms')
            .select('*')
            .eq('teacher_id', teacherProfile.id);

          setClassrooms(classroomsData || []);
          if (classroomsData && classroomsData.length > 0) {
            setSelectedClassroom(classroomsData[0].id);
          }
        }
      } else {
        const { data: studentProfile } = await supabase
          .from('students')
          .select('id')
          .eq('user_id', session.user.id)
          .single();

        if (studentProfile) {
          const { data: enrolledClassrooms } = await supabase
            .from('classroom_students')
            .select('classroom:classrooms(*)')
            .eq('student_id', studentProfile.id);

          const classroomsData = enrolledClassrooms?.map(ec => ec.classroom) || [];
          setClassrooms(classroomsData);
          if (classroomsData.length > 0) {
            setSelectedClassroom(classroomsData[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load classrooms"
      });
    }
  };

  const fetchResources = async () => {
    if (!selectedClassroom) return;
    
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('classroom_id', selectedClassroom)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load resources"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setNewResource(prev => ({
        ...prev,
        title: e.target.files[0].name
      }));
    }
  };

  const uploadResource = async () => {
    if (!selectedFile || !selectedClassroom) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      console.log('File uploaded successfully, public URL:', publicUrl);

      const { data, error } = await supabase
        .from('resources')
        .insert([
          {
            title: newResource.title,
            description: newResource.description,
            url: publicUrl,
            type: selectedFile.type,
            classroom_id: selectedClassroom
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setResources(prev => [data, ...prev]);
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
    } catch (error) {
      console.error('Error uploading resource:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to upload resource. " + (error.message || "")
      });
    } finally {
      setUploading(false);
    }
  };

  const deleteResource = async (id: string, url: string) => {
    try {
      const filePath = url.split('/').pop();
      if (filePath) {
        const { error: storageError } = await supabase.storage
          .from('resources')
          .remove([filePath]);
          
        if (storageError) {
          console.error('Error removing file from storage:', storageError);
        }
      }

      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setResources(prev => prev.filter(resource => resource.id !== id));
      toast({
        title: "Success",
        description: "Resource deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete resource"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Resources</h1>
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
                  onChange={(e) => setSelectedClassroom(e.target.value)}
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
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>
              <Input
                placeholder="Title"
                value={newResource.title}
                onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
              />
              <Textarea
                placeholder="Description"
                value={newResource.description}
                onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
              />
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={uploadResource}
                disabled={uploading || !selectedFile}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="p-4 hover:bg-purple-900/10">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-600/20">
                <FileText className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold truncate">{resource.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">
                  {resource.description}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      "bg-purple-600/20 text-purple-400",
                      "hover:bg-purple-600/30 transition-colors"
                    )}
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => deleteResource(resource.id, resource.url)}
                    className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      "bg-red-600/20 text-red-400",
                      "hover:bg-red-600/30 transition-colors"
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {resources.length === 0 && !loading && (
        <Card className="p-6">
          <div className="text-center text-gray-400">
            <Folder className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No resources available in this classroom yet.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Resources;
