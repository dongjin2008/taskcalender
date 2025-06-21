"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleOAuthWrapper({ clientId, children }) {
  return (
    <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>
  );
}
