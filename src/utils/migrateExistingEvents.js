import { databases, AppwriteConfig, Query } from "../lib/appwrite";

/**
 * This migration script ensures all existing events in Appwrite
 * have the googleCalendarEventId field (set to null).
 * Run this after adding the field to your Appwrite collection schema.
 */
const migrateExistingEvents = async () => {
  try {
    console.log("Starting migration of existing events...");

    // Get all events (use pagination if you have many events)
    const response = await databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      [Query.limit(500)]
    );

    console.log(`Found ${response.documents.length} events to check`);

    const updatePromises = [];
    let updatedCount = 0;

    // Process each event
    for (const event of response.documents) {
      // Skip events that already have the field defined (not undefined)
      if (event.googleCalendarEventId !== undefined) {
        continue;
      }

      // Otherwise, update the document to set googleCalendarEventId to null
      updatePromises.push(
        databases
          .updateDocument(
            AppwriteConfig.databaseId,
            AppwriteConfig.calendarEventsCollectionId,
            event.$id,
            { googleCalendarEventId: null }
          )
          .then(() => {
            updatedCount++;
          })
          .catch((err) => {
            console.error(`Error updating event ${event.$id}:`, err);
          })
      );
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    console.log(`Migration completed: updated ${updatedCount} events`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

export default migrateExistingEvents;
