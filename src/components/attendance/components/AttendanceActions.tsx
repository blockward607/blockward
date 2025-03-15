
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download, FileText, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface AttendanceActionsProps {
  isTeacher: boolean;
  saving: boolean;
  refreshing: boolean;
  students: any[];
  selectedDate: Date;
  handleSaveAttendance: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AttendanceActions = ({
  isTeacher,
  saving,
  refreshing,
  students,
  selectedDate,
  handleSaveAttendance,
  refreshData
}: AttendanceActionsProps) => {
  const { toast } = useToast();

  const exportToCsv = () => {
    try {
      // Generate CSV header
      let csv = 'Student Name,Status,Date\n';
      
      // Add rows
      students.forEach(student => {
        const row = `"${student.name}","${student.status || 'present'}","${format(selectedDate, 'yyyy-MM-dd')}"\n`;
        csv += row;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-${format(selectedDate, 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Attendance data exported successfully"
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not export attendance data"
      });
    }
  };

  const exportToPdf = () => {
    toast({
      title: "Coming Soon",
      description: "PDF export feature will be available in the next update"
    });
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="icon"
        onClick={refreshData}
        disabled={refreshing}
        title="Refresh attendance data"
        className="hover:bg-purple-100/10"
      >
        <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
      </Button>
      
      {isTeacher && (
        <>
          <Button 
            variant="outline" 
            size="icon"
            onClick={exportToCsv}
            title="Export as CSV"
            className="hover:bg-purple-100/10"
          >
            <Download className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={exportToPdf}
            title="Export as PDF (Coming Soon)"
            className="hover:bg-purple-100/10"
          >
            <FileText className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={handleSaveAttendance}
            disabled={saving || students.length === 0}
            className="bg-purple-600 hover:bg-purple-700 transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save All
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
};
