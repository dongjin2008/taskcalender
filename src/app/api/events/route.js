import { NextResponse } from "next/server";
import { databases, AppwriteConfig } from "@/lib/appwrite";
import { Query } from "appwrite";

export async function GET() {
  try {
    const response = await databases.listDocuments(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      [Query.orderDesc("$createdAt")]
    );

    const events = response.documents.map((doc) => ({
      id: doc.$id,
      title: doc.title,
      start: doc.date,
      subject: doc.subject || "",
      description: doc.description || "",
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to load events" },
      { status: 500 }
    );
  }
}

// Add routes for POST, PUT, DELETE for creating, updating and deleting events
