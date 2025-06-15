import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Task Calendar",
  description: "A calendar application for managing tasks",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Add Bootstrap CSS - although you might already have this in globals.css */}
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        {/* Add Bootstrap JS via Next.js Script component */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Add Bootstrap JS via Next.js Script component */}
        {typeof window !== "undefined" && (
          <script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
            async
          />
        )}
      </body>
    </html>
  );
}
