
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { GraduationCap, Plus, Copy, Users, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InstitutionCodeManagementTabProps {
  institutionCodes: any[];
  loading: boolean;
  onCreateCode: (schoolName: string, contactEmail?: string) => Promise<any>;
  onRefresh: () => void;
}

export const InstitutionCodeManagementTab = ({ 
  institutionCodes, 
  loading, 
  onCreateCode, 
  onRefresh 
}: InstitutionCodeManagementTabProps) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreateCode = async () => {
    if (!schoolName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "School name is required"
      });
      return;
    }

    setIsCreating(true);
    const result = await onCreateCode(schoolName, contactEmail || undefined);
    
    if (result) {
      setSchoolName("");
      setContactEmail("");
      setDialogOpen(false);
      onRefresh();
    }
    
    setIsCreating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Institution code copied to clipboard"
    });
  };

  return (
    <Card className="bg-gray-900/80 border-gray-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Institution Code Management
            </CardTitle>
            <CardDescription className="text-gray-400">
              Create and manage institution codes for schools
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus className="h-4 w-4 mr-2" />
                Create New Code
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create Institution Code</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-white">School Name *</Label>
                  <Input
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Enter school name"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Contact Email (Optional)</Label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="admin@school.edu"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleCreateCode}
                  disabled={isCreating}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isCreating ? "Creating..." : "Create Institution Code"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : institutionCodes.length === 0 ? (
          <div className="text-center p-8 text-gray-400">
            <School className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No institution codes created yet</p>
            <p className="text-sm">Create your first institution code to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {institutionCodes.map((code) => (
              <div
                key={code.id}
                className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold">{code.name}</h3>
                    <p className="text-gray-400 text-sm">{code.contact_email}</p>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-purple-600/20 text-purple-300 hover:bg-purple-600/30 cursor-pointer"
                    onClick={() => copyToClipboard(code.institution_code)}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {code.institution_code}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{code.student_count} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    <span>{code.teacher_count} teachers</span>
                  </div>
                  <div>
                    Created: {new Date(code.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
