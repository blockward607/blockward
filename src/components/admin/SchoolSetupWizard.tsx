
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import { School, Building, Mail, Globe, Phone, MapPin } from 'lucide-react';

export const SchoolSetupWizard = () => {
  const { createSchool } = useSchoolAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    domain: '',
    address: '',
    phone: '',
    website: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createSchool(formData);
    } catch (error) {
      // Error handled in hook
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-8 bg-black/50 border-purple-500/30">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <School className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">Welcome to Blockward</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Let's set up your school administration account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              School Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter your school name"
              required
              className="bg-gray-800/50 border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                placeholder="admin@yourschool.edu"
                className="bg-gray-800/50 border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Email Domain
              </Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => handleInputChange('domain', e.target.value)}
                placeholder="@yourschool.edu"
                className="bg-gray-800/50 border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="bg-gray-800/50 border-gray-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Website
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourschool.edu"
                className="bg-gray-800/50 border-gray-600"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              School Address
            </Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter your school's full address"
              className="bg-gray-800/50 border-gray-600"
              rows={3}
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !formData.name}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'Creating School...' : 'Create School Admin Account'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <h3 className="font-semibold text-blue-400 mb-2">What happens next?</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Your school admin account will be created</li>
            <li>• You'll gain access to the admin dashboard</li>
            <li>• You can start creating teacher and student accounts</li>
            <li>• Set up your school's timetable and classes</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};
