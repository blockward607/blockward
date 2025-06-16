
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSchoolAdmin } from '@/hooks/useSchoolAdmin';
import { 
  School, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  Shield,
  BookOpen,
  Clock
} from 'lucide-react';

export const AdminDashboard = () => {
  const { school, isAdmin, loading } = useSchoolAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin || !school) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-400">You don't have admin permissions for this school.</p>
        </Card>
      </div>
    );
  }

  const quickStats = [
    { title: 'Total Students', value: '0', icon: Users, color: 'text-blue-400' },
    { title: 'Total Teachers', value: '0', icon: Users, color: 'text-green-400' },
    { title: 'Active Classes', value: '0', icon: BookOpen, color: 'text-purple-400' },
    { title: 'This Week\'s Events', value: '0', icon: Calendar, color: 'text-orange-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <School className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold">{school.name}</h1>
          </div>
          <p className="text-gray-400">School Administration Dashboard</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-6 bg-black/50 border-purple-500/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-black/50 border-purple-500/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="timetable">Timetable</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 bg-black/50 border-purple-500/30">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Activity
                </h3>
                <p className="text-gray-400">No recent activity to display.</p>
              </Card>

              <Card className="p-6 bg-black/50 border-purple-500/30">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Add New Teacher
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Add New Student
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Create New Class
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Announcement
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <Card className="p-6 bg-black/50 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">User Management</h3>
              <p className="text-gray-400">User management features will be implemented here.</p>
            </Card>
          </TabsContent>

          <TabsContent value="timetable">
            <Card className="p-6 bg-black/50 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">Timetable Management</h3>
              <p className="text-gray-400">Timetable management features will be implemented here.</p>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card className="p-6 bg-black/50 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">Class Management</h3>
              <p className="text-gray-400">Class management features will be implemented here.</p>
            </Card>
          </TabsContent>

          <TabsContent value="announcements">
            <Card className="p-6 bg-black/50 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">Announcements</h3>
              <p className="text-gray-400">Announcement management features will be implemented here.</p>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="p-6 bg-black/50 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">Reports & Analytics</h3>
              <p className="text-gray-400">Reporting features will be implemented here.</p>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-6 bg-black/50 border-purple-500/30">
              <h3 className="text-lg font-semibold mb-4">School Settings</h3>
              <p className="text-gray-400">School settings will be implemented here.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
