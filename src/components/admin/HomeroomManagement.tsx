
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Home, Plus, User, MapPin } from "lucide-react";

interface Homeroom {
  id: string;
  name: string;
  year_group: string;
  room_number: string;
  form_tutor_id: string;
  teacher_profiles?: {
    full_name: string;
  };
}

interface Teacher {
  id: string;
  full_name: string;
}

export const HomeroomManagement = () => {
  const { toast } = useToast();
  const [homerooms, setHomerooms] = useState<Homeroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    year_group: "",
    form_tutor_id: "",
    room_number: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load homerooms with form tutors
      const { data: homeroomsData } = await supabase
        .from('homerooms')
        .select(`
          id,
          name,
          year_group,
          room_number,
          form_tutor_id,
          teacher_profiles (
            full_name
          )
        `);

      // Load teachers
      const { data: teachersData } = await supabase
        .from('teacher_profiles')
        .select('id, full_name');

      setHomerooms(homeroomsData || []);
      setTeachers(teachersData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load homeroom data"
      });
    } finally {
      setLoading(false);
    }
  };

  const createHomeroom = async () => {
    if (!formData.name || !formData.year_group) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in required fields"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('create_homeroom', {
        p_name: formData.name,
        p_year_group: formData.year_group,
        p_form_tutor_id: formData.form_tutor_id || null,
        p_room_number: formData.room_number || null
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Homeroom created successfully"
      });

      setDialogOpen(false);
      setFormData({ name: "", year_group: "", form_tutor_id: "", room_number: "" });
      loadData();
    } catch (error: any) {
      console.error('Error creating homeroom:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create homeroom"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Homeroom Management</h2>
          <p className="text-gray-400">Manage form groups and assign form tutors</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Homeroom
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Homeroom</DialogTitle>
              <DialogDescription className="text-gray-400">
                Set up a new form group with a form tutor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-200">Homeroom Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., 7A, Year 8 Blue"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-200">Year Group *</Label>
                <Input
                  value={formData.year_group}
                  onChange={(e) => setFormData({ ...formData, year_group: e.target.value })}
                  placeholder="e.g., Year 7, Grade 8"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label className="text-gray-200">Form Tutor</Label>
                <Select value={formData.form_tutor_id} onValueChange={(value) => setFormData({ ...formData, form_tutor_id: value })}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select form tutor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.full_name || `Teacher ${teacher.id.slice(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-200">Room Number</Label>
                <Input
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  placeholder="e.g., A101, Room 25"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <Button onClick={createHomeroom} className="w-full bg-green-600 hover:bg-green-700">
                <Home className="w-4 h-4 mr-2" />
                Create Homeroom
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Homerooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {homerooms.map((homeroom) => (
          <motion.div
            key={homeroom.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  {homeroom.name}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {homeroom.year_group}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">
                    Form Tutor: {homeroom.teacher_profiles?.full_name || "Not assigned"}
                  </span>
                </div>
                
                {homeroom.room_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Room: {homeroom.room_number}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {homerooms.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="text-center py-8">
            <Home className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Homerooms Yet</h3>
            <p className="text-gray-500 mb-4">Create your first homeroom to get started</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Homeroom
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
