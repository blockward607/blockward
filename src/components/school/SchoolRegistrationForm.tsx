
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { School, MapPin, Mail, Building } from "lucide-react";

export const SchoolRegistrationForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: "",
    contactEmail: "",
    region: "",
    schoolCode: "",
    address: "",
    phone: "",
    website: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to register a school"
      });
      return;
    }

    if (!formData.schoolName || !formData.contactEmail) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in school name and contact email"
      });
      return;
    }

    setLoading(true);

    try {
      // Create school record
      const { data: schoolData, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: formData.schoolName,
          contact_email: formData.contactEmail,
          address: formData.address,
          phone: formData.phone,
          website: formData.website,
          created_by: user.id
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Update user role to admin and create admin profile
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'admin'
        });

      if (roleError) throw roleError;

      // Create admin profile
      const { error: adminError } = await supabase
        .from('admin_profiles')
        .insert({
          user_id: user.id,
          school_id: schoolData.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'School Administrator',
          position: 'School Administrator',
          access_level: 'super_admin',
          permissions: {
            manage_teachers: true,
            manage_students: true,
            manage_classes: true,
            manage_settings: true,
            system_admin: true
          }
        });

      if (adminError) throw adminError;

      toast({
        title: "School Registration Submitted",
        description: "Your school registration has been submitted for verification. You will receive an email confirmation once approved."
      });

      // Clear form
      setFormData({
        schoolName: "",
        contactEmail: "",
        region: "",
        schoolCode: "",
        address: "",
        phone: "",
        website: ""
      });

    } catch (error: any) {
      console.error('School registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Failed to register school. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-white">
          <School className="w-5 h-5" />
          <span>Register Your School</span>
        </CardTitle>
        <CardDescription>
          Register your educational institution to access admin features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schoolName" className="text-white">
                School Name *
              </Label>
              <Input
                id="schoolName"
                value={formData.schoolName}
                onChange={(e) => handleInputChange('schoolName', e.target.value)}
                placeholder="Enter school name"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail" className="text-white">
                Contact Email *
              </Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="admin@school.edu"
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="region" className="text-white">
                Region/Location
              </Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange('region', e.target.value)}
                placeholder="City, State/Country"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schoolCode" className="text-white">
                School Code (Optional)
              </Label>
              <Input
                id="schoolCode"
                value={formData.schoolCode}
                onChange={(e) => handleInputChange('schoolCode', e.target.value)}
                placeholder="Official school code"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">
              School Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Full school address"
              className="bg-gray-700 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="School phone number"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website" className="text-white">
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://school.edu"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Register School"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
