import { account } from "./appwrite";

/**
 * Safe wrapper around Appwrite account operations
 */
export const SessionManager = {
  /**
   * Safely gets the current session
   */
  getCurrentSession: async () => {
    try {
      return await account.getSession('current');
    } catch (error) {
      console.log("No active session:", error);
      return null;
    }
  },
  
  /**
   * Safely checks if user is logged in
   */
  isLoggedIn: async () => {
    try {
      const session = await account.getSession('current');
      return !!session;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Safely logs out the user
   */
  logout: async () => {
    try {
      // Try to delete the current session
      await account.deleteSession('current');
      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      return false;
    }
  },
  
  /**
   * Get all sessions (useful for debugging)
   */
  getAllSessions: async () => {
    try {
      return await account.listSessions();
    } catch (error) {
      console.error("Error getting sessions:", error);
      return { sessions: [] };
    }
  },
  
  /**
   * Log out from all sessions
   */
  logoutAll: async () => {
    try {
      // Try to delete all sessions
      const sessions = await account.listSessions();
      if (sessions && sessions.sessions) {
        for (const session of sessions.sessions) {
          try {
            await account.deleteSession(session.$id);
          } catch (e) {
            console.log(`Failed to delete session ${session.$id}:`, e);
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Error during complete logout:", error);
      return false;
    }
  }
};