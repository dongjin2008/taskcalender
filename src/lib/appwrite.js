import { Client, Databases, Account, Query } from "appwrite"; // Add Query here

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

// Initialize Appwrite services
export const databases = new Databases(client);
export const account = new Account(client);

// Export Query for use in other files
export { Query }; // Add this line

// Export configuration constants
export const AppwriteConfig = {
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  calendarEventsCollectionId:
    process.env.NEXT_PUBLIC_APPWRITE_EVENTS_COLLECTION_ID,
};
