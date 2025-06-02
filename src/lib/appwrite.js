import { Client, Account, Databases, ID } from "appwrite";

// Initialize the Appwrite client
const client = new Client();

// Get configuration from environment variables
const appwriteEndpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const appwriteProjectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";

// Configure the client with your Appwrite project details
client.setEndpoint(appwriteEndpoint).setProject(appwriteProjectId);

// Log configuration in development mode (without exposing sensitive data)
if (process.env.NODE_ENV === "development") {
  console.log("Appwrite client configured with:", {
    endpoint: appwriteEndpoint,
    projectIdSet: !!appwriteProjectId,
  });
}

// Initialize Appwrite services directly for client-side use
const account = new Account(client);
const databases = new Databases(client);

// App configuration from environment variables
const AppwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  calendarEventsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "",
};

// Log database config in development mode
if (process.env.NODE_ENV === "development") {
  console.log("Appwrite database config:", {
    databaseIdSet: !!AppwriteConfig.databaseId,
    eventsCollectionIdSet: !!AppwriteConfig.calendarEventsCollectionId,
  });
}

export { client, account, databases, AppwriteConfig, ID };

// Handle login
const handleLogin = async (e) => {
  e.preventDefault();
  setError(null); // Clear any existing errors

  try {
    console.log("Attempting to login with:", authForm.email);

    // Use Appwrite SDK directly
    const session = await account.createEmailPasswordSession(
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
  }
};

// Handle registration
const handleRegister = async (e) => {
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
      await account.createEmailPasswordSession(authForm.email, authForm.password);

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
    } catch (loginError) {
      console.error("Auto-login error:", loginError);
      setError("계정은 생성되었지만 로그인하지 못했습니다. 로그인해주세요.");
      setAuthMode("login");
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
  }
};

// Handle logout
const handleLogout = async () => {
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
  } catch (error) {
    console.error("Logout error:", error);

    // Force logout locally even if API call fails
    setIsTeacherUser(false);

    setNotification({
      show: true,
      message: "로그아웃 중 오류가 발생했습니다.",
      type: "warning",
    });
  }
};

// Check authentication status
const checkAuthStatus = async () => {
  try {
    // Use Appwrite SDK directly
    const user = await account.get();
    setIsTeacherUser(true);
    console.log("User is authenticated:", user);
  } catch (error) {
    // Expected error if not logged in
    setIsTeacherUser(false);
    console.log("User is not authenticated");
  }
};

// Fetch calendar events
const fetchEvents = async () => {
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
  } catch (err) {
    console.error("Error fetching events:", err);
    setError("Failed to load calendar events");
  } finally {
    setLoading(false);
  }
};

// Add a new task/event
const handleAddTask = async (e) => {
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
  } catch (error) {
    console.error("Error adding task:", error);
    setError("일정 추가에 실패했습니다.");
  }
};

// Delete an event
const handleDeleteEvent = async (eventId) => {
  if (!confirm("이 일정을 삭제하시겠습니까?")) {
    return;
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
  } catch (error) {
    console.error("Error deleting event:", error);
    setError("일정 삭제에 실패했습니다.");
  }
};

// Edit an existing task
const handleEditSubmit = async (e) => {
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
  } catch (error) {
    console.error("Error updating task:", error);
    setError("일정 수정에 실패했습니다.");
  }
};
