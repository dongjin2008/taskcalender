import { Client, Account, Databases, ID } from "appwrite";

// Check if code is running on server side
const isServer = typeof window === "undefined";

// Initialize the Appwrite client with appropriate credentials
const client = new Client();

// Configure client differently for server vs client
if (isServer) {
  // Server-side configuration
  const endpoint =
    process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
  const projectId = process.env.APPWRITE_PROJECT_ID;

  // Log configuration for debugging
  console.log("Server Appwrite config:", {
    endpoint,
    projectId: projectId ? "Set (value hidden)" : "NOT SET", // Don't log actual project ID
  });

  // Set up client
  client.setEndpoint(endpoint).setProject(projectId || "");

  // Log warning if project ID is missing
  if (!projectId) {
    console.warn("WARNING: Appwrite Project ID is not set!");
  }

  // Development mode settings
  if (process.env.NODE_ENV === "development") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.warn(
      "Warning: Accepting insecure certificates (development mode only)"
    );
  }
}

// Initialize Appwrite services
const account = isServer ? new Account(client) : null;
const databases = isServer ? new Databases(client) : null;

// App configuration
const AppwriteConfig = {
  databaseId: isServer ? process.env.APPWRITE_DATABASE_ID : "",
  calendarEventsCollectionId: isServer
    ? process.env.APPWRITE_EVENTS_COLLECTION_ID
    : "",
};

// Helper function to check if the current user is authenticated
const isTeacher = async () => {
  if (isServer) {
    return false; // Server-side default
  }

  try {
    // Use an API endpoint to check authentication
    const response = await fetch("/api/auth/status", {
      credentials: "include", // Important for cookies
      cache: "no-store", // Prevent caching auth status
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return !!data.isAuthenticated;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};

export { client, account, databases, AppwriteConfig, isTeacher, ID, isServer };
