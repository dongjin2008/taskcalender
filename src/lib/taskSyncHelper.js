import { googleCalendarService } from "./googleCalendarService";
import { googleCalendarSyncSettings } from "./googleCalendarSyncSettings";
import { databases, AppwriteConfig } from "./appwrite";
import { Query } from "appwrite";
import { googleCalendarUtils } from "../utils/googleCalendarUtils";

/**
 * Utility for syncing existing tasks to Google Calendar
 */
export const taskSyncHelper = {
  /**
   * Sync existing tasks for a specific class to Google Calendar
   * @param {string} classId - Class ID to sync tasks for
   * @param {string} accessToken - Google Calendar access token
   * @returns {Promise<Object>} - Results of sync operation
   */
  async syncExistingTasksForClass(classId, accessToken) {
    if (!classId || !accessToken) {
      throw new Error("Class ID and access token are required");
    }

    const results = {
      total: 0,
      synced: 0,
      skipped: 0,
      failed: 0,
      details: [],
    };

    try {
      // Get current date in YYYY-MM-DD format
      const today = new Date().toISOString().split("T")[0];

      // Query tasks that:
      // 1. Belong to the specified class
      // 2. Have a date on or after today
      // 3. Don't already have a Google Calendar event ID (not previously synced)
      const response = await databases.listDocuments(
        AppwriteConfig.databaseId,
        AppwriteConfig.calendarEventsCollectionId,
        [
          Query.search("class", classId),
          Query.greaterThanEqual("date", today),
          // Optional: Uncomment if you want to exclude already synced tasks
          // Query.equal('googleCalendarEventId', null),
          Query.limit(100), // Limit to avoid overloading the API
        ]
      );

      results.total = response.documents.length;

      // Process each task
      for (const task of response.documents) {
        try {
          // Skip if already synced
          if (task.googleCalendarEventId) {
            results.skipped++;
            results.details.push({
              taskId: task.$id,
              title: task.title,
              result: "skipped",
              reason: "already_synced",
            });
            continue;
          }

          // Sync to Google Calendar
          const googleEvent = await googleCalendarService.createCalendarEvent(
            accessToken,
            task
          );

          // Handle the response
          if (googleEvent.skipped) {
            results.skipped++;
            results.details.push({
              taskId: task.$id,
              title: task.title,
              result: "skipped",
              reason: googleEvent.reason,
            });
          } else {
            try {
              // Validate and get storage-safe version of the Google Calendar event ID
              const googleEventId = googleCalendarUtils.getSafeEventId(
                googleEvent.id
              );

              // Update task with Google Calendar event ID
              await databases.updateDocument(
                AppwriteConfig.databaseId,
                AppwriteConfig.calendarEventsCollectionId,
                task.$id,
                { googleCalendarEventId: googleEventId }
              );

              results.synced++;
              results.details.push({
                taskId: task.$id,
                title: task.title,
                result: "synced",
                googleEventId: googleEvent.id,
              });
            } catch (schemaError) {
              console.error(`Schema error for task ${task.$id}:`, schemaError);

              // Count as synced but with a warning
              results.synced++;
              results.details.push({
                taskId: task.$id,
                title: task.title,
                result: "synced_with_warning",
                googleEventId: googleEvent.id,
                warning:
                  "Google Calendar event created but ID could not be saved in Appwrite",
              });

              // For developers - log specific schema errors
              if (
                schemaError.message &&
                schemaError.message.includes(
                  'Unknown attribute: "googleCalendarEventId"'
                )
              ) {
                console.error(
                  "Appwrite schema error: Missing googleCalendarEventId attribute in the collection. Please update your schema."
                );
              }
            }
          }
        } catch (taskError) {
          console.error(`Error syncing task ${task.$id}:`, taskError);
          results.failed++;
          results.details.push({
            taskId: task.$id,
            title: task.title,
            result: "failed",
            error: taskError.message,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error during batch sync:", error);
      throw error;
    }
  },

  /**
   * Sync existing tasks for all selected classes
   * @param {string} accessToken - Google Calendar access token
   * @returns {Promise<Object>} - Results of sync operations
   */
  async syncExistingTasksForSelectedClasses(accessToken) {
    if (!accessToken) {
      throw new Error("Access token is required");
    }

    const selectedClasses = googleCalendarSyncSettings.getSyncClasses();
    const results = {
      byClass: {},
      summary: {
        total: 0,
        synced: 0,
        skipped: 0,
        failed: 0,
      },
    };

    // If no specific classes are selected, sync tasks from all classes
    if (selectedClasses.length === 0) {
      const today = new Date().toISOString().split("T")[0];

      try {
        // Get all upcoming tasks without class filtering
        const response = await databases.listDocuments(
          AppwriteConfig.databaseId,
          AppwriteConfig.calendarEventsCollectionId,
          [Query.greaterThanEqual("date", today), Query.limit(100)]
        );

        results.summary.total = response.documents.length;

        // Process each task
        for (const task of response.documents) {
          try {
            // Skip already synced tasks
            if (task.googleCalendarEventId) {
              results.summary.skipped++;
              continue;
            }

            const googleEvent = await googleCalendarService.createCalendarEvent(
              accessToken,
              task
            );

            if (!googleEvent.skipped) {
              // Update task with Google Calendar event ID
              await databases.updateDocument(
                AppwriteConfig.databaseId,
                AppwriteConfig.calendarEventsCollectionId,
                task.$id,
                { googleCalendarEventId: googleEvent.id }
              );

              results.summary.synced++;
            } else {
              results.summary.skipped++;
            }
          } catch (taskError) {
            console.error(`Error syncing task ${task.$id}:`, taskError);
            results.summary.failed++;
          }
        }
      } catch (error) {
        console.error("Error during all-class sync:", error);
        throw error;
      }

      return results;
    }

    // Sync each selected class
    for (const classId of selectedClasses) {
      try {
        const classResults = await this.syncExistingTasksForClass(
          classId,
          accessToken
        );

        // Store results for this class
        results.byClass[classId] = classResults;

        // Update summary
        results.summary.total += classResults.total;
        results.summary.synced += classResults.synced;
        results.summary.skipped += classResults.skipped;
        results.summary.failed += classResults.failed;
      } catch (error) {
        console.error(`Error syncing class ${classId}:`, error);
        results.byClass[classId] = { error: error.message };
      }
    }

    return results;
  },
};
