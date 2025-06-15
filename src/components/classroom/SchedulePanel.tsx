import React from "react";
import { Calendar, AlarmClock } from "lucide-react";
import { Timetable } from "./Timetable";

const hardcodedSchedule = [
  { day: "Monday", time: "9:00 AM - 10:30 AM", subject: "Math" },
  { day: "Tuesday", time: "10:45 AM - 12:15 PM", subject: "English" },
  { day: "Wednesday", time: "9:00 AM - 10:30 AM", subject: "Science" },
  { day: "Thursday", time: "10:45 AM - 12:15 PM", subject: "History" },
  { day: "Friday", time: "9:00 AM - 10:15 AM", subject: "Arts & Sports" },
];

export const SchedulePanel = () => (
  <div className="w-full py-4">
    <Timetable />
    {/* Optionally keep the old table view, or remove if not needed */}
    {/* <div className="mt-8"><OldScheduleTable /></div> */}
  </div>
);
