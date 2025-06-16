"use client";

import { useState, useEffect } from "react";
import { CalendarContainer } from "@/components/CalendarContainer";
import { ClassSelector } from "@/components/ClassSelector";
import { Header } from "@/components/Header";
import { Notifications } from "@/components/Notifications";
import { TaskModals } from "@/components/TaskModals";
import { AuthModal } from "@/components/AuthModal";
import { useTaskCalendar } from "@/hooks/useTaskCalendar";
import { useAuth } from "@/hooks/useAuth";
import { useModals } from "@/hooks/useModals";
import { calendarStyles } from "@/styles/calendarStyles";

const Page = () => {
  const {
    viewedClass,
    events,
    setEvents,
    loading,
    classOptions,
    handleClassChange,
    handleEventClick,
    handleDateClick,
    fetchEventData,
  } = useTaskCalendar();

  // Define notification state first
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });
  // Define error state
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const {
    isTeacherUser,
    isVerified,
    isAuthLoading,
    showAuthModal,
    authMode,
    authForm,
    handleLogin,
    handleRegister,
    handleLogout,
    handleClientSideLogout, // Add this
    setShowAuthModal,
    setAuthMode,
    setAuthForm,
  } = useAuth(setNotification); // Pass setNotification here

  // Now you can use setNotification and setError as arguments
  const {
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
    setEditTask,
    handleBackdropClick,
    handleViewTask,
    handleEditClick,
    handleAddTask,
    handleDeleteEvent,
    handleEditSubmit,
    handleViewTaskFromCalendar,
    handleDateClickFromCalendar,
    handleAddTaskForDate, // Add this
  } = useModals(
    events,
    setEvents,
    viewedClass,
    isVerified,
    setNotification, // Make sure this is a function
    setError // Make sure this is a function
  );

  // Set isMounted after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If not mounted yet, render placeholder
  if (!isMounted) {
    return <LoadingPlaceholder viewedClass={viewedClass} />;
  }

  // Use the new handler functions from useModals that already have access to the necessary setState functions
  const onEventClick = (info) => {
    const eventData = handleEventClick(info);
    handleViewTaskFromCalendar(eventData);
  };

  const onDateClick = (arg) => {
    const dateStr = handleDateClick(arg);
    handleDateClickFromCalendar(dateStr, events);
  };

  return (
    <div className="container-fluid mx-0 px-0 position-relative">
      <style>{calendarStyles}</style>

      <Header
        viewedClass={viewedClass}
        isTeacherUser={isTeacherUser}
        isVerified={isVerified}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onClientLogout={handleClientSideLogout}
      >
        <ClassSelector
          viewedClass={viewedClass}
          classOptions={classOptions}
          onChange={handleClassChange}
        />
      </Header>

      <Notifications
        error={error}
        notification={notification}
        setError={setError}
        setNotification={setNotification}
      />

      <CalendarContainer
        loading={loading}
        events={events}
        viewedClass={viewedClass}
        onEventClick={onEventClick}
        onDateClick={onDateClick}
        fetchEvents={fetchEventData}
      />

      {isTeacherUser && (
        <AddTaskButton
          isVerified={isVerified}
          onClick={() => setShowModal(true)}
        />
      )}

      <TaskModals
        showModal={showModal}
        showEditModal={showEditModal}
        showViewModal={showViewModal}
        showDateModal={showDateModal}
        selectedEvent={selectedEvent}
        selectedDate={selectedDate}
        newTask={newTask}
        editTask={editTask}
        tasksForDate={tasksForDate}
        classOptions={classOptions}
        isTeacherUser={isTeacherUser}
        isVerified={isVerified}
        onBackdropClick={handleBackdropClick}
        onCloseModal={() => setShowModal(false)}
        onCloseEditModal={() => setShowEditModal(false)}
        onCloseViewModal={() => setShowViewModal(false)}
        onCloseDateModal={() => setShowDateModal(false)}
        onViewTask={handleViewTask}
        onEditClick={handleEditClick}
        onAddTask={handleAddTask} // This should be the handler for form submission
        onDeleteEvent={handleDeleteEvent}
        onEditSubmit={handleEditSubmit}
        onNewTaskChange={setNewTask}
        onEditTaskChange={setEditTask}
        onAddTaskForDate={handleAddTaskForDate} // Add this
      />

      {isMounted && showAuthModal && (
        <AuthModal
          authMode={authMode}
          authForm={authForm}
          isAuthLoading={isAuthLoading} // Now this is defined
          onBackdropClick={handleBackdropClick}
          onClose={() => setShowAuthModal(false)}
          onModeChange={() =>
            setAuthMode(authMode === "login" ? "register" : "login")
          }
          onFormChange={setAuthForm}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}
    </div>
  );
};

const LoadingPlaceholder = ({ viewedClass }) => (
  <div className="container-fluid px-0 mx-0 position-relative">
    <style>{calendarStyles}</style>
    <div className="d-flex justify-content-between align-items-center mb-4">
      <div className="d-flex align-items-center">
        <h1 className="mb-0 me-3">{viewedClass} 달력</h1>
        <button className="btn btn-outline-secondary dropdown-toggle" disabled>
          반 선택
        </button>
      </div>
      <button className="btn btn-primary" disabled>
        교사 로그인
      </button>
    </div>
    <div
      className="loading-placeholder"
      style={{
        height: "600px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  </div>
);

const AddTaskButton = ({ isVerified, onClick }) => (
  <div className="d-flex justify-content-end mt-3">
    {isVerified ? (
      <button className="btn btn-primary" onClick={onClick}>
        새 일정 추가
      </button>
    ) : (
      <button
        className="btn btn-outline-secondary"
        disabled
        title="계정 검증 후 사용 가능"
      >
        새 일정 추가 (검증 필요)
      </button>
    )}
  </div>
);

export default Page;

// For handleEditSubmit in appwriteHandlers.js
export const handleEditSubmit = async (
  e,
  editTask,
  setEvents,
  events,
  setShowEditModal,
  setSelectedEvent,
  setNotification, // Add this parameter
  setError // Add this parameter
) => {
  // Your existing code...
};

// For handleDeleteEvent in appwriteHandlers.js
export const handleDeleteEvent = async (
  eventId,
  setEvents,
  events,
  setNotification, // Add this parameter
  setError // Add this parameter
) => {
  // Your existing code...
};
