
import React, { useState } from "react";
import { Calendar, CalendarClock } from "lucide-react";
import clsx from "clsx";

// Sample days and schedule data (replace later with dynamic data)
const weekdays = [
  { label: "Mon", day: 16 },
  { label: "Tue", day: 17 },
  { label: "Wed", day: 18 },
  { label: "Thu", day: 19 },
  { label: "Fri", day: 20 }
];

const sampleSchedule = {
  16: [
    {
      time: "07:45 - 07:50",
      code: "10F1/Am",
      subject: "AM REG",
      teacher: "Mrs N Parchment",
      room: "G3",
      type: ""
    },
    {
      time: "07:50 - 08:45",
      code: "10Bi T1",
      subject: "Biology",
      teacher: "Mr A Khan",
      room: "RL6",
      type: ""
    },
    {
      time: "08:45 - 09:40",
      code: "10A/En",
      subject: "English",
      teacher: "Mrs M Ashton",
      room: "G5",
      type: ""
    },
    {
      time: "10:00 - 10:55",
      code: "10D/Cg1",
      subject: "Computing",
      teacher: "Mr T Connall",
      room: "ICT3",
      type: ""
    },
    {
      time: "10:55 - 11:50",
      code: "10C/Bs1",
      subject: "Business Studies",
      teacher: "Mr D Adams",
      room: "PG2",
      type: ""
    },
    {
      time: "12:30 - 13:10",
      code: "10a Ab/2c",
      subject: "Arabic",
      teacher: "Mrs S Elwaer",
      room: "F6",
      type: ""
    },
    {
      time: "13:10 - 14:05",
      code: "10a/Ma1a",
      subject: "Mathematics",
      teacher: "Mr D Williams",
      room: "F1",
      type: ""
    },
    {
      time: "14:05 - 15:00",
      code: "10B/Pe2",
      subject: "PE",
      teacher: "Ms A Withers",
      room: "F2",
      type: ""
    }
  ],
  // ...repeat or vary for each day as needed
};

export const Timetable: React.FC = () => {
  // Default to today's weekday if possible, else the first sample day
  const today = new Date();
  // In a real-world app, map week day to 'Mon'=1, etc...
  const todayIndex = weekdays.findIndex((d) => d.day === today.getDate());
  const [selectedIdx, setSelectedIdx] = useState(todayIndex > -1 ? todayIndex : 0);
  const day = weekdays[selectedIdx];

  const schedule = sampleSchedule[day.day] || [];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/90 rounded-xl shadow border border-zinc-200">
      {/* Date/Day Selector */}
      <div className="flex flex-row md:justify-start justify-between items-center gap-2 p-4">
        {/* Left calendar icon, month */}
        <div className="flex flex-col items-center pr-2">
          <Calendar className="text-orange-600 mb-1" />
          <span className="text-md font-bold text-gray-800">Jun</span>
        </div>
        {/* Days row */}
        <div className="flex flex-1 gap-2">
          {weekdays.map((d, i) => (
            <button
              key={d.day}
              onClick={() => setSelectedIdx(i)}
              className={clsx(
                "min-w-[66px] flex flex-col items-center px-4 py-2 rounded-lg font-semibold text-sm uppercase",
                i === selectedIdx
                  ? "bg-blue-500 text-white shadow"
                  : "bg-gray-100 text-gray-500"
              )}
              style={{ transition: "background .14s" }}
            >
              <span className="mb-1">{d.day}</span>
              <span>{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        {/* Timeline of the day's periods */}
        {schedule.map((item, i) => (
          <React.Fragment key={i}>
            <div className="flex flex-col sm:flex-row gap-1 px-4 py-3">
              {/* Time */}
              <div className="sm:w-36 w-full text-gray-500 font-medium text-xs sm:text-sm flex items-center">
                <CalendarClock className="w-4 h-4 mr-2 text-gray-400" />
                <span>{item.time}</span>
              </div>
              {/* Class Info */}
              <div className="flex-1">
                <span className="font-bold text-gray-800 text-md">{item.code}</span>
                {item.subject && (
                  <span className="ml-3 text-gray-500 font-semibold text-sm">
                    ({item.subject})
                  </span>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {item.teacher}{" "}
                  <span className="text-gray-400">
                    | {item.room}
                  </span>
                </div>
              </div>
            </div>
            {/* Divider */}
            {i < schedule.length - 1 && <div className="border-t border-gray-200 my-0 mx-4" />}
          </React.Fragment>
        ))}
        {/* If no schedule */}
        {schedule.length === 0 && (
          <div className="text-center text-gray-400 py-10">
            No scheduled periods for this day.
          </div>
        )}
      </div>
    </div>
  );
};

