"use client";

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import koLocale from "@fullcalendar/core/locales/ko";
import { account } from "@/lib/appwrite";
import {
  checkAuthStatus,
  fetchEvents,
  handleLogin,
  handleRegister,
  handleLogout,
  handleAddTask,
  handleDeleteEvent,
  handleEditSubmit,
} from "@/lib/appwriteHandlers";

const Page = () => {
  // State variables here
  const [events, setEvents] = useState([]);
  const [isTeacherUser, setIsTeacherUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // More state variables for UI
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Form state variables
  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    subject: "",
  });

  const [editTask, setEditTask] = useState({
    id: "",
    title: "",
    date: "",
    description: "",
    subject: "",
  });

  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Debug state
  const [debugInfo, setDebugInfo] = useState({});
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    // DEVELOPMENT MODE - No iframe checking for local development
    // Always proceed with initialization
    checkAuthStatus(setIsTeacherUser);
    fetchEvents(setLoading, setEvents, setError);
  }, []);

  // Events for date clicking, etc.
  const handleDateClick = (arg) => {
    setSelectedDate(arg.dateStr);
    setShowDateModal(true);
  };

  const handleEventClick = (info) => {
    setSelectedEvent({
      id: info.event.id,
      title: info.event.title,
      start: info.event.start,
      description: info.event.extendedProps.description || "",
      subject: info.event.extendedProps.subject || "",
    });
    setShowViewModal(true);
  };

  const handleViewTask = (task) => {
    setSelectedEvent(task);
    setShowDateModal(false);
    setShowViewModal(true);
  };

  const handleEditClick = () => {
    setEditTask({
      id: selectedEvent.id,
      title: selectedEvent.title,
      date: new Date(selectedEvent.start).toISOString().split("T")[0],
      description: selectedEvent.description || "",
      subject: selectedEvent.subject || "",
    });
    setShowViewModal(false);
    setShowEditModal(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      // Close all modals
      setShowModal(false);
      setShowAuthModal(false);
      setShowEditModal(false);
      setShowViewModal(false);
      setShowDateModal(false);
    }
  };

  // Wrap the handler functions with the required state params
  const wrappedHandleLogin = (e) => {
    handleLogin(
      e,
      authForm,
      setError,
      setIsTeacherUser,
      setShowAuthModal,
      setAuthForm,
      setNotification
    );
  };

  const wrappedHandleRegister = (e) => {
    handleRegister(
      e,
      authForm,
      setError,
      setIsTeacherUser,
      setShowAuthModal,
      setAuthForm,
      setNotification,
      setAuthMode
    );
  };

  const wrappedHandleLogout = () => {
    handleLogout(setIsTeacherUser, setNotification);
  };

  const wrappedHandleAddTask = (e) => {
    handleAddTask(
      e,
      newTask,
      setEvents,
      events,
      setNewTask,
      setShowModal,
      setNotification,
      setError
    );
  };

  const wrappedHandleDeleteEvent = (eventId) => {
    handleDeleteEvent(
      eventId,
      setEvents,
      events,
      setShowViewModal,
      setShowDateModal,
      setNotification,
      setError
    );
  };

  const wrappedHandleEditSubmit = (e) => {
    handleEditSubmit(
      e,
      editTask,
      setEvents,
      events,
      setShowEditModal,
      setSelectedEvent,
      setNotification,
      setError
    );
  };

  // Get tasks for the selected date
  const tasksForDate = selectedDate
    ? events.filter(
        (event) =>
          new Date(event.start).toISOString().split("T")[0] === selectedDate
      )
    : [];

  // Debug info checker
  const checkDebugInfo = async () => {
    try {
      const user = await account.get().catch(() => null);

      setDebugInfo({
        isTeacherUser,
        authMode,
        hasUser: !!user,
        userId: user ? user.$id : null,
        eventCount: events.length,
        appwriteConfigured: true,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      setDebugInfo({
        error: error.message,
        isTeacherUser,
      });
    }
  };

  // Calendar styles
  const calendarStyles = `
    .fc-event {
      cursor: pointer;
    }
    .fc-day-today {
      background-color: rgba(255, 220, 40, 0.15) !important;
    }
    .fc-daygrid-day:hover {
      background-color: rgba(0, 0, 0, 0.02);
    }
  `;

  return (
    <div className="container mt-5 position-relative">
      {/* Development mode banner */}
      {process.env.NODE_ENV === "development" && (
        <div className="alert alert-warning mb-3" role="alert">
          <strong>개발 모드:</strong> 접근 제한이 일시적으로 비활성화되었습니다.
        </div>
      )}

      <style>{calendarStyles}</style>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">느헤미아반 달력</h1>
        {isTeacherUser ? (
          <div>
            <span className="me-2">교사 로그인됨</span>
            <button
              className="btn btn-outline-secondary"
              onClick={wrappedHandleLogout}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setShowAuthModal(true)}
          >
            교사 로그인
          </button>
        )}
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}

      {notification.show && (
        <div
          className={`alert alert-${notification.type} alert-dismissible fade show`}
          role="alert"
        >
          {notification.message}
          <button
            type="button"
            className="btn-close"
            onClick={() =>
              setNotification({ show: false, message: "", type: "info" })
            }
            aria-label="Close"
          ></button>
        </div>
      )}

      {/* Calendar component */}
      <div className="calendar-container">
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            bootstrap5Plugin,
          ]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "",
          }}
          locale={koLocale}
          themeSystem="bootstrap5"
          height={600}
          events={events}
          eventClick={handleEventClick}
          dateClick={handleDateClick}
        />
      </div>

      {/* Teacher-only controls */}
      {(isTeacherUser || process.env.NODE_ENV === "development") && (
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            새 일정 추가
          </button>
        </div>
      )}

      {/* Auth modal */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div
            className="modal-backdrop fade show"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1040,
            }}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {authMode === "login" ? "교사 로그인" : "교사 등록"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAuthModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form
                    onSubmit={
                      authMode === "login"
                        ? wrappedHandleLogin
                        : wrappedHandleRegister
                    }
                  >
                    {authMode === "register" && (
                      <div className="mb-3">
                        <label htmlFor="teacherName" className="form-label">
                          이름
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="teacherName"
                          value={authForm.name}
                          onChange={(e) =>
                            setAuthForm({ ...authForm, name: e.target.value })
                          }
                          required
                        />
                      </div>
                    )}

                    <div className="mb-3">
                      <label htmlFor="teacherEmail" className="form-label">
                        이메일
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="teacherEmail"
                        value={authForm.email}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="teacherPassword" className="form-label">
                        비밀번호
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        id="teacherPassword"
                        value={authForm.password}
                        onChange={(e) =>
                          setAuthForm({ ...authForm, password: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-link"
                        onClick={() =>
                          setAuthMode(
                            authMode === "login" ? "register" : "login"
                          )
                        }
                      >
                        {authMode === "login"
                          ? "계정이 없습니까? 등록하세요."
                          : "계정이 이미 있습니까? 로그인하세요."}
                      </button>
                      <button type="submit" className="btn btn-primary">
                        {authMode === "login" ? "로그인" : "등록"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All the other modals */}
      {/* ...add task modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div
            className="modal-backdrop fade show"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1040,
            }}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">새 일정 추가</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={wrappedHandleAddTask}>
                    {/* Form content */}
                    <div className="mb-3">
                      <label htmlFor="taskTitle" className="form-label">
                        제목
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="taskTitle"
                        value={newTask.title}
                        onChange={(e) =>
                          setNewTask({ ...newTask, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="taskSubject" className="form-label">
                        과목
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="taskSubject"
                        value={newTask.subject || ""}
                        onChange={(e) =>
                          setNewTask({ ...newTask, subject: e.target.value })
                        }
                        placeholder="과목을 입력하세요 (예: 수학, 과학)"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="taskDate" className="form-label">
                        날짜
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="taskDate"
                        value={newTask.date}
                        onChange={(e) =>
                          setNewTask({ ...newTask, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="taskDescription" className="form-label">
                        설명 (선택)
                      </label>
                      <textarea
                        className="form-control"
                        id="taskDescription"
                        rows="3"
                        value={newTask.description}
                        onChange={(e) =>
                          setNewTask({
                            ...newTask,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowModal(false)}
                      >
                        닫기
                      </button>
                      <button type="submit" className="btn btn-primary">
                        추가
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other modals - edit, view, date modals etc. */}
      {/* ... */}

      {/* Debug panel */}
      {process.env.NODE_ENV !== "production" && (
        <div className="mt-5 border-top pt-3">
          <button
            className="btn btn-sm btn-outline-secondary mb-2"
            onClick={() => {
              setShowDebug(!showDebug);
              if (!showDebug) checkDebugInfo();
            }}
          >
            {showDebug ? "Hide Debug Info" : "Show Debug Info"}
          </button>

          {showDebug && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Debug Information</h5>
                <p>Is Teacher: {isTeacherUser ? "Yes" : "No"}</p>
                <p>Auth Mode: {authMode}</p>
                <button
                  className="btn btn-sm btn-secondary me-2"
                  onClick={() => checkAuthStatus(setIsTeacherUser)}
                >
                  Check Auth Status
                </button>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={checkDebugInfo}
                >
                  Check Appwrite
                </button>
                <pre className="mt-3 bg-light p-3 rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
