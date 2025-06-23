"use client";

import { useState, useEffect } from "react";
import { fetchEvents as fetchEventsAPI } from "@/lib/appwriteHandlers";

export function useTaskCalendar() {
  // Change this line to set the default class to "에스라"
  const [viewedClass, setViewedClass] = useState("에스라");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentViewMonth, setCurrentViewMonth] = useState(null);

  const classOptions = [
    { id: "에스라", name: "에스라반", grade: "10" },
    { id: "에스겔", name: "에스겔반", grade: "10" },
    { id: "느헤미아", name: "느헤미아반", grade: "11" },
    { id: "아모스", name: "아모스반", grade: "11" },
    { id: "이사야", name: "이사야반", grade: "12" },
  ];

  const handleClassChange = (classId) => {
    setViewedClass(classId);

    // Reset current view month to force calendar refresh
    const now = new Date();
    const currentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    setCurrentViewMonth(currentMonth);

    // Fetch events with the new class filter
    fetchEventData(currentMonth, classId);
  };

  const handleEventClick = (info) => {
    return {
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      description: info.event.extendedProps.description || "",
      subject: info.event.extendedProps.subject || "",
      class: info.event.extendedProps.class || viewedClass,
      createdAt: info.event.extendedProps.createdAt || "",
      creatorName: info.event.extendedProps.creatorName || "",
    };
  };

  const handleDateClick = (arg) => {
    return arg.dateStr;
  };

  const fetchEventData = (monthString, classId) => {
    return fetchEventsAPI(
      setLoading,
      setEvents,
      setError,
      monthString,
      classId
    );
  };

  return {
    viewedClass,
    events,
    setEvents, // Add this line
    loading,
    error,
    classOptions,
    handleClassChange,
    handleEventClick,
    handleDateClick,
    fetchEventData,
  };
}
