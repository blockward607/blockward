
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Building, Copy, RefreshCw, Eye, EyeOff } from "lucide-react";

export const InstitutionCodeManager = () => {
  const { toast } = useToast();
  const [institutionCode, setInstitutionCode] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadSchoolInfo();
  }, []);

  const loadSchoolInfo = async () => {
    try {
      // Get admin's school info
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (adminError) throw adminError;

      if (adminProfile?.school_id) {
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('name, institution_code')
          .eq('id', adminProfile.school_id)
          .single();

        if (schoolError) throw schoolError;

        setSchoolName(school.name);
        setInstitutionCode(school.institution_code || "");
      }
    } catch (error) {
      console.error('Error loading school info:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load institution information"
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateCode = async () => {
    setRegenerating(true);
    try {
      // Get admin's school info
      const { data: adminProfile, error: adminError } = await supabase
        .from('admin_profiles')
        .select('school_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (adminError) throw adminError;

      if (adminProfile?.school_id) {
        // Generate new code
        const { data: newCode, error: codeError } = await supabase.rpc('generate_institution_code');
        
        if (codeError) throw codeError;

        // Update school with new code
        const { error: updateError } = await supabase
          .from('schools')
          .update({ institution_code: newCode })
          .eq('id', adminProfile.school_id);

        if (updateError) throw updateError;

        setInstitutionCode(newCode);
        toast({
          title: "Code Regenerated",
          description: "New institution code has been generated successfully"
        });
      }
    } catch (error) {
      console.error('Error regenerating code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate institution code"
      });
    } finally {
      setRegenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(institutionCode);
      toast({
        title: "Copied!",
        description: "Institution code copied to clipboard"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Building className="w-5 h-5" />
          Institution Code Management
        </CardTitle>
        <CardDescription className="text-gray-400">
          Manage your institution's signup code for teachers and students
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-gray-300">School Name</Label>
          <div className="text-white font-medium">{schoolName}</div>
        </div>

        <div className="space-y-3">
          <Label className="text-gray-300">Institution Code</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                value={showCode ? institutionCode : institutionCode.replace(/./g, '•')}
                readOnly
                className="bg-gray-700 border-gray-600 text-white font-mono text-lg pr-20"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowCode(!showCode)}
                  className="text-gray-400 hover:text-gray-300 p-1 h-6 w-6"
                >
                  {showCode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={copyToClipboard}
                  className="text-gray-400 hover:text-gray-300 p-1 h-6 w-6"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <Button
              onClick={regenerateCode}
              disabled={regenerating}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${regenerating ? 'animate-spin' : ''}`} />
              {regenerating ? 'Generating...' : 'Regenerate'}
            </Button>
          </div>
          <div className="text-sm text-gray-400">
            Share this code with teachers and students to allow them to request access to your institution.
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Building className="w-3 h-3 text-blue-400" />
            </div>
            <div>
              <h4 className="text-blue-300 font-medium mb-1">How it works</h4>
              <ul className="text-sm text-blue-200/80 space-y-1">
                <li>• Teachers and students enter this code during signup</li>
                <li>• You'll receive notifications for new signup requests</li>
                <li>• Approve or reject requests from the Pending Users section</li>
                <li>• Regenerate the code anytime for security</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
