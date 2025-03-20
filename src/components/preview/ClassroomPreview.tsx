
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Check, X, Clock, Users, Calendar, Award, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ClassroomPreview = () => {
  const [activeTab, setActiveTab] = useState("attendance");
  
  // Sample data for the preview
  const students = [
    { id: 1, name: "Emma Thompson", status: "present", awards: 3 },
    { id: 2, name: "Noah Garcia", status: "absent", awards: 2 },
    { id: 3, name: "Olivia Chen", status: "late", awards: 5 },
    { id: 4, name: "Liam Johnson", status: "present", awards: 1 },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <X className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">{status}</Badge>;
      case 'absent':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">{status}</Badge>;
      case 'late':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-16 px-4" id="preview">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-4 gradient-text"
        >
          Platform Preview
        </motion.h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          See how BlockWard helps you manage your classroom and reward student achievements
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto glass-card rounded-lg border border-purple-500/20 overflow-hidden shadow-lg"
      >
        <div className="bg-purple-900/30 p-4 border-b border-purple-500/20">
          <h3 className="text-xl font-semibold">Computer Science 101</h3>
          <p className="text-sm text-gray-400">Interactive classroom management preview</p>
        </div>

        <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="p-4">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="h-4 w-4" />
              <span>Attendance</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="gap-2">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="gap-2">
              <Award className="h-4 w-4" />
              <span>BlockWards</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today's Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-purple-500/20">
                            <AvatarFallback className="bg-purple-800/30 text-purple-100 text-xs">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(student.status)}
                            {getStatusBadge(student.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" className="h-8 px-2 py-1">
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2 py-1">
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-2 py-1">
                              <Clock className="h-4 w-4 text-yellow-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Student Directory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => (
                    <div 
                      key={student.id}
                      className="flex items-center justify-between p-3 rounded-md hover:bg-purple-900/20 transition-colors border border-purple-500/10"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="border border-purple-500/20">
                          <AvatarFallback className="bg-purple-800/30 text-purple-100">
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-xs text-gray-400">Student ID: {100000 + student.id}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1">
                        View Profile <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rewards" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">BlockWard Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>BlockWards</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border border-purple-500/20">
                            <AvatarFallback className="bg-purple-800/30 text-purple-100 text-xs">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {student.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4 text-yellow-400" />
                            <span>{student.awards}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-purple-700 h-8">
                            <Award className="h-4 w-4 mr-1" /> Award BlockWard
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        viewport={{ once: true }}
        className="mt-8 text-center"
      >
        <Button 
          size="lg" 
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
        >
          Try BlockWard Now
        </Button>
      </motion.div>
    </div>
  );
};
