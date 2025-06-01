import { Client, Account, Databases, ID } from "appwrite";

// Check if code is running on server side
const isServer = typeof window === "undefined";

// Initialize the Appwrite client with appropriate credentials
const client = new Client();

// Configure client differently for server vs client
if (isServer) {
  // Server-side configuration - uses private env vars
  client
    .setEndpoint(
      process.env.APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
    )
    .setProject(process.env.APPWRITE_PROJECT_ID || "")
    .setSelfSigned(true); // For self-signed certificates in dev environment
} else {
  // Client-side configuration
  // No client-side initialization needed - using API routes
}

// Initialize Appwrite services - only used server-side
const account = isServer ? new Account(client) : null;
const databases = isServer ? new Databases(client) : null;

// App configuration - keep private details server-side only
const AppwriteConfig = {
  databaseId: isServer ? process.env.APPWRITE_DATABASE_ID : "",
  calendarEventsCollectionId: isServer
    ? process.env.APPWRITE_EVENTS_COLLECTION_ID
    : "",
};

// For client-side authentication checks, use a session cookie or token approach
const isTeacher = async () => {
  if (isServer) {
    return false; // Server-side rendering path
  }

  try {
    // Use an API endpoint to check authentication
    const response = await fetch("/api/auth/status");
    const data = await response.json();
    return data.isAuthenticated;
  } catch (error) {
    console.error("Auth check error:", error);
    return false;
  }
};

export { client, account, databases, AppwriteConfig, isTeacher, ID, isServer };
