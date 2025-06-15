"use client";

import { useState } from "react";
import {
  handleAddTask as addTask,
  handleEditSubmit as editSubmit,
  handleDeleteEvent as deleteEvent,
} from "@/lib/appwriteHandlers";

export function useModals(
  events,
  setEvents,
  viewedClass,
  isVerified,
  setNotification,
  setError
) {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    subject: "",
    class: [viewedClass],
  });
  const [editTask, setEditTask] = useState({
    id: "",
    title: "",
    date: "",
    description: "",
    subject: "",
    class: [viewedClass],
  });
  const [tasksForDate, setTasksForDate] = useState([]);

  // Handler for backdrop clicks (closes the modal if clicking outside)
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      if (showModal) setShowModal(false);
      if (showEditModal) setShowEditModal(false);
      if (showViewModal) setShowViewModal(false);
      if (showDateModal) setShowDateModal(false);
    }
  };

  // Handler for viewing task details
  const handleViewTask = (event) => {
    // Make sure you're receiving a complete event object
    console.log("Viewing task:", event); // Add this for debugging
    setSelectedEvent(event);
    setShowViewModal(true);
    setShowDateModal(false);
  };

  // Handler for clicking "Edit" on a task
  const handleEditClick = () => {
    setEditTask({
      id: selectedEvent.id,
      title: selectedEvent.title,
      date: selectedEvent.start.split("T")[0],
      description: selectedEvent.description || "",
      subject: selectedEvent.subject || "",
      class: selectedEvent.class || [viewedClass],
    });
    setShowViewModal(false);
    setShowEditModal(true);
  };

  // Handler for date clicks on calendar
  const handleDateClick = (dateStr) => {
    console.log("Date clicked:", dateStr); // Add this for debugging
    setSelectedDate(dateStr);

    // Find tasks for this date
    const tasksOnDate = events.filter(
      (event) => event.start?.split("T")[0] === dateStr
    );
    setTasksForDate(tasksOnDate);
    setShowDateModal(true);

    // Also update new task with this date
    setNewTask((prev) => ({ ...prev, date: dateStr }));
  };

  // Handler for adding a task (wrapped)
  const handleAddTask = (e) => {
    if (!isVerified) {
      setNotification({
        show: true,
        message: "계정이 아직 승인되지 않았습니다. 관리자가 승인할 때까지 일정을 추가할 수 없습니다.",
        type: "warning",
      });
      return;
    }

    // Make sure class is always an array
    const taskWithClass = {
      ...newTask,
      class: Array.isArray(newTask.class) ? newTask.class : [viewedClass],
    };

    // Add setNotification and setError as parameters
    addTask(
      e,
      taskWithClass,
      (updatedEvents) => {
        setEvents(updatedEvents);
        setShowModal(false);
      },
      events,
      () =>
        setNewTask({
          title: "",
          date: new Date().toISOString().split("T")[0],
          description: "",
          subject: "",
          class: [viewedClass],
        }),
      setNotification,
      setError
    );
  };

  // Handler for editing a task (wrapped)
  const handleEditSubmit = (e) => {
    if (!isVerified) {
      setNotification({
        show: true,
        message: "계정이 아직 검증되지 않았습니다. 관리자가 검증할 때까지 일정을 수정할 수 없습니다.",
        type: "warning",
      });
      return;
    }

    // Make sure class is always an array
    const taskWithClass = {
      ...editTask,
      class: Array.isArray(editTask.class) ? editTask.class : [viewedClass],
    };

    editSubmit(
      e,
      taskWithClass,
      (updatedEvents) => {
        setEvents(updatedEvents);
        setShowEditModal(false);
        setSelectedEvent(null);
      },
      events,
      setNotification,
      setError
    );
  };

  // Handler for deleting an event (wrapped)
  const handleDeleteEvent = (eventId) => {
    if (!isVerified) {
      setNotification({
        show: true,
        message:
          "계정이 아직 검증되지 않았습니다. 관리자가 검증할 때까지 일정을 삭제할 수 없습니다.",
        type: "warning",
      });
      return;
    }

    if (confirm("정말로 이 일정을 삭제하시겠습니까?")) {
      deleteEvent(
        eventId,
        (updatedEvents) => {
          // This is the callback that will be executed on success
          setEvents(updatedEvents);
          setShowViewModal(false);
          setShowDateModal(false);
          setSelectedEvent(null);
        },
        events,
        setNotification,
        setError
      );
    }
  };

  // Add these new functions to handle calendar interactions
  const handleViewTaskFromCalendar = (eventData) => {
    console.log("Viewing task from calendar:", eventData);
    setSelectedEvent(eventData);
    setShowViewModal(true);
  };

  const handleDateClickFromCalendar = (dateStr, eventsArray) => {
    console.log("Date clicked from calendar:", dateStr);
    setSelectedDate(dateStr);

    // Find tasks for this date
    const tasksOnDate = eventsArray.filter(
      (event) => event.start?.split("T")[0] === dateStr
    );
    console.log("Tasks for date:", tasksOnDate);
    setTasksForDate(tasksOnDate);
    setShowDateModal(true);

    // Also update new task with this date
    setNewTask((prev) => ({ ...prev, date: dateStr }));
  };

  // Add this function to your useModals hook
  const handleAddTaskForDate = (date) => {
    console.log("Adding task for date:", date);
    // Set the new task date to the selected date
    setNewTask((prev) => ({
      ...prev,
      date: date,
    }));
    // Close the date modal
    setShowDateModal(false);
    // Open the add task modal
    setShowModal(true);
  };

  return {
    showModal,
    showEditModal,
    showViewModal,
    showDateModal,
    selectedEvent,
    selectedDate,
    newTask,
    editTask,
    tasksForDate,
    setShowModal,
    setShowEditModal,
    setShowViewModal,
    setShowDateModal,
    setSelectedEvent,
    setSelectedDate,
    setTasksForDate,
    setNewTask,
    setEditTask, // Make sure this is included here
    handleBackdropClick,
    handleViewTask,
    handleEditClick,
    handleAddTask,
    handleDeleteEvent,
    handleEditSubmit,
    handleViewTaskFromCalendar,
    handleDateClickFromCalendar,
    handleAddTaskForDate, // Add this
    // Any other values or functions you need to expose
  };
}
