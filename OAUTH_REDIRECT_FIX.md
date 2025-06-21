# How to Fix the "redirect_uri_mismatch" Error in Google OAuth

When you receive a `400 오류: redirect_uri_mismatch` (Error: redirect_uri_mismatch) in Google OAuth, it means the redirect URI that your application is sending doesn't match any of the authorized redirect URIs configured in your Google Cloud Console project.

## Solution Steps

### 1. Identify the Correct Redirect URI

When using `@react-oauth/google` with the default configuration in a Next.js app, the library will use the following redirect URI format:
- For development: `http://localhost:3000` (or whatever port you're using)
- For production: Your domain (e.g., `https://yourdomain.com`)

### 2. Update the Google Cloud Console Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Find and click on your OAuth 2.0 Client ID
5. Under "Authorized JavaScript origins", add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Under "Authorized redirect URIs", add:
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
   
   NOTE: You might need to add more specific paths if you're using custom redirects:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

7. Click "Save"

### 3. Check Common Issues

If you're still having problems after updating the redirect URIs:

1. **HTTP vs HTTPS**: Make sure you're using the correct protocol. In development, it's usually `http`, while in production it should be `https`.

2. **Trailing Slashes**: Some configurations are sensitive to trailing slashes. Try both with and without:
   - `http://localhost:3000`
   - `http://localhost:3000/`

3. **Ports**: If you're running your development server on a non-standard port (not 3000), make sure that port is correctly reflected in your Google Cloud Console settings.

4. **Subdomains**: If you're using subdomains, you'll need to add each one as a separate entry.

5. **Cross-site Cookies**: Some browsers block third-party cookies, which can cause issues with the OAuth flow. Make sure you're not in a private/incognito browser window.

### 4. Test the Configuration

After making these changes, try connecting to Google Calendar again. The "redirect_uri_mismatch" error should be resolved.

## Current Configuration Details

Your current Google Client ID: 
```
601264364830-um9tmiv42jnt6ojdmh8b69p11t29j3o2.apps.googleusercontent.com
```

Make sure this ID corresponds to a project with the correct redirect URIs configured.
