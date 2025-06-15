
import React from "react";
import { Calendar, AlarmClock } from "lucide-react";

const hardcodedSchedule = [
  { day: "Monday", time: "9:00 AM - 10:30 AM", subject: "Math" },
  { day: "Tuesday", time: "10:45 AM - 12:15 PM", subject: "English" },
  { day: "Wednesday", time: "9:00 AM - 10:30 AM", subject: "Science" },
  { day: "Thursday", time: "10:45 AM - 12:15 PM", subject: "History" },
  { day: "Friday", time: "9:00 AM - 10:15 AM", subject: "Arts & Sports" },
];

export const SchedulePanel = () => (
  <div className="w-full max-w-2xl mx-auto p-4 bg-black/40 rounded-lg shadow border border-purple-500/20">
    <div className="flex items-center mb-4 gap-2">
      <Calendar className="text-purple-400" />
      <span className="font-semibold text-xl text-white">Class Schedule</span>
    </div>
    <table className="min-w-full text-white text-sm">
      <thead>
        <tr className="bg-purple-900/40">
          <th className="py-2 px-3 text-left">Day</th>
          <th className="py-2 px-3 text-left">Time</th>
          <th className="py-2 px-3 text-left">Subject</th>
        </tr>
      </thead>
      <tbody>
        {hardcodedSchedule.map((row, idx) => (
          <tr key={idx} className="hover:bg-purple-800/20 transition">
            <td className="py-2 px-3">{row.day}</td>
            <td className="py-2 px-3 flex items-center gap-2"><AlarmClock className="w-4 h-4 text-purple-400" />{row.time}</td>
            <td className="py-2 px-3">{row.subject}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="mt-4 text-xs text-gray-400">Contact your teacher for changes to the schedule.</div>
  </div>
);
