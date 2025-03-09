
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Calendar, Users, Clock, Award } from "lucide-react";
import { AttendanceStatus } from "./AttendanceStatus";

interface AttendanceStatsProps {
  students: {
    id: string;
    name: string;
    status?: AttendanceStatus;
  }[];
}

export const AttendanceStats = ({ students }: AttendanceStatsProps) => {
  // Early return if there are no students
  if (!students || students.length === 0) {
    return (
      <Card className="w-full glass-card border-purple-500/20">
        <CardContent className="p-6">
          <div className="text-center py-6">
            <p className="text-gray-500">No students to display stats for.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate stats
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.status === 'present' || !s.status).length;
  const absentCount = students.filter(s => s.status === 'absent').length;
  const lateCount = students.filter(s => s.status === 'late').length;

  const presentPercentage = Math.round((presentCount / totalStudents) * 100);
  const absentPercentage = Math.round((absentCount / totalStudents) * 100);
  const latePercentage = Math.round((lateCount / totalStudents) * 100);

  // Prepare data for pie chart
  const data = [
    { name: 'Present', value: presentCount, color: '#22c55e' },
    { name: 'Absent', value: absentCount, color: '#ef4444' },
    { name: 'Late', value: lateCount, color: '#eab308' },
  ].filter(item => item.value > 0);

  const renderPieChart = () => {
    if (totalStudents === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No data to display</p>
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card className="w-full glass-card border-purple-500/20 hover:border-purple-500/40 transition-colors">
      <CardContent className="p-6">
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-2 bg-purple-900/20 border border-purple-500/20 mb-6">
            <TabsTrigger value="summary" className="data-[state=active]:bg-purple-600">Summary</TabsTrigger>
            <TabsTrigger value="chart" className="data-[state=active]:bg-purple-600">Chart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary" className="space-y-6 animate-fade-in">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="flex flex-col space-y-2 glass-card p-4 border border-purple-500/20 rounded-lg hover-scale">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-green-100/10">
                    <Award className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-sm font-medium">Present</span>
                </div>
                <div className="text-2xl font-bold">
                  {presentCount} <span className="text-sm text-gray-500">/ {totalStudents}</span>
                </div>
                <Progress 
                  value={presentPercentage} 
                  className="h-2 bg-gray-100/10"
                  indicatorClassName="bg-green-500"
                />
                <span className="text-sm text-gray-500">{presentPercentage}% of total</span>
              </div>
              
              <div className="flex flex-col space-y-2 glass-card p-4 border border-purple-500/20 rounded-lg hover-scale">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-red-100/10">
                    <Calendar className="h-5 w-5 text-red-500" />
                  </div>
                  <span className="text-sm font-medium">Absent</span>
                </div>
                <div className="text-2xl font-bold">
                  {absentCount} <span className="text-sm text-gray-500">/ {totalStudents}</span>
                </div>
                <Progress 
                  value={absentPercentage} 
                  className="h-2 bg-gray-100/10"
                  indicatorClassName="bg-red-500"
                />
                <span className="text-sm text-gray-500">{absentPercentage}% of total</span>
              </div>
              
              <div className="flex flex-col space-y-2 glass-card p-4 border border-purple-500/20 rounded-lg hover-scale">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-full bg-yellow-100/10">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                  <span className="text-sm font-medium">Late</span>
                </div>
                <div className="text-2xl font-bold">
                  {lateCount} <span className="text-sm text-gray-500">/ {totalStudents}</span>
                </div>
                <Progress 
                  value={latePercentage} 
                  className="h-2 bg-gray-100/10"
                  indicatorClassName="bg-yellow-500"
                />
                <span className="text-sm text-gray-500">{latePercentage}% of total</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chart" className="animate-fade-in">
            {renderPieChart()}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
