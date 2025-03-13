
import { supabase } from "@/integrations/supabase/client";

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  created_at: string;
  classroom_id: string;
}

export interface Classroom {
  id: string;
  name: string;
}

export const ResourcesService = {
  createResourcesBucketIfNeeded: async () => {
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
      throw error;
    }
  },

  fetchClassrooms: async (): Promise<Classroom[]> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return [];

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

          return classroomsData || [];
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

          return enrolledClassrooms?.map(ec => ec.classroom) || [];
        }
      }
      return [];
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      throw error;
    }
  },

  fetchResources: async (classroomId: string): Promise<Resource[]> => {
    if (!classroomId) return [];
    
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('classroom_id', classroomId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching resources:', error);
      throw error;
    }
  },

  uploadResource: async (
    file: File, 
    resourceData: { title: string; description: string; classroom_id: string; }
  ): Promise<Resource> => {
    try {
      // Create resources bucket if it doesn't exist
      await ResourcesService.createResourcesBucketIfNeeded();
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, file);

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
            title: resourceData.title,
            description: resourceData.description,
            url: publicUrl,
            type: file.type,
            classroom_id: resourceData.classroom_id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error uploading resource:', error);
      throw error;
    }
  },

  deleteResource: async (id: string, url: string): Promise<void> => {
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
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  }
};
