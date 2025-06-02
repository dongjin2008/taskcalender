import { ID } from "appwrite";
import { account, databases, AppwriteConfig } from "./appwrite";

// Check authentication status
export const checkAuthStatus = async (setIsTeacherUser) => {
  try {
    // Use Appwrite SDK directly
    const user = await account.get();
    setIsTeacherUser(true);
    console.log("User is authenticated:", user);
    return true;
  } catch (error) {
    // Expected error if not logged in
    setIsTeacherUser(false);
    console.log("User is not authenticated");
    return false;
  }
};

// Fetch calendar events
export const fetchEvents = async (setLoading, setEvents, setError) => {
  setLoading(true);
  try {
    // Use Appwrite SDK directly
    const response = await databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId
    );

    // Transform Appwrite documents to calendar events
    const calendarEvents = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      start: doc.date, // Assuming date is stored in 'date' field
      description: doc.description || "",
      subject: doc.subject || "",
      // Add any other fields you need
    }));

    setEvents(calendarEvents);
    return calendarEvents;
  } catch (err) {
    console.error("Error fetching events:", err);
    setError("Failed to load calendar events");
    return [];
  } finally {
    setLoading(false);
  }
};

// Handle login
export const handleLogin = async (
  e,
  authForm,
  setError,
  setIsTeacherUser,
  setShowAuthModal,
  setAuthForm,
  setNotification
) => {
  e.preventDefault();
  setError(null); // Clear any existing errors

  try {
    console.log("Attempting to login with:", authForm.email);

    // Use Appwrite SDK directly
    const session = await account.createEmailSession(
      authForm.email,
      authForm.password
    );

    console.log("Login successful:", session);

    // Set user as authenticated
    setIsTeacherUser(true);
    setShowAuthModal(false);

    // Reset form
    setAuthForm({
      email: "",
      password: "",
      name: "",
    });

    // Show success notification
    setNotification({
      show: true,
      message: "로그인 성공!",
      type: "success",
    });

    return true;
  } catch (error) {
    console.error("Login error:", error);
    setError(
      error.message || "로그인 실패: 이메일이나 비밀번호가 올바르지 않습니다"
    );

    // Clear password on failed login
    setAuthForm({
      ...authForm,
      password: "",
    });

    return false;
  }
};

// Handle registration
export const handleRegister = async (
  e,
  authForm,
  setError,
  setIsTeacherUser,
  setShowAuthModal,
  setAuthForm,
  setNotification,
  setAuthMode
) => {
  e.preventDefault();
  setError(null); // Clear any existing errors

  try {
    console.log("Attempting to register with:", authForm.email);

    // Use Appwrite SDK directly to create account
    const user = await account.create(
      ID.unique(),
      authForm.email,
      authForm.password,
      authForm.name
    );

    console.log("Registration successful:", user);

    // Automatically login after registration
    try {
      await account.createEmailSession(authForm.email, authForm.password);

      // Set user as authenticated
      setIsTeacherUser(true);
      setShowAuthModal(false);

      // Reset form
      setAuthForm({
        email: "",
        password: "",
        name: "",
      });

      // Show success notification
      setNotification({
        show: true,
        message: "계정이 생성되었습니다!",
        type: "success",
      });

      return true;
    } catch (loginError) {
      console.error("Auto-login error:", loginError);
      setError("계정은 생성되었지만 로그인하지 못했습니다. 로그인해주세요.");
      setAuthMode("login");
      return false;
    }
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 409) {
      setError("이미 사용 중인 이메일입니다.");
    } else {
      setError(error.message || "계정 생성에 실패했습니다.");
    }

    // Clear password on failed registration
    setAuthForm({
      ...authForm,
      password: "",
    });

    return false;
  }
};

// Handle logout
export const handleLogout = async (setIsTeacherUser, setNotification) => {
  try {
    // Use Appwrite SDK directly
    await account.deleteSession("current");

    // Set user as logged out
    setIsTeacherUser(false);

    // Show notification
    setNotification({
      show: true,
      message: "로그아웃되었습니다.",
      type: "info",
    });

    return true;
  } catch (error) {
    console.error("Logout error:", error);

    // Force logout locally even if API call fails
    setIsTeacherUser(false);

    setNotification({
      show: true,
      message: "로그아웃 중 오류가 발생했습니다.",
      type: "warning",
    });

    return false;
  }
};

// Add a new task/event
export const handleAddTask = async (
  e,
  newTask,
  setEvents,
  events,
  setNewTask,
  setShowModal,
  setNotification,
  setError
) => {
  e.preventDefault();

  try {
    // Use Appwrite SDK directly
    const result = await databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      ID.unique(),
      {
        title: newTask.title,
        date: newTask.date,
        description: newTask.description,
        subject: newTask.subject || "",
      }
    );

    console.log("Task added:", result);

    // Update local state
    setEvents([
      ...events,
      {
        id: result.$id,
        title: result.title,
        start: result.date,
        description: result.description,
        subject: result.subject,
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

    // Show success notification
    setNotification({
      show: true,
      message: "일정이 추가되었습니다.",
      type: "success",
    });

    return true;
  } catch (error) {
    console.error("Error adding task:", error);
    setError("일정 추가에 실패했습니다.");
    return false;
  }
};

// Delete an event
export const handleDeleteEvent = async (
  eventId,
  setEvents,
  events,
  setShowViewModal,
  setShowDateModal,
  setNotification,
  setError
) => {
  if (!confirm("이 일정을 삭제하시겠습니까?")) {
    return false;
  }

  try {
    // Use Appwrite SDK directly
    await databases.deleteDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      eventId
    );

    // Update local state
    setEvents(events.filter((event) => event.id !== eventId));

    // Close any open modals
    setShowViewModal(false);
    setShowDateModal(false);

    // Show success notification
    setNotification({
      show: true,
      message: "일정이 삭제되었습니다.",
      type: "success",
    });

    return true;
  } catch (error) {
    console.error("Error deleting event:", error);
    setError("일정 삭제에 실패했습니다.");
    return false;
  }
};

// Edit an existing task
export const handleEditSubmit = async (
  e,
  editTask,
  setEvents,
  events,
  setShowEditModal,
  setSelectedEvent,
  setNotification,
  setError
) => {
  e.preventDefault();

  try {
    // Use Appwrite SDK directly
    const result = await databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      editTask.id,
      {
        title: editTask.title,
        date: editTask.date,
        description: editTask.description,
        subject: editTask.subject || "",
      }
    );

    console.log("Task updated:", result);

    // Update local state
    setEvents(
      events.map((event) =>
        event.id === editTask.id
          ? {
              ...event,
              title: editTask.title,
              start: editTask.date,
              description: editTask.description,
              subject: editTask.subject,
            }
          : event
      )
    );

    // Close modal and reset
    setShowEditModal(false);
    setSelectedEvent(null);

    // Show success notification
    setNotification({
      show: true,
      message: "일정이 업데이트되었습니다.",
      type: "success",
    });

    return true;
  } catch (error) {
    console.error("Error updating task:", error);
    setError("일정 수정에 실패했습니다.");
    return false;
  }
};
