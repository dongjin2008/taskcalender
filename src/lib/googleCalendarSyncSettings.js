// Utilities for managing Google Calendar sync settings
const STORAGE_KEY_SYNC_CLASSES = "googleCalendarSyncClasses";

export const googleCalendarSyncSettings = {
  /**
   * Get the classes selected for Google Calendar sync
   *
   * @returns {string[]} Array of class IDs selected for sync
   */
  getSyncClasses() {
    if (typeof window === "undefined") return [];

    try {
      const classes = localStorage.getItem(STORAGE_KEY_SYNC_CLASSES);
      return classes ? JSON.parse(classes) : [];
    } catch (error) {
      console.error("Error retrieving sync classes:", error);
      return [];
    }
  },

  /**
   * Set the classes to sync with Google Calendar
   *
   * @param {string[]} classIds - Array of class IDs to sync
   */
  setSyncClasses(classIds) {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY_SYNC_CLASSES, JSON.stringify(classIds));
    } catch (error) {
      console.error("Error saving sync classes:", error);
    }
  },

  /**
   * Add a class to sync with Google Calendar
   *
   * @param {string} classId - Class ID to add for syncing
   */
  addSyncClass(classId) {
    const classes = this.getSyncClasses();
    if (!classes.includes(classId)) {
      classes.push(classId);
      this.setSyncClasses(classes);
    }
  },

  /**
   * Remove a class from Google Calendar sync
   *
   * @param {string} classId - Class ID to remove from syncing
   */
  removeSyncClass(classId) {
    const classes = this.getSyncClasses();
    const updatedClasses = classes.filter((id) => id !== classId);
    this.setSyncClasses(updatedClasses);
  },

  /**
   * Toggle a class for Google Calendar sync
   *
   * @param {string} classId - Class ID to toggle
   * @returns {boolean} - True if class is now selected for sync, false otherwise
   */
  toggleSyncClass(classId) {
    const classes = this.getSyncClasses();
    const isCurrentlySynced = classes.includes(classId);

    if (isCurrentlySynced) {
      this.removeSyncClass(classId);
    } else {
      this.addSyncClass(classId);
    }

    return !isCurrentlySynced;
  },

  /**
   * Check if a class is selected for syncing
   *
   * @param {string} classId - Class ID to check
   * @returns {boolean} - True if class is selected for sync
   */
  isClassSynced(classId) {
    return this.getSyncClasses().includes(classId);
  },

  /**
   * Check if a task should be synced based on its class and date
   *
   * @param {Object} task - Task object with class and date information
   * @returns {boolean} - True if task should be synced
   */
  shouldSyncTask(task) {
    // Don't sync tasks without a date
    if (!task.date) return false;

    // Only sync tasks that are due today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    const taskDate = new Date(task.date);
    taskDate.setHours(0, 0, 0, 0); // Set to start of day

    if (taskDate < today) {
      // Task is in the past, don't sync
      return false;
    }

    const syncClasses = this.getSyncClasses();

    // If no classes are specifically selected for sync, don't sync any tasks
    if (syncClasses.length === 0) return false;

    // Check if any of the task's classes are in the sync list
    if (Array.isArray(task.class)) {
      return task.class.some((classId) => syncClasses.includes(classId));
    }

    // If task.class is a string, check if it's in the sync list
    return syncClasses.includes(task.class);
  },
};
