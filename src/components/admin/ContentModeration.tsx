
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Shield, AlertTriangle, Eye, Check, X, MessageSquare, Flag, Settings } from "lucide-react";

interface BehaviorRecord {
  id: string;
  student_id: string;
  type: string;
  description: string;
  severity: number;
  resolved: boolean;
  created_at: string;
  student_name?: string;
  follow_up_required: boolean;
  parent_notified: boolean;
}

interface FilterRule {
  id: string;
  keyword: string;
  severity: 'low' | 'medium' | 'high';
  action: 'warn' | 'block' | 'report';
  is_active: boolean;
}

export const ContentModeration = () => {
  const { toast } = useToast();
  const [behaviorRecords, setBehaviorRecords] = useState<BehaviorRecord[]>([]);
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reports' | 'rules' | 'activity'>('reports');
  const [isResolveOpen, setIsResolveOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BehaviorRecord | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load behavior records
      const { data: behaviorData, error: behaviorError } = await supabase
        .from('behavior_records')
        .select(`
          *,
          students(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (behaviorError) throw behaviorError;

      setBehaviorRecords(behaviorData?.map(record => ({
        ...record,
        student_name: record.students?.name
      })) || []);

      // Mock filter rules (replace with actual table if needed)
      setFilterRules([
        { id: '1', keyword: 'inappropriate', severity: 'medium', action: 'warn', is_active: true },
        { id: '2', keyword: 'bullying', severity: 'high', action: 'report', is_active: true },
        { id: '3', keyword: 'offensive', severity: 'medium', action: 'block', is_active: true },
      ]);

    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load moderation data"
      });
    } finally {
      setLoading(false);
    }
  };

  const resolveRecord = async () => {
    if (!selectedRecord) return;

    try {
      const { error } = await supabase
        .from('behavior_records')
        .update({
          resolved: true,
          follow_up_notes: resolutionNotes
        })
        .eq('id', selectedRecord.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Behavior record resolved successfully"
      });

      setIsResolveOpen(false);
      setSelectedRecord(null);
      setResolutionNotes("");
      loadData();
    } catch (error: any) {
      console.error('Error resolving record:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to resolve record"
      });
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity >= 3) return 'bg-red-500';
    if (severity >= 2) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getSeverityText = (severity: number) => {
    if (severity >= 3) return 'High';
    if (severity >= 2) return 'Medium';
    return 'Low';
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'report': return 'bg-red-500';
      case 'block': return 'bg-orange-500';
      case 'warn': return 'bg-yellow-500';
      default: return 'bg-gray-500';
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
          <h2 className="text-2xl font-bold text-white">Content Moderation</h2>
          <p className="text-gray-400">Monitor and manage content safety across your platform</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setActiveTab('reports')}
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            className={activeTab === 'reports' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Reports
          </Button>
          <Button
            onClick={() => setActiveTab('rules')}
            variant={activeTab === 'rules' ? 'default' : 'outline'}
            className={activeTab === 'rules' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
          >
            <Settings className="w-4 h-4 mr-2" />
            Filter Rules
          </Button>
          <Button
            onClick={() => setActiveTab('activity')}
            variant={activeTab === 'activity' ? 'default' : 'outline'}
            className={activeTab === 'activity' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Activity Log
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Open Reports</p>
                <p className="text-2xl font-bold text-red-400">
                  {behaviorRecords.filter(r => !r.resolved).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Resolved Today</p>
                <p className="text-2xl font-bold text-green-400">
                  {behaviorRecords.filter(r => r.resolved && 
                    new Date(r.created_at).toDateString() === new Date().toDateString()).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Rules</p>
                <p className="text-2xl font-bold text-blue-400">
                  {filterRules.filter(r => r.is_active).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">High Priority</p>
                <p className="text-2xl font-bold text-orange-400">
                  {behaviorRecords.filter(r => !r.resolved && r.severity >= 3).length}
                </p>
              </div>
              <Flag className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Behavior Reports ({behaviorRecords.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Review and manage reported behavior incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            {behaviorRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No behavior reports found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Student</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Description</TableHead>
                    <TableHead className="text-gray-300">Severity</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Date</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {behaviorRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="text-white font-medium">
                        {record.student_name || 'Unknown Student'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-500 text-gray-300">
                          {record.type || 'General'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-xs truncate">
                        {record.description}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getSeverityColor(record.severity)} text-white`}>
                          {getSeverityText(record.severity)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {record.resolved ? (
                          <Badge className="bg-green-600 text-white">Resolved</Badge>
                        ) : (
                          <Badge className="bg-yellow-600 text-white">Open</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(record.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-600 text-blue-400 hover:bg-blue-600/20"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!record.resolved && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsResolveOpen(true);
                              }}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filter Rules Tab */}
      {activeTab === 'rules' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Content Filter Rules ({filterRules.length})
            </CardTitle>
            <CardDescription className="text-gray-400">
              Configure automatic content filtering and moderation rules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Keyword</TableHead>
                  <TableHead className="text-gray-300">Severity</TableHead>
                  <TableHead className="text-gray-300">Action</TableHead>
                  <TableHead className="text-gray-300">Status</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filterRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="text-white font-medium">
                      {rule.keyword}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getSeverityColor(rule.severity === 'high' ? 3 : rule.severity === 'medium' ? 2 : 1)} text-white`}>
                        {rule.severity}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getActionColor(rule.action)} text-white`}>
                        {rule.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {rule.is_active ? (
                        <Badge className="bg-green-600 text-white">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-600 text-white">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-600 text-red-400 hover:bg-red-600/20"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Activity Log Tab */}
      {activeTab === 'activity' && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Activity Log
            </CardTitle>
            <CardDescription className="text-gray-400">
              Recent moderation actions and system activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Activity log functionality coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolve Record Dialog */}
      <Dialog open={isResolveOpen} onOpenChange={setIsResolveOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Resolve Behavior Report</DialogTitle>
            <DialogDescription className="text-gray-400">
              Mark this behavior report as resolved and add any follow-up notes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRecord && (
              <div className="bg-gray-700 p-4 rounded-lg">
                <p className="text-white font-medium">Student: {selectedRecord.student_name}</p>
                <p className="text-gray-300">Type: {selectedRecord.type}</p>
                <p className="text-gray-300">Description: {selectedRecord.description}</p>
              </div>
            )}
            <div>
              <Label htmlFor="notes" className="text-gray-300">Resolution Notes</Label>
              <Textarea
                id="notes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Add any follow-up notes or actions taken..."
                className="bg-gray-700 border-gray-600 text-white"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsResolveOpen(false)}
                className="border-gray-600 text-gray-300"
              >
                Cancel
              </Button>
              <Button onClick={resolveRecord} className="bg-green-600 hover:bg-green-700">
                Mark Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
