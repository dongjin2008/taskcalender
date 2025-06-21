"use client";

import { useEffect } from "react";
import { App } from "@capacitor/app";
import { StatusBar } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";

// Detect if we're running in Capacitor
const isCapacitorApp = () => {
  return typeof window !== "undefined" && !!window.Capacitor;
};

export default function ClientInitializer() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === "undefined") return;

    const initCapacitor = async () => {
      // Initialize Capacitor plugins if needed
      if (isCapacitorApp()) {
        console.log("Running in Capacitor environment");

        try {
          // Hide splash screen
          await SplashScreen.hide();

          // Set status bar style
          await StatusBar.setStyle({ style: "dark" });

          // Handle back button
          App.addListener("backButton", ({ canGoBack }) => {
            if (!canGoBack) {
              App.exitApp();
            } else {
              window.history.back();
            }
          });
        } catch (error) {
          console.error("Error initializing Capacitor:", error);
        }
      }
    };

    initCapacitor();

    // Clean up listeners
    return () => {
      if (isCapacitorApp()) {
        App.removeAllListeners();
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
