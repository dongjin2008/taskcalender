"use client";

import { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";

export default function TestOAuth() {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("OAuth Success:", tokenResponse);
      setToken(tokenResponse.access_token);

      try {
        const userInfoResponse = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        const userInfoData = await userInfoResponse.json();
        console.log("User Info:", userInfoData);
        setUserInfo(userInfoData);
      } catch (err) {
        console.error("Error fetching user info", err);
        setError(`User info error: ${err.message}`);
      }
    },
    onError: (errorResponse) => {
      console.error("OAuth Error:", errorResponse);
      setError(JSON.stringify(errorResponse));
    },
    flow: "implicit",
    scope: "email profile",
  });

  return (
    <div className="container mt-5">
      <h1>Google OAuth Test</h1>
      <div className="mb-4">
        <p>
          Client ID: {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(0, 8)}
          ...
        </p>
        <button
          className="btn btn-primary"
          onClick={() => {
            setError(null);
            login();
          }}
        >
          Test Google Login
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <h4>Error Occurred:</h4>
          <pre>{error}</pre>
        </div>
      )}

      {token && (
        <div className="alert alert-success">
          <h4>Login Successful!</h4>
          <p>Token: {token.substring(0, 20)}...</p>

          {userInfo && (
            <div>
              <p>
                User: {userInfo.name} ({userInfo.email})
              </p>
              {userInfo.picture && (
                <img
                  src={userInfo.picture}
                  alt="Profile"
                  width="50"
                  height="50"
                />
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-4">
        <h4>Configuration Debug Info:</h4>
        <pre
          style={{
            background: "#f8f9fa",
            padding: "15px",
            borderRadius: "5px",
          }}
        >
          {`
Current URL: ${typeof window !== "undefined" ? window.location.href : "N/A"}
Origin: ${typeof window !== "undefined" ? window.location.origin : "N/A"}
Google Client ID: ${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.substring(
            0,
            8
          )}...
          `}
        </pre>
      </div>
    </div>
  );
}
