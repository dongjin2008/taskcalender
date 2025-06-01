import { NextResponse } from "next/server";
import { databases, AppwriteConfig, account } from "@/lib/appwrite";

// Get a single event
export async function GET(request, { params }) {
  try {
    const eventId = params.id;

    const event = await databases.getDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      eventId
    );

    return NextResponse.json({
      event: {
        id: event.$id,
        title: event.title,
        start: event.date,
        subject: event.subject || "",
        description: event.description || "",
      },
    });
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to load event" },
      { status: 500 }
    );
  }
}

// Update an event
export async function PUT(request, { params }) {
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

    const eventId = params.id;
    const { title, date, subject, description } = await request.json();

    const response = await databases.updateDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      eventId,
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
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(request, { params }) {
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

    const eventId = params.id;

    await databases.deleteDocument(
      AppwriteConfig.databaseId,
      AppwriteConfig.calendarEventsCollectionId,
      eventId
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}
