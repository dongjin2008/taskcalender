"use client";

import { useState } from "react";
import migrateExistingEvents from "@/utils/migrateExistingEvents";

export default function MigrationPage() {
  const [migrationStatus, setMigrationStatus] = useState("idle");
  const [log, setLog] = useState([]);

  const runMigration = async () => {
    try {
      setMigrationStatus("running");
      setLog((prev) => [...prev, "Starting migration..."]);

      // Redirect console.log to our UI
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      console.log = (...args) => {
        setLog((prev) => [...prev, args.join(" ")]);
        originalConsoleLog(...args);
      };

      console.error = (...args) => {
        setLog((prev) => [...prev, `ERROR: ${args.join(" ")}`]);
        originalConsoleError(...args);
      };

      // Run the migration
      await migrateExistingEvents();

      // Restore console
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      setMigrationStatus("completed");
      setLog((prev) => [...prev, "Migration completed"]);
    } catch (error) {
      setMigrationStatus("error");
      setLog((prev) => [...prev, `Migration failed: ${error.message}`]);
      console.error("Migration failed:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Appwrite Database Migration</h1>
      <div className="mb-6">
        <p className="mb-2">
          This page will migrate existing events to ensure they all have the{" "}
          <code>googleCalendarEventId</code> field (set to null).
        </p>
        <p className="mb-4">
          <strong>Important:</strong> Make sure you&apos;ve already added the{" "}
          <code>googleCalendarEventId</code> field to your Appwrite collection
          schema.
        </p>

        <button
          onClick={runMigration}
          disabled={migrationStatus === "running"}
          className={`px-4 py-2 rounded ${
            migrationStatus === "running"
              ? "bg-gray-400 cursor-not-allowed"
              : migrationStatus === "completed"
              ? "bg-green-500 hover:bg-green-600"
              : migrationStatus === "error"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {migrationStatus === "running"
            ? "Running..."
            : migrationStatus === "completed"
            ? "Migration Completed"
            : migrationStatus === "error"
            ? "Try Again"
            : "Run Migration"}
        </button>
      </div>

      <div className="border rounded p-4 bg-gray-100 h-96 overflow-auto">
        <h2 className="text-lg font-semibold mb-2">Migration Log</h2>
        {log.length === 0 ? (
          <p className="text-gray-500">Migration log will appear here...</p>
        ) : (
          <pre className="whitespace-pre-wrap text-sm">
            {log.map((entry, index) => (
              <div key={index} className="mb-1">
                {entry}
              </div>
            ))}
          </pre>
        )}
      </div>
    </div>
  );
}
