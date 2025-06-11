import { ID } from "appwrite";
import { account, databases, AppwriteConfig, Query } from "./appwrite";

// Check authentication status
export const checkAuthStatus = async (setIsTeacherUser, setIsVerified) => {
  try {
    const user = await account.get();

    // User is logged in
    setIsTeacherUser(true);

    // Check if the user is verified
    setIsVerified(user.emailVerification);

    return true;
  } catch (error) {
    // User is not logged in
    setIsTeacherUser(false);
    setIsVerified(false);
    return false;
  }
};

// Fetch calendar events
export const fetchEvents = async (
  setLoading,
  setEvents,
  setError,
  targetMonth = null
) => {
  try {
    setLoading(true);

    // Calculate date range (current month +/- 1 month)
    const now = targetMonth ? new Date(targetMonth) : new Date();

    // First day of previous month
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Last day of next month
    const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    // Format dates for querying
    const startDate = prevMonth.toISOString().split("T")[0];
    const endDate = nextMonthEnd.toISOString().split("T")[0];

    // Query with date filters
    const response = await databases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID,
      [
        Query.greaterThanEqual("date", startDate),
        Query.lessThanEqual("date", endDate),
        Query.limit(500), // Reasonable limit for 3 months
      ]
    );

    const formattedEvents = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      start: doc.date,
      subject: doc.subject || "",
      description: doc.description || "",
    }));

    setEvents(formattedEvents);
  } catch (error) {
    console.error("Error fetching events:", error);
    setError("일정을 불러오는 중 오류가 발생했습니다.");
  } finally {
    setLoading(false);
  }
};

// Handle login - keep using createEmailPasswordSession as you already have
export const handleLogin = async (
  e,
  authForm,
  setError,
  setIsTeacherUser,
  setIsVerified,
  setShowAuthModal,
  setNotification
) => {
  e.preventDefault();

  // Show loading state immediately
  setNotification({
    show: true,
    message: "로그인 중...",
    type: "info",
  });

  try {
    // Create session and get user info in parallel if possible
    const sessionPromise = account.createEmailPasswordSession(
      authForm.email,
      authForm.password
    );

    await sessionPromise;
    const user = await account.get();

    // Update UI states
    setIsTeacherUser(true);
    setIsVerified(user.emailVerification);
    setShowAuthModal(false);

    // Notification
    setNotification({
      show: true,
      message: user.emailVerification
        ? "성공적으로 로그인되었습니다."
        : "로그인되었지만 계정이 아직 검증되지 않았습니다.",
      type: user.emailVerification ? "success" : "warning",
    });
  } catch (error) {
    console.error("Login error:", error);
    setError("로그인 중 오류가 발생했습니다: " + error.message);

    // Clear loading notification
    setNotification({
      show: false,
      message: "",
      type: "info",
    });
  }
};

// Handle registration - keep using createEmailPasswordSession as you already have
export const handleRegister = async (
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
    console.log("Attempting to register with:", authForm.email);

    // Use Appwrite SDK directly to create account
    const user = await account.create(
      ID.unique(),
      authForm.email,
      authForm.password,
      authForm.name
    );

    console.log("Registration successful:", user);

    // Show notification about verification
    setNotification({
      show: true,
      message:
        "등록되었습니다. 계정 검증이 필요합니다. 관리자가 검증할 때까지 일정을 추가/수정/삭제할 수 없습니다.",
      type: "info",
    });

    // Close modal and reset form
    setShowAuthModal(false);
    setAuthForm({
      email: "",
      password: "",
      name: "",
    });

    // Optional: Auto login after registration
    try {
      await account.createEmailPasswordSession(
        authForm.email,
        authForm.password
      );
      setIsTeacherUser(true);
    } catch (loginError) {
      console.error("Auto login failed:", loginError);
    }
  } catch (error) {
    console.error("Registration error:", error);
    setError("등록 중 오류가 발생했습니다: " + error.message);
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
