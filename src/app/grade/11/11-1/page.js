"use client";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrap5Plugin from "@fullcalendar/bootstrap5";
import koLocale from "@fullcalendar/core/locales/ko";
import {
  account,
  databases,
  AppwriteConfig,
  isTeacher,
} from "../../../../lib/appwrite";
import { ID, Query } from "appwrite";

const ALLOWED_PARENT_DOMAINS = ["srnschool.org"];

// Add custom styles at the top of the component
const calendarStyles = `
  .fc-day:hover {
    cursor: pointer;
  }
  .fc-daygrid-day:hover {
    cursor: pointer;
  }
  .fc-event {
    cursor: pointer;
  }
`;

const Page = () => {
  // State for modals and data
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // New state for edit modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [tasksForDate, setTasksForDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTeacherUser, setIsTeacherUser] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Login/register form state
  const [authForm, setAuthForm] = useState({
    email: "",
    password: "",
    name: "",
  });

  const [newTask, setNewTask] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    subject: "",
  });

  // New state for editing existing task
  const [editTask, setEditTask] = useState({
    id: "",
    title: "",
    date: "",
    description: "",
    subject: "",
  });

  const [events, setEvents] = useState([]);

  // Check if user is authenticated on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Try to get current account info - will fail if not logged in
        const user = await account.get();
        setIsTeacherUser(true);
      } catch (error) {
        // Expected error if not logged in
        setIsTeacherUser(false);
        // Only log if it's not the standard "not authenticated" error
        if (error.code !== 401) {
          console.error("Auth status check error:", error);
        }
      }
    };

    checkAuthStatus();
    fetchEvents();
  }, []);

  // Fetch events from Appwrite
  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Use your API route instead of direct Appwrite access
      const response = await fetch("/api/events");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load calendar events");
    } finally {
      setLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Use createEmailPasswordSession for login (notice the method name change)
      await account.createEmailPasswordSession(
        authForm.email,
        authForm.password
      );

      // Set user as authenticated
      setIsTeacherUser(true);
      setShowAuthModal(false);
      setError(null);
    } catch (error) {
      console.error("Login error:", error);
      setError("로그인 실패: 이메일이나 비밀번호가 올바르지 않습니다");
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Create a new user account
      await account.create(
        ID.unique(),
        authForm.email,
        authForm.password,
        authForm.name
      );

      // After creating account, log the user in with the correct method
      await account.createEmailPasswordSession(
        authForm.email,
        authForm.password
      );

      setIsTeacherUser(true);
      setShowAuthModal(false);
      setError(null);
    } catch (error) {
      console.error("Registration error:", error);

      // More detailed error message
      let errorMessage = "계정 생성 실패";
      if (error.code === 409) {
        errorMessage = "이미 사용 중인 이메일입니다.";
      } else if (error.code === 400) {
        errorMessage = "유효하지 않은 이메일 또는 비밀번호입니다.";
      }

      setError(errorMessage);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setIsTeacherUser(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (
      showModal ||
      showViewModal ||
      showDateModal ||
      showAuthModal ||
      showEditModal
    ) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal, showViewModal, showDateModal, showAuthModal, showEditModal]);

  // Function to handle editing an event
  const handleEditClick = () => {
    if (!isTeacherUser) {
      setError("Only teachers can edit events");
      return;
    }

    // Populate the edit form with the selected event data
    setEditTask({
      id: selectedEvent.id,
      title: selectedEvent.title,
      date: selectedEvent.start,
      description: selectedEvent.description || "",
      subject: selectedEvent.subject || "",
    });

    // Close the view modal and open the edit modal
    setShowViewModal(false);
    setShowEditModal(true);
  };

  // Function to submit edit changes
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!isTeacherUser) {
      setError("Only teachers can edit events");
      return;
    }

    try {
      // Update event in Appwrite
      await databases.updateDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.calendarEventsCollectionId,
        editTask.id,
        {
          title: editTask.title,
          date: editTask.date,
          subject: editTask.subject || "",
          description: editTask.description || "",
        }
      );

      // Update local state
      const updatedEvents = events.map((event) =>
        event.id === editTask.id
          ? {
              ...event,
              title: editTask.title,
              start: editTask.date,
              subject: editTask.subject || "",
              description: editTask.description || "",
            }
          : event
      );

      setEvents(updatedEvents);

      // If this event is part of the date tasks, update that as well
      if (
        showDateModal &&
        tasksForDate.some((task) => task.id === editTask.id)
      ) {
        const updatedTasks = tasksForDate.map((task) =>
          task.id === editTask.id
            ? {
                ...task,
                title: editTask.title,
                start: editTask.date,
                subject: editTask.subject || "",
                description: editTask.description || "",
              }
            : task
        );
        setTasksForDate(updatedTasks);
      }

      // Close the edit modal
      setShowEditModal(false);

      // Show a success message
      setError("일정이 성공적으로 업데이트되었습니다.");
      setTimeout(() => setError(null), 3000);
    } catch (error) {
      console.error("Error updating task:", error);
      setError("Failed to update task: " + error.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!isTeacherUser) {
      setError("Only teachers can add events");
      return;
    }

    try {
      // Add event to Appwrite
      const response = await databases.createDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.calendarEventsCollectionId,
        ID.unique(),
        {
          title: newTask.title,
          date: newTask.date,
          subject: newTask.subject || "",
          description: newTask.description || "",
        }
      );

      // Add new event to the calendar
      setEvents([
        ...events,
        {
          id: response.$id,
          title: response.title,
          start: response.date,
          subject: response.subject || "",
          description: response.description || "",
        },
      ]);

      // Reset form and close modal
      setNewTask({
        title: "",
        date: new Date().toISOString().split("T")[0],
        description: "",
        subject: "",
      });
      setShowModal(false);
    } catch (error) {
      console.error("Error adding task:", error);
      setError("Failed to add task: " + error.message);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target.classList.contains("modal-backdrop")) {
      setShowModal(false);
      setShowViewModal(false);
      setShowDateModal(false);
      setShowAuthModal(false);
      setShowEditModal(false);
    }
  };

  // Handle event click to show details
  const handleEventClick = (info) => {
    // Find the clicked event
    const event = events.find((event) => event.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      setShowViewModal(true);
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    if (!isTeacherUser) {
      setError("Only teachers can delete events");
      return;
    }

    try {
      // Delete from Appwrite
      await databases.deleteDocument(
        AppwriteConfig.databaseId,
        AppwriteConfig.calendarEventsCollectionId,
        eventId
      );

      // Update local state
      setEvents(events.filter((event) => event.id !== eventId));

      // If we're in the single event view modal, close it
      if (showViewModal) {
        setShowViewModal(false);
        setSelectedEvent(null);
      }

      // If we're in the date modal, update the tasks for that date
      if (showDateModal) {
        setTasksForDate(tasksForDate.filter((task) => task.id !== eventId));

        // If no tasks left for this date, close the modal
        if (tasksForDate.length === 1) {
          setShowDateModal(false);
          setSelectedDate(null);
        }
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      setError("Failed to delete task");
    }
  };

  // Handle date click - show all tasks for that date
  const handleDateClick = (arg) => {
    const clickedDate = arg.dateStr;
    const tasksOnDate = events.filter((event) => event.start === clickedDate);

    if (tasksOnDate.length > 0) {
      setSelectedDate(clickedDate);
      setTasksForDate(tasksOnDate);
      setShowDateModal(true);
    } else if (isTeacherUser) {
      // If no tasks on this date and user is a teacher, open add task modal
      setNewTask({
        ...newTask,
        date: clickedDate,
      });
      setShowModal(true);
    } else {
      // If user is not a teacher, show message
      alert("이 날짜에 일정이 없습니다.");
    }
  };

  // Handle view details of specific task from date modal
  const handleViewTask = (task) => {
    setSelectedEvent(task);
    setShowDateModal(false);
    setShowViewModal(true);
  };

  // Check if loaded in an allowed iframe
  useEffect(() => {
    // Function to check if the page is in an iframe
    const isInIframe = () => {
      try {
        return window !== window.top;
      } catch (e) {
        return true; // If we can't access window.top due to CORS, we're in an iframe
      }
    };

    // Function to check if the parent domain is allowed
    const checkParentDomain = () => {
      try {
        // Try to get the parent domain
        const parentDomain = window.parent.location.hostname;

        // Check if parent domain is in allowed list
        const allowed = ALLOWED_PARENT_DOMAINS.some(
          (domain) =>
            parentDomain === domain || parentDomain.endsWith(`.${domain}`)
        );

        return allowed;
      } catch (e) {
        // If we can't access parent due to CORS, assume it's not allowed
        console.error("Cannot access parent domain:", e);
        return false;
      }
    };

    // Check if we're in an iframe and it's from an allowed domain
    const inIframe = isInIframe();
    const allowedDomain = inIframe && checkParentDomain();

    setIsAllowed(allowedDomain);
    setLoading(false);

    // Additional protection: Add event listener to prevent being framed by other sites
    if (!inIframe || !allowedDomain) {
      try {
        // If we detect we're in an iframe but not allowed, try to break out
        if (window.top !== window) {
          window.top.location = window.location;
        }
      } catch (e) {
        // Cannot access parent window, likely due to security restrictions
      }
    }
  }, []);

  // Show access denied if not in allowed iframe
  if (!loading && !isAllowed) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger">
          <h2>접근 권한이 없습니다</h2>
          <p>
            이 애플리케이션은 승인된 웹사이트를 통해서만 접근할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <div className="spinner-border" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container mt-5 position-relative">
      {/* Add the style tag to inject custom CSS */}
      <style>{calendarStyles}</style>

      {/* Header with auth controls */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-0">느헤미아반 달력</h1>
        {isTeacherUser ? (
          <div>
            <span className="me-2">교사 로그인됨</span>
            <button
              className="btn btn-outline-secondary"
              onClick={handleLogout}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => {
              setAuthMode("login");
              setShowAuthModal(true);
            }}
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

      {/* Teacher only: Add Task Button */}
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

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="modal-overlay">
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
            onClick={handleBackdropClick}
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
                      authMode === "login" ? handleLogin : handleRegister
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

      {/* Add Task Modal */}
      {showModal && (
        <div className="modal-overlay">
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
            onClick={handleBackdropClick}
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
                  <form onSubmit={handleAddTask}>
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

      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="modal-overlay">
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
            onClick={handleBackdropClick}
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
                  <form onSubmit={handleEditSubmit}>
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

      {/* View Task Modal */}
      {showViewModal && selectedEvent && (
        <div className="modal-overlay">
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
            onClick={handleBackdropClick}
          ></div>
          <div
            className="modal fade show d-block"
            tabIndex="-1"
            style={{ zIndex: 1050 }}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">일정 상세 정보</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowViewModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="card mb-3 border-0">
                    <div className="card-body p-0">
                      <h4 className="card-title">{selectedEvent.title}</h4>
                      <h6 className="card-subtitle mb-2 text-muted">
                        {new Date(selectedEvent.start).toLocaleDateString(
                          "ko-KR",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            weekday: "long",
                          }
                        )}
                      </h6>

                      {selectedEvent.subject && (
                        <div className="mb-3">
                          <strong>과목:</strong> {selectedEvent.subject}
                        </div>
                      )}

                      {selectedEvent.description && (
                        <div className="mt-3">
                          <strong>설명:</strong>
                          <p className="mt-2">{selectedEvent.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  {isTeacherUser && (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={handleEditClick}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger me-2"
                        onClick={() => handleDeleteEvent(selectedEvent.id)}
                      >
                        삭제
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

      {/* Date Tasks Modal */}
      {showDateModal && selectedDate && (
        <div className="modal-overlay">
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
            onClick={handleBackdropClick}
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
                    {new Date(selectedDate).toLocaleDateString("ko-KR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      weekday: "long",
                    })}
                    의 일정
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowDateModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body">
                  <ul className="list-group list-group-flush">
                    {tasksForDate.map((task) => (
                      <li key={task.id} className="list-group-item px-0">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h5 className="mb-1">{task.title}</h5>
                            {task.subject && (
                              <span className="badge bg-secondary me-2">
                                {task.subject}
                              </span>
                            )}
                          </div>
                          <div>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleViewTask(task)}
                            >
                              보기
                            </button>
                            {isTeacherUser && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDeleteEvent(task.id)}
                              >
                                삭제
                              </button>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="modal-footer">
                  {isTeacherUser && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        setNewTask({
                          ...newTask,
                          date: selectedDate,
                        });
                        setShowDateModal(false);
                        setShowModal(true);
                      }}
                    >
                      일정 추가
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
