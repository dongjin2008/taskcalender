# Resolving Google OAuth Testing Restrictions

When you see this message:

> "taskcalender has not completed the Google verification process. The app is currently being tested, and can only be accessed by developer-approved testers."

This means your Google Cloud project is still in "testing" mode, which restricts access to only approved test users.

## Solution: Add Test Users to Your OAuth Consent Screen

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)

2. Select your project

3. Navigate to **APIs & Services** > **OAuth consent screen**

4. Under **Test users**, click **+ ADD USERS**

5. Enter your email address and any other emails that need to test the application (you can add up to 100 test users)

6. Click **SAVE** at the bottom of the page

7. Wait a few minutes for the changes to take effect

## Additional Settings to Check

1. Make sure your OAuth consent screen has all required fields filled in:
   - App name
   - User support email
   - Developer contact information

2. Verify that you have the correct scopes configured:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/userinfo.email`

3. If you added new scopes, you may need to click "SAVE AND CONTINUE" to update your configuration

## For Production Applications

If you plan to make your app available to the public:

1. You'll need to go through Google's verification process
2. This involves completing the OAuth consent screen information
3. Possibly submitting your app for review if you're using sensitive scopes

For development purposes, adding yourself as a test user is sufficient to continue working on the integration.
