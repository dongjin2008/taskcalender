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
    .setProject(process.env.APPWRITE_PROJECT_ID || "");
} else {
  // Client-side configuration - use API endpoints instead of direct DB access
  // We'll need to create an API route to securely handle client-side requests
  client
    .setEndpoint(process.env.NEXT_PUBLIC_API_ENDPOINT || "/api")
    .setProject("client"); // This can be any placeholder value
}

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);

// App configuration - keep private details server-side only
const AppwriteConfig = {
  // Use variables without exposing them to client
  databaseId: isServer ? process.env.APPWRITE_DATABASE_ID : "",
  calendarEventsCollectionId: isServer
    ? process.env.APPWRITE_EVENTS_COLLECTION_ID
    : "",

  // Parse allowed domains from environment variable
  get allowedDomains() {
    try {
      if (process.env.ALLOWED_DOMAINS) {
        return JSON.parse(process.env.ALLOWED_DOMAINS);
      }
    } catch (e) {
      console.error("Error parsing ALLOWED_DOMAINS:", e);
    }

    return [];
  },
};

// Helper function to check if the current user is authenticated
const isTeacher = async () => {
  try {
    const user = await account.get();
    return !!user.$id;
  } catch (error) {
    return false;
  }
};

export { client, account, databases, AppwriteConfig, isTeacher, ID };
