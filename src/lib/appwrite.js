import { Client, Account, Databases, ID } from "appwrite";

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1"
  )
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

// Initialize Appwrite services
const account = new Account(client);
const databases = new Databases(client);

// App configuration
const AppwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "",
  calendarEventsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID || "",

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
    // Try to get current account info - will fail if not logged in
    const user = await account.get();
    return !!user.$id; // Will be true if user exists and has an ID
  } catch (error) {
    return false;
  }
};

export { client, account, databases, AppwriteConfig, isTeacher, ID };
