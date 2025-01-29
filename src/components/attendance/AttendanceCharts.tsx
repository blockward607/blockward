import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#4ade80', '#f87171', '#fbbf24', '#60a5fa'];

interface AttendanceData {
  date: string;
  present: number;
  absent: number;
  late: number;
  authorized: number;
}

interface AttendanceChartsProps {
  attendanceData: AttendanceData[];
}

export const AttendanceCharts = ({ attendanceData }: AttendanceChartsProps) => {
  const getPieChartData = () => {
    const totals = {
      present: 0,
      absent: 0,
      late: 0,
      authorized: 0
    };

    attendanceData.forEach(day => {
      totals.present += day.present;
      totals.absent += day.absent;
      totals.late += day.late;
      totals.authorized += day.authorized;
    });

    return Object.entries(totals).map(([name, value]) => ({
      name,
      value
    }));
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <BarChart
          width={800}
          height={400}
          data={attendanceData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="present" fill="#4ade80" name="Present" />
          <Bar dataKey="absent" fill="#f87171" name="Absent" />
          <Bar dataKey="late" fill="#fbbf24" name="Late" />
          <Bar dataKey="authorized" fill="#60a5fa" name="Authorized" />
        </BarChart>
      </div>
      <div className="w-full flex justify-center">
        <PieChart width={400} height={400}>
          <Pie
            data={getPieChartData()}
            cx={200}
            cy={200}
            labelLine={false}
            outerRadius={150}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {getPieChartData().map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
    </>
  );
};