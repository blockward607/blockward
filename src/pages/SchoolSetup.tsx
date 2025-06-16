
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, Building, Mail, Phone, Globe, MapPin, Loader2 } from "lucide-react";

const SchoolSetup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [existingSchool, setExistingSchool] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    address: "",
    phone: "",
    website: "",
    domain: ""
  });

  useEffect(() => {
    checkUserAndSchool();
  }, []);

  const checkUserAndSchool = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please sign in to set up a school"
        });
        navigate('/auth');
        return;
      }

      setUser(session.user);

      // Check if user is already an admin of a school
      const { data: adminProfile } = await supabase
        .from('admin_profiles')
        .select(`
          *,
          schools (*)
        `)
        .eq('user_id', session.user.id)
        .single();

      if (adminProfile?.schools) {
        setExistingSchool(adminProfile.schools);
        setFormData({
          name: adminProfile.schools.name || "",
          contactEmail: adminProfile.schools.contact_email || "",
          address: adminProfile.schools.address || "",
          phone: adminProfile.schools.phone || "",
          website: adminProfile.schools.website || "",
          domain: adminProfile.schools.domain || ""
        });
      }

    } catch (error) {
      console.error('Error checking user and school:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    setLoading(true);

    try {
      let schoolId;

      if (existingSchool) {
        // Update existing school
        const { error } = await supabase
          .from('schools')
          .update({
            name: formData.name,
            contact_email: formData.contactEmail,
            address: formData.address,
            phone: formData.phone,
            website: formData.website,
            domain: formData.domain,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingSchool.id);

        if (error) throw error;
        schoolId = existingSchool.id;

        toast({
          title: "School Updated!",
          description: "School information has been updated successfully."
        });
      } else {
        // Create new school
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .insert({
            name: formData.name,
            contact_email: formData.contactEmail,
            address: formData.address,
            phone: formData.phone,
            website: formData.website,
            domain: formData.domain,
            created_by: user.id
          })
          .select()
          .single();

        if (schoolError) throw schoolError;
        schoolId = schoolData.id;

        // Create admin profile for this user with ICT admin level
        const { error: promoteError } = await supabase.rpc('promote_user_to_admin', {
          target_user_id: user.id,
          school_id_param: schoolId,
          admin_name: user.email?.split('@')[0] || 'Administrator',
          admin_position: 'School Administrator'
        });

        if (promoteError) throw promoteError;

        // Set access level to ICT admin by default
        const { error: accessError } = await supabase
          .from('admin_profiles')
          .update({ access_level: 'ict_admin' })
          .eq('user_id', user.id);

        if (accessError) throw accessError;

        toast({
          title: "School Created!",
          description: "Your school has been set up and you now have ICT admin privileges."
        });
      }

      // Wait a moment then redirect
      setTimeout(() => {
        navigate('/admin');
      }, 2000);

    } catch (error: any) {
      console.error('Error setting up school:', error);
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: error.message || "Failed to set up school"
      });
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-blue-600/20">
              <School className="w-8 h-8 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">
              {existingSchool ? 'Update School Information' : 'School Setup'}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {existingSchool 
                ? 'Update your school information and settings'
                : 'Set up your school to get started with BlockWard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-gray-200 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    School Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter school name"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="contactEmail" className="text-gray-200 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Contact Email *
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="admin@school.edu"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-gray-200 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1-555-0123"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-gray-200 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    School Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Education Street, City, State"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="website" className="text-gray-200 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://school.edu"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="domain" className="text-gray-200 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Domain
                  </Label>
                  <Input
                    id="domain"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    placeholder="school.edu"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Students with this email domain will be automatically verified
                  </p>
                </div>
              </div>

              <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <School className="w-5 h-5 text-blue-400" />
                  <h4 className="text-blue-300 font-medium">What happens next?</h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-1">
                  {existingSchool ? (
                    <>
                      <li>• Your school information will be updated</li>
                      <li>• Settings will be applied to your admin dashboard</li>
                      <li>• Teachers and students will see the updated school info</li>
                    </>
                  ) : (
                    <>
                      <li>• Your school will be created in the system</li>
                      <li>• You'll automatically become the school administrator</li>
                      <li>• You can start inviting teachers and students</li>
                      <li>• Access the admin dashboard to manage everything</li>
                    </>
                  )}
                </ul>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {existingSchool ? 'Updating School...' : 'Setting Up School...'}
                  </>
                ) : (
                  <>
                    <School className="w-4 h-4 mr-2" />
                    {existingSchool ? 'Update School' : 'Create School'}
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button 
                  type="button"
                  variant="ghost"
                  onClick={() => navigate('/dashboard')}
                  className="text-gray-400 hover:text-white"
                >
                  Return to Dashboard
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SchoolSetup;
