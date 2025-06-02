import { NextResponse } from "next/server";

// DEVELOPMENT MODE FLAG - set to true to bypass all restrictions
const BYPASS_RESTRICTIONS = true; // Set this to false when deploying to production

// Get allowed domains from environment variables
// Default to empty array if not set (will block all access)
const getAllowedDomains = () => {
  // Parse JSON array from environment variable or use default
  try {
    // Format should be: ALLOWED_DOMAINS=["domain1.com","domain2.org"]
    if (process.env.ALLOWED_DOMAINS) {
      return JSON.parse(process.env.ALLOWED_DOMAINS);
    }
  } catch (e) {
    console.error("Error parsing ALLOWED_DOMAINS:", e);
  }

  // Fallback for development mode
  if (process.env.NODE_ENV === "development") {
    return ["localhost:3000", "127.0.0.1:3000"];
  }

  return [];
};

const ALLOWED_PARENT_DOMAINS = getAllowedDomains();

export function middleware(request) {
  // DEVELOPMENT BYPASS - Skip all checks if BYPASS_RESTRICTIONS is true
  if (BYPASS_RESTRICTIONS || process.env.NODE_ENV === "development") {
    console.log("⚠️ Access restrictions bypassed - development mode");
    return NextResponse.next();
  }

  // All the original code below will only run when BYPASS_RESTRICTIONS is false

  // Get the referer header
  const referer = request.headers.get("referer");

  // Allow direct access if ALLOW_DIRECT_ACCESS is set to "true"
  const allowDirectAccess = process.env.ALLOW_DIRECT_ACCESS === "true";

  // If there's no referer and direct access is not allowed, deny access
  if (!referer && !allowDirectAccess) {
    // Return a simple access denied page or redirect
    return new NextResponse(
      "<html><body><h1>Access Denied</h1><p>This application can only be accessed through approved websites.</p></body></html>",
      {
        status: 403,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  // If there's a referer, check if it's allowed
  if (referer) {
    const refererUrl = new URL(referer);
    const refererDomain = refererUrl.hostname;

    // Allow if the referer is from an allowed domain
    const isAllowedDomain = ALLOWED_PARENT_DOMAINS.some(
      (domain) =>
        refererDomain === domain || refererDomain.endsWith(`.${domain}`)
    );

    if (!isAllowedDomain && !allowDirectAccess) {
      // Optional: Log blocked attempts to help with debugging
      console.log(`Access blocked from: ${refererDomain}`);

      // Return access denied
      return new NextResponse(
        "<html><body><h1>Access Denied</h1><p>This application can only be accessed through approved websites.</p></body></html>",
        {
          status: 403,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }
  }

  // Add X-Frame-Options header to allow only specific origins
  const response = NextResponse.next();

  // Set Content-Security-Policy to restrict framing
  if (ALLOWED_PARENT_DOMAINS.length > 0) {
    const cspValue = ALLOWED_PARENT_DOMAINS.map(
      (domain) => `frame-ancestors ${domain} *.${domain}`
    ).join(" ");

    response.headers.set("Content-Security-Policy", cspValue);
  } else if (allowDirectAccess) {
    // If direct access is allowed but no domains are specified,
    // set a lenient frame-ancestors policy
    response.headers.set("Content-Security-Policy", "frame-ancestors *");
  } else {
    // Default to same origin if no domains are specified
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
