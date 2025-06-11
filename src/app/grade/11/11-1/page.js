"use client";

import { useState, useEffect } from "react";
import ReactDOM from "react-dom";
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
  // Add this state to track client-side mounting
  const [isMounted, setIsMounted] = useState(false);

  // Existing state variables
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
    date: "", // Remove initial date value to prevent hydration mismatch
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
  const [appwriteStatus, setAppwriteStatus] = useState("Unknown");

  // This effect sets isMounted to true after component mounts on client
  useEffect(() => {
    setIsMounted(true);

    // Set initial date here to avoid hydration mismatch
    setNewTask((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }));
  }, []);

  useEffect(() => {
    // Only run these effects on the client side
    if (isMounted) {
      checkAuthStatus(setIsTeacherUser);
      fetchEvents(setLoading, setEvents, setError);
    }
  }, [isMounted]);

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
      // Try to get the user account
      let user = null;
      let authStatus = "Not authenticated";

      try {
        user = await account.get();
        authStatus = "Authenticated";
      } catch (authError) {
        // Expected error if not logged in
        console.log("Not logged in:", authError.message);
      }

      // Set debug info regardless of authentication status
      setDebugInfo({
        isTeacherUser,
        authMode,
        authStatus,
        hasUser: !!user,
        userId: user ? user.$id : null,
        email: user ? user.email : null,
        eventCount: events.length,
        appwriteConfigured: true,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
      });
    } catch (error) {
      // Handle any other unexpected errors
      console.error("Debug info error:", error);
      setDebugInfo({
        error: error.message,
        isTeacherUser,
        errorTimestamp: new Date().toISOString(),
      });
    }
  };

  // You can also update your checkAuthStatus wrapper to handle errors better
  const checkAuthStatusDebug = () => {
    checkAuthStatus(setIsTeacherUser);

    // Add a notification about the check
    setNotification({
      show: true,
      message: isTeacherUser
        ? "인증 상태: 로그인됨"
        : "인증 상태: 로그인되지 않음",
      type: isTeacherUser ? "success" : "info",
    });
  };

  // Test Appwrite connection
  const testAppwriteConnection = async () => {
    try {
      // Try a lighter weight API call that doesn't require authentication
      const health = await fetch("https://cloud.appwrite.io/v1/health");
      const data = await health.json();

      setAppwriteStatus("Connected");
      setDebugInfo((prev) => ({
        ...prev,
        appwriteHealth: data,
        connectionStatus: "Connected",
        endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
        projectIdConfigured: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      }));

      setNotification({
        show: true,
        message: "Appwrite 서비스에 성공적으로 연결되었습니다.",
        type: "success",
      });
    } catch (error) {
      console.error("Appwrite connection test failed:", error);
      setAppwriteStatus("Failed");
      setDebugInfo((prev) => ({
        ...prev,
        connectionError: error.message,
        connectionStatus: "Failed",
        testTime: new Date().toISOString(),
      }));

      setNotification({
        show: true,
        message: "Appwrite 서비스 연결 테스트 실패: " + error.message,
        type: "danger",
      });
    }
  };

  // For date-related rendering, handle null cases
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("ko-KR");
    } catch (e) {
      return "";
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

  // If not mounted yet, render a minimal placeholder
  if (!isMounted) {
    return (
      <div className="container px-0 mx-0 position-relative">
        <style>{calendarStyles}</style>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="mb-0">느헤미아반 달력</h1>
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
  }

  // Regular render with client-side data
  return (
    <div className="container mx-0 px-0 position-relative">
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
        {!loading ? (
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
        ) : (
          <div
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
        )}
      </div>

      {/* Teacher-only controls */}
      {isTeacherUser && (
        <div className="d-flex justify-content-end mt-3">
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            새 일정 추가
          </button>
        </div>
      )}

      {/* All modals are rendered conditionally on the client side */}
      {/* Auth modal */}
      {isMounted &&
        showAuthModal &&
        ReactDOM.createPortal(
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
                            setAuthForm({
                              ...authForm,
                              password: e.target.value,
                            })
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
          </div>,
          document.body
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
      {/* View event modal */}
      {showViewModal && selectedEvent && (
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
                  <h5 className="modal-title">{selectedEvent.title}</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowViewModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>날짜:</strong>{" "}
                    {new Date(selectedEvent.start).toLocaleDateString("ko-KR")}
                  </p>
                  {selectedEvent.subject && (
                    <p>
                      <strong>과목:</strong> {selectedEvent.subject}
                    </p>
                  )}
                  {selectedEvent.description && (
                    <div>
                      <strong>설명:</strong>
                      <p>{selectedEvent.description}</p>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  {isTeacherUser && (
                    <>
                      <button
                        className="btn btn-danger me-auto"
                        onClick={() =>
                          wrappedHandleDeleteEvent(selectedEvent.id)
                        }
                      >
                        삭제
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleEditClick}
                      >
                        수정
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowViewModal(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit event modal */}
      {showEditModal && (
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
                  <h5 className="modal-title">일정 수정</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEditModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={wrappedHandleEditSubmit}>
                    <div className="mb-3">
                      <label htmlFor="editTaskTitle" className="form-label">
                        제목
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editTaskTitle"
                        value={editTask.title}
                        onChange={(e) =>
                          setEditTask({ ...editTask, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editTaskSubject" className="form-label">
                        과목
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="editTaskSubject"
                        value={editTask.subject || ""}
                        onChange={(e) =>
                          setEditTask({ ...editTask, subject: e.target.value })
                        }
                        placeholder="과목을 입력하세요 (예: 수학, 과학)"
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="editTaskDate" className="form-label">
                        날짜
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        id="editTaskDate"
                        value={editTask.date}
                        onChange={(e) =>
                          setEditTask({ ...editTask, date: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label
                        htmlFor="editTaskDescription"
                        className="form-label"
                      >
                        설명 (선택)
                      </label>
                      <textarea
                        className="form-control"
                        id="editTaskDescription"
                        rows="3"
                        value={editTask.description}
                        onChange={(e) =>
                          setEditTask({
                            ...editTask,
                            description: e.target.value,
                          })
                        }
                      ></textarea>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowEditModal(false)}
                      >
                        취소
                      </button>
                      <button type="submit" className="btn btn-primary">
                        저장
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date events modal */}
      {showDateModal && selectedDate && (
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
                    {new Date(selectedDate).toLocaleDateString("ko-KR")} 일정
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDateModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  {tasksForDate.length > 0 ? (
                    <div>
                      <h6>이날의 일정:</h6>
                      <ul className="list-group">
                        {tasksForDate.map((task) => (
                          <li
                            key={task.id}
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => handleViewTask(task)}
                            style={{ cursor: "pointer" }}
                          >
                            <div>
                              <strong>{task.title}</strong>
                              {task.subject && (
                                <span className="badge bg-info ms-2">
                                  {task.subject}
                                </span>
                              )}
                            </div>
                            <i className="bi bi-chevron-right"></i>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-center">이날의 일정이 없습니다.</p>
                  )}
                </div>
                <div className="modal-footer">
                  {isTeacherUser && (
                    <button
                      className="btn btn-primary me-auto"
                      onClick={() => {
                        setNewTask({
                          ...newTask,
                          date: selectedDate,
                        });
                        setShowDateModal(false);
                        setShowModal(true);
                      }}
                    >
                      이날 일정 추가
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowDateModal(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
