"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import koLocale from "@fullcalendar/core/locales/ko";

export function CalendarContainer({
  loading,
  events,
  viewedClass,
  onEventClick,
  onDateClick,
  fetchEvents,
}) {
  const [currentViewMonth, setCurrentViewMonth] = useState(null);

  return (
    <div className="calendar-container position-relative">
      {loading && (
        <div className="calendar-loading">
          <div className="spinner-border spinner-border-sm text-primary me-2">
            <span className="visually-hidden">Loading...</span>
          </div>
          일정 불러오는 중...
        </div>
      )}
      <FullCalendar
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          interactionPlugin,
          bootstrap5Plugin,
        ]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev",
          center: "title",
          right: "next",
        }}
        locale={koLocale}
        themeSystem="bootstrap5"
        height={600}
        events={events}
        eventClick={onEventClick} // This should call the function passed from Page
        dateClick={onDateClick} // This should call the function passed from Page
        datesSet={(dateInfo) => {
          const viewStart = dateInfo.start;
          const monthStart = new Date(
            viewStart.getFullYear(),
            viewStart.getMonth(),
            1
          );
          const monthString = monthStart.toISOString();

          if (monthString !== currentViewMonth) {
            setCurrentViewMonth(monthString);
            fetchEvents(monthString, viewedClass);
          }
        }}
      />
    </div>
  );
}
