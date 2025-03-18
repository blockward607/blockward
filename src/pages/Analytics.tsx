
import { Card } from "@/components/ui/card";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Pre-defined data for analytics
const attendanceData = [
  { name: 'Mon', attendance: 95, engagement: 85 },
  { name: 'Tue', attendance: 88, engagement: 82 },
  { name: 'Wed', attendance: 92, engagement: 90 },
  { name: 'Thu', attendance: 96, engagement: 88 },
  { name: 'Fri', attendance: 91, engagement: 85 },
];

const engagementData = [
  { name: 'Week 1', value: 78 },
  { name: 'Week 2', value: 82 },
  { name: 'Week 3', value: 85 },
  { name: 'Week 4', value: 89 },
];

const classPerformanceData = [
  { name: 'History', score: 85 },
  { name: 'Math', score: 78 },
  { name: 'Science', score: 92 },
  { name: 'English', score: 88 },
  { name: 'Art', score: 95 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold gradient-text">Analytics Dashboard</h1>
      
      <div className="grid gap-6">
        <Card className="p-6 bg-gradient-to-br from-purple-900/10 to-black border-purple-500/30">
          <h2 className="text-lg font-semibold mb-4">Weekly Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Legend />
                <Line type="monotone" dataKey="attendance" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="engagement" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6 bg-gradient-to-br from-blue-900/10 to-black border-blue-500/30">
            <h2 className="text-lg font-semibold mb-4">Attendance Rate</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="attendance" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-900/10 to-black border-green-500/30">
            <h2 className="text-lg font-semibold mb-4">Class Performance</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#333', borderColor: '#555' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="score" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
