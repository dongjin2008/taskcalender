"use client";

import { useEffect } from "react";

// Safe imports with fallbacks for Capacitor plugins
let App;
let StatusBar;
let SplashScreen;

// Check if we're in a browser environment and try to import Capacitor plugins
if (typeof window !== "undefined") {
  try {
    // Dynamic imports to prevent build errors
    import("@capacitor/app")
      .then((module) => {
        App = module.App;
      })
      .catch((e) => console.log("App plugin not available:", e));

    import("@capacitor/status-bar")
      .then((module) => {
        StatusBar = module.StatusBar;
      })
      .catch((e) => console.log("StatusBar plugin not available:", e));

    import("@capacitor/splash-screen")
      .then((module) => {
        SplashScreen = module.SplashScreen;
      })
      .catch((e) => console.log("SplashScreen plugin not available:", e));
  } catch (error) {
    console.log("Capacitor plugins could not be loaded:", error);
  }
}

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
          // Hide splash screen if available
          if (SplashScreen) {
            await SplashScreen.hide();
          }

          // Set status bar style if available
          if (StatusBar) {
            await StatusBar.setStyle({ style: "dark" });
          }

          // Handle back button if available
          if (App) {
            App.addListener("backButton", ({ canGoBack }) => {
              if (!canGoBack) {
                App.exitApp();
              } else {
                window.history.back();
              }
            });
          }
        } catch (error) {
          console.error("Error initializing Capacitor:", error);
        }
      }
    };

    // Initialize with a small delay to ensure plugins are loaded
    setTimeout(initCapacitor, 100);

    // Clean up listeners
    return () => {
      if (isCapacitorApp() && App) {
        App.removeAllListeners();
      }
    };
  }, []);

  // This component doesn't render anything visible
  return null;
}
