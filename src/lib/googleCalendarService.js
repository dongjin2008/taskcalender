// This service handles Google Calendar interactions using the Google API JavaScript client library
import { googleCalendarSyncSettings } from "./googleCalendarSyncSettings";

export const googleCalendarService = {
  /**
   * Create a new event in Google Calendar
   *
   * @param {string} accessToken - Google OAuth2 access token
   * @param {Object} task - Task object with details of the event
   * @returns {Promise<Object>} Created event details
   */
  async createCalendarEvent(accessToken, task) {
    if (!accessToken) {
      throw new Error(
        "Google Calendar not connected. Please connect your account first."
      );
    }

    // Check if this task should be synced based on class settings
    if (!googleCalendarSyncSettings.shouldSyncTask(task)) {
      console.log("Task not synced: Class not selected for sync", task.class);
      return { skipped: true, reason: "class_not_selected" };
    }

    try {
      // Process subject and class info for description
      const classInfo = Array.isArray(task.class)
        ? task.class.join(", ")
        : task.class;
      const subjectInfo = task.subject ? `과목: ${task.subject}` : "";

      // Create event object for Google Calendar
      const event = {
        summary: task.title,
        description: `${subjectInfo}\n${
          task.description || ""
        }\n\n반: ${classInfo}\n\n태스크 캘린더에서 생성됨`,
        start: {
          date: task.date,
        },
        end: {
          date: task.date,
        },
        reminders: {
          useDefault: true,
        },
        source: {
          title: "태스크 캘린더",
          url: window.location.origin,
        },
      };

      // Make direct fetch request to Google Calendar API using the access token
      const response = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Google Calendar API Error: ${
            errorData.error?.message || response.statusText
          }`
        );
      }

      return await response.json();
    } catch (error) {
      console.error("Google Calendar API Error:", error);
      throw new Error(
        "Failed to create event in Google Calendar: " + error.message
      );
    }
  },

  /**
   * Delete an event from Google Calendar
   *
   * @param {string} accessToken - Google OAuth2 access token
   * @param {string} eventId - Google Calendar event ID to delete
   * @returns {Promise<boolean>} True if successfully deleted
   */
  async deleteCalendarEvent(accessToken, eventId) {
    if (!accessToken || !eventId) {
      throw new Error(
        "Access token and event ID are required to delete an event"
      );
    }

    try {
      // Make direct fetch request to Google Calendar API using the access token
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Google Calendar API returns 204 No Content on successful deletion
      if (response.status === 204) {
        return true;
      }

      // For other status codes, try to get the error message
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error?.message ||
          `Failed to delete event: ${response.status}`;
        throw new Error(errorMessage);
      }

      return true;
    } catch (error) {
      // Handle "not found" errors gracefully (event might be already deleted)
      if (error.message && error.message.includes("Not Found")) {
        console.warn(
          `Event ${eventId} not found in Google Calendar, it may have been deleted already`
        );
        return true;
      }

      console.error("Error deleting Google Calendar event:", error);
      throw error;
    }
  },

  /**
   * Check if the user is connected to Google Calendar
   *
   * @returns {boolean} True if connected, false otherwise
   */
  isConnected() {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("googleCalendarToken");
  },

  /**
   * Get the stored access token
   *
   * @returns {string|null} Access token or null
   */
  getAccessToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("googleCalendarToken");
  },
};
