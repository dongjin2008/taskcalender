import { Client, Account, Databases, ID, Query } from "appwrite";

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

// Export everything needed
export { client, account, databases, AppwriteConfig, ID, Query };
