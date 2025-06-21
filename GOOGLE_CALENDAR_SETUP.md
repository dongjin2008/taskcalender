# Task Calendar with Google Calendar Integration

This application allows users to manage tasks and events in a calendar view, with optional Google Calendar integration for automatic syncing.

## Features

- Create, view, edit, and delete tasks
- View tasks by class/group
- Teacher authentication system
- Google Calendar integration
  - Connect your Google Calendar account
  - Automatically sync tasks created in the app to Google Calendar
  - Visual indicator showing connection status

## Google Calendar Integration Setup

To enable Google Calendar integration, you need to set up OAuth 2.0 credentials in the Google Cloud Platform (GCP):

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. Configure the OAuth consent screen:
   - User Type: External
   - App name: Task Calendar
   - Add required scopes: `https://www.googleapis.com/auth/calendar` and `https://www.googleapis.com/auth/userinfo.email`
6. Create OAuth client ID:
   - Application type: Web application
   - Name: Task Calendar Web Client
   - Authorized JavaScript origins: Add your domain (e.g., `https://yourdomain.com`) and development URLs (e.g., `http://localhost:3000`)
   - Authorized redirect URIs: Same as origins
7. Copy the generated Client ID and update the `.env` file:

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
```

8. Save the file and restart the application

## How the Google Calendar Integration Works

1. Users can connect their Google Calendar by clicking the "Connect Google Calendar" button
2. After authorizing the app, tasks created in the app will automatically sync to Google Calendar
3. The app stores OAuth tokens securely in the browser's localStorage
4. Users can disconnect at any time by clicking the "Disconnect" button

## Development

### Prerequisites

- Node.js 14+ and npm/yarn
- Appwrite instance for backend
- Google Cloud Platform account (for Calendar API)

### Running locally

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser
