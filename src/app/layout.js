import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import GoogleOAuthWrapper from "@/components/GoogleOAuthWrapper";
import Script from "next/script";

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
        {/* Bootstrap Icons */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.13.1/font/bootstrap-icons.css"
        />
        {/* Google API Client Library */}
        <Script
          src="https://apis.google.com/js/api.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleOAuthWrapper clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthWrapper>
        <Analytics />
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
