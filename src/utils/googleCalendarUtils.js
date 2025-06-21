/**
 * Utilities for handling Google Calendar integration
 */
export const googleCalendarUtils = {
  /**
   * Maximum length for Google Calendar event IDs in Appwrite
   * This should match the size set in your Appwrite schema
   */
  maxEventIdLength: 512,

  /**
   * Validates and processes a Google Calendar event ID to ensure it meets storage requirements
   *
   * @param {string} eventId - The Google Calendar event ID to validate
   * @param {boolean} shouldTruncate - Whether to truncate the ID if it exceeds the max length
   * @returns {object} - Result with processed ID and validation info
   */
  validateEventId(eventId, shouldTruncate = true) {
    if (!eventId) {
      return {
        isValid: false,
        id: null,
        message: "Event ID is empty or null",
        originalId: eventId,
      };
    }

    // Check if the ID exceeds the maximum length
    if (eventId.length > this.maxEventIdLength) {
      console.warn(
        `Google Calendar event ID exceeds maximum length (${eventId.length}/${this.maxEventIdLength})`
      );

      return {
        isValid: false,
        id: shouldTruncate
          ? eventId.substring(0, this.maxEventIdLength)
          : eventId,
        isTruncated: shouldTruncate,
        message: `Event ID exceeds maximum length (${eventId.length}/${this.maxEventIdLength})`,
        originalId: eventId,
        originalLength: eventId.length,
      };
    }

    // ID is valid and within length limits
    return {
      isValid: true,
      id: eventId,
      message: "Valid event ID",
      originalId: eventId,
    };
  },

  /**
   * Gets a storage-safe version of a Google Calendar event ID
   * Truncates the ID if it exceeds the maximum length
   *
   * @param {string} eventId - The Google Calendar event ID
   * @returns {string} - Storage-safe version of the event ID
   */
  getSafeEventId(eventId) {
    const result = this.validateEventId(eventId, true);
    return result.id;
  },

  /**
   * Clean up all Google Calendar events created by the app
   * Used when a user deselects all classes or disconnects from Google Calendar
   *
   * @param {Object} options - Cleanup options
   * @param {string} options.accessToken - Google OAuth2 access token
   * @param {Function} options.databases - Appwrite databases instance
   * @param {string} options.databaseId - Appwrite database ID
   * @param {string} options.collectionId - Appwrite collection ID
   * @param {Function} options.onProgress - Optional callback for progress updates
   * @returns {Promise<Object>} - Results of cleanup operation
   */
  async cleanupGoogleCalendarEvents({
    accessToken,
    databases,
    databaseId,
    collectionId,
    onProgress = null,
  }) {
    // Import here to avoid circular dependencies
    const { googleCalendarService } = await import(
      "../lib/googleCalendarService"
    );
    const { Query } = await import("appwrite");

    if (!accessToken) {
      throw new Error("Access token is required for Google Calendar cleanup");
    }

    const results = {
      total: 0,
      deleted: 0,
      failed: 0,
      notFound: 0,
      updated: 0,
      details: [],
    };

    try {
      // Find all events with googleCalendarEventId
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.isNotNull("googleCalendarEventId"),
        Query.limit(500), // Limit batch size for safety
      ]);

      results.total = response.documents.length;

      // Report initial progress
      if (onProgress) {
        onProgress({
          status: "started",
          message: `Starting cleanup of ${results.total} Google Calendar events`,
          current: 0,
          total: results.total,
        });
      }

      // Process each task with a Google Calendar event ID
      for (let i = 0; i < response.documents.length; i++) {
        const task = response.documents[i];
        const eventId = task.googleCalendarEventId;

        try {
          // Report progress
          if (onProgress) {
            onProgress({
              status: "processing",
              message: `Processing ${i + 1}/${results.total}: ${task.title}`,
              current: i + 1,
              total: results.total,
            });
          }

          // Delete from Google Calendar
          let deletedFromGoogle = false;
          try {
            await googleCalendarService.deleteCalendarEvent(
              accessToken,
              eventId
            );
            deletedFromGoogle = true;
            results.deleted++;
          } catch (deleteError) {
            // Handle "not found" errors (event might be already deleted)
            if (
              deleteError.message &&
              deleteError.message.includes("Not Found")
            ) {
              results.notFound++;
            } else {
              results.failed++;
              console.error(
                `Failed to delete event ${eventId} from Google Calendar:`,
                deleteError
              );
            }
          }

          // Update Appwrite document to remove the Google Calendar event ID
          await databases.updateDocument(databaseId, collectionId, task.$id, {
            googleCalendarEventId: null,
          });

          results.updated++;
          results.details.push({
            taskId: task.$id,
            title: task.title,
            googleEventId: eventId,
            deletedFromGoogle: deletedFromGoogle,
            updatedInAppwrite: true,
          });
        } catch (taskError) {
          console.error(`Error processing task ${task.$id}:`, taskError);
          results.details.push({
            taskId: task.$id,
            title: task.title,
            googleEventId: eventId,
            error: taskError.message,
          });
        }
      }

      // Report completion
      if (onProgress) {
        onProgress({
          status: "completed",
          message: `Completed cleanup: ${results.deleted} events deleted, ${results.notFound} not found, ${results.failed} failed`,
          current: results.total,
          total: results.total,
          results,
        });
      }

      return results;
    } catch (error) {
      console.error("Error during Google Calendar cleanup:", error);

      // Report error
      if (onProgress) {
        onProgress({
          status: "error",
          message: `Error during cleanup: ${error.message}`,
          error,
        });
      }

      throw error;
    }
  },

  /**
   * Clean up Google Calendar events for a specific class
   * Used when a user deselects a class from syncing
   *
   * @param {Object} options - Cleanup options
   * @param {string} options.classId - The class ID to clean up events for
   * @param {string} options.accessToken - Google OAuth2 access token
   * @param {Function} options.databases - Appwrite databases instance
   * @param {string} options.databaseId - Appwrite database ID
   * @param {string} options.collectionId - Appwrite collection ID
   * @param {Function} options.onProgress - Optional callback for progress updates
   * @returns {Promise<Object>} - Results of cleanup operation
   */
  async cleanupGoogleCalendarEventsForClass({
    classId,
    accessToken,
    databases,
    databaseId,
    collectionId,
    onProgress = null,
  }) {
    // Import here to avoid circular dependencies
    const { googleCalendarService } = await import(
      "../lib/googleCalendarService"
    );
    const { Query } = await import("appwrite");

    if (!accessToken || !classId) {
      throw new Error(
        "Access token and class ID are required for Google Calendar cleanup"
      );
    }

    const results = {
      total: 0,
      deleted: 0,
      failed: 0,
      notFound: 0,
      updated: 0,
      details: [],
    };

    try {
      // Find events with googleCalendarEventId for the specified class
      const response = await databases.listDocuments(databaseId, collectionId, [
        Query.isNotNull("googleCalendarEventId"),
        Query.search("class", classId),
        Query.limit(500), // Limit batch size for safety
      ]);

      results.total = response.documents.length;

      // Report initial progress
      if (onProgress) {
        onProgress({
          status: "started",
          message: `Starting cleanup of ${results.total} Google Calendar events for class ${classId}`,
          current: 0,
          total: results.total,
        });
      }

      // Process each task with a Google Calendar event ID
      for (let i = 0; i < response.documents.length; i++) {
        const task = response.documents[i];
        const eventId = task.googleCalendarEventId;

        try {
          // Report progress
          if (onProgress) {
            onProgress({
              status: "processing",
              message: `Processing ${i + 1}/${results.total}: ${task.title}`,
              current: i + 1,
              total: results.total,
            });
          }

          // Delete from Google Calendar
          let deletedFromGoogle = false;
          try {
            await googleCalendarService.deleteCalendarEvent(
              accessToken,
              eventId
            );
            deletedFromGoogle = true;
            results.deleted++;
          } catch (deleteError) {
            // Handle "not found" errors (event might be already deleted)
            if (
              deleteError.message &&
              deleteError.message.includes("Not Found")
            ) {
              results.notFound++;
            } else {
              results.failed++;
              console.error(
                `Failed to delete event ${eventId} from Google Calendar:`,
                deleteError
              );
            }
          }

          // Update Appwrite document to remove the Google Calendar event ID
          await databases.updateDocument(databaseId, collectionId, task.$id, {
            googleCalendarEventId: null,
          });

          results.updated++;
          results.details.push({
            taskId: task.$id,
            title: task.title,
            googleEventId: eventId,
            deletedFromGoogle: deletedFromGoogle,
            updatedInAppwrite: true,
          });
        } catch (taskError) {
          console.error(`Error processing task ${task.$id}:`, taskError);
          results.details.push({
            taskId: task.$id,
            title: task.title,
            googleEventId: eventId,
            error: taskError.message,
          });
        }
      }

      // Report completion
      if (onProgress) {
        onProgress({
          status: "completed",
          message: `Completed cleanup for class ${classId}: ${results.deleted} events deleted, ${results.notFound} not found, ${results.failed} failed`,
          current: results.total,
          total: results.total,
          results,
        });
      }

      return results;
    } catch (error) {
      console.error(
        `Error during Google Calendar cleanup for class ${classId}:`,
        error
      );

      // Report error
      if (onProgress) {
        onProgress({
          status: "error",
          message: `Error during cleanup for class ${classId}: ${error.message}`,
          error,
        });
      }

      throw error;
    }
  },
};
