"use client";

import { useState, useEffect } from "react";
import { account } from "@/lib/appwrite";
import { SessionManager } from "@/lib/sessionManager";
import { ID } from "appwrite";

// Update the function signature to accept setNotification
export function useAuth(setNotification) {
  const [isTeacherUser, setIsTeacherUser] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // "login" or "register"
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authRefreshTrigger, setAuthRefreshTrigger] = useState(0);

  // Check the current authentication status
  const checkAuthStatus = async () => {
    try {
      const session = await account.getSession("current");
      if (session) {
        setIsTeacherUser(true);

        // Get user info to check verification
        const user = await account.get();
        setIsVerified(user.emailVerification);
        return true;
      }
    } catch (error) {
      console.error("No active session found:", error);
      setIsTeacherUser(false);
      setIsVerified(false);
    }
    return false;
  };

  // Run auth check on component mount
  useEffect(() => {
    checkAuthStatus();
  }, [authRefreshTrigger]);

  // Handler for login form submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);

    try {
      // First, try to delete any existing session
      try {
        await SessionManager.logout();
      } catch (e) {
        console.log("No existing session to logout from");
      }
      
      // Then create a new session
      try {
        await account.createEmailSession(
          authForm.email,
          authForm.password
        );
      } catch (loginError) {
        // If createEmailSession fails, try createSession (for older Appwrite versions)
        console.log("Trying alternative login method...");
        await account.createSession(
          authForm.email,
          authForm.password
        );
      }

      // Check if the user is verified
      const user = await account.get();
      setIsTeacherUser(true);
      setIsVerified(user.emailVerification);

      // Reset form and close modal
      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
      setShowAuthModal(false);

      // Show success notification
      if (setNotification) {
        setNotification({
          show: true,
          message: "로그인 되었습니다.",
          type: "success",
        });
      }

      // Trigger a refresh to fetch latest auth state
      setAuthRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Login error:", error);
      if (setNotification) {
        setNotification({
          show: true,
          message: "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.",
          type: "error",
        });
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handler for register form submission
  const handleRegister = async (e) => {
    e.preventDefault();
    setIsAuthLoading(true);

    try {
      await account.create(
        ID.unique(),
        authForm.email,
        authForm.password,
        authForm.name
      );

      // Automatically log in after registration
      await account.createEmailPasswordSession(
        authForm.email,
        authForm.password
      );

      // Check if the user is verified (in this case, always false for new users)
      const user = await account.get();
      setIsTeacherUser(true);
      setIsVerified(false); // New users are unverified by default

      // Reset form and close modal
      setAuthForm({
        name: "",
        email: "",
        password: "",
      });
      setShowAuthModal(false);

      // Show notification about admin approval
      if (setNotification) {
        setNotification({
          show: true,
          message: "계정이 생성되었습니다. 관리자의 승인 후에 모든 기능을 사용할 수 있습니다.",
          type: "info",
        });
      }

      // Trigger a refresh to fetch latest auth state
      setAuthRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Registration error:", error);
      
      if (setNotification) {
        setNotification({
          show: true,
          message: "계정 생성에 실패했습니다. 다른 이메일을 사용하거나 나중에 다시 시도해주세요.",
          type: "error",
        });
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handler for logout
  const handleLogout = async () => {
    setIsAuthLoading(true);
    
    try {
      // First try the session manager's logout
      const success = await SessionManager.logout();
      
      if (!success) {
        // If that fails, try to logout from all sessions
        await SessionManager.logoutAll();
      }
      
      // Update UI state regardless
      setIsTeacherUser(false);
      setIsVerified(false);
      
      if (setNotification) {
        setNotification({
          show: true,
          message: "로그아웃 되었습니다.",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Complete logout failure:", error);
      // Use the client-side fallback
      handleClientSideLogout();
    } finally {
      setIsAuthLoading(false);
      // Refresh auth state
      setAuthRefreshTrigger(prev => prev + 1);
    }
  };

  // Client-side logout handler
  const handleClientSideLogout = () => {
    // Update UI state
    setIsTeacherUser(false);
    setIsVerified(false);

    // Show notification
    if (setNotification) {
      setNotification({
        show: true,
        message: "로그아웃 되었습니다.",
        type: "success",
      });
    }

    // Refresh auth state
    setAuthRefreshTrigger((prev) => prev + 1);
  };

  return {
    isTeacherUser,
    isVerified,
    isAuthLoading,
    showAuthModal,
    authMode,
    authForm,
    handleLogin,
    handleRegister,
    handleLogout,
    handleClientSideLogout, // Add this
    setShowAuthModal,
    setAuthMode,
    setAuthForm,
    checkAuthStatus,
  };
}
