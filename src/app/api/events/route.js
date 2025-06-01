import { NextResponse } from "next/server";
import { databases, AppwriteConfig, account } from "@/lib/appwrite";
import { Query, ID } from "appwrite";

// Get events - keep your existing code
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

// Create a new event
export async function POST(request) {
  try {
    // Verify authentication first
    try {
      await account.get();
    } catch (error) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { title, date, subject, description } = await request.json();

    const response = await databases.createDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      ID.unique(),
      {
        title,
        date,
        subject: subject || "",
        description: description || "",
      }
    );

    return NextResponse.json({
      event: {
        id: response.$id,
        title: response.title,
        start: response.date,
        subject: response.subject || "",
        description: response.description || "",
      },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}

// Add routes for PUT, DELETE for updating and deleting events
