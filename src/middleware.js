import { NextResponse } from "next/server";

// DEVELOPMENT MODE FLAG - set to false for production
const BYPASS_RESTRICTIONS = false;

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

  // Production fallback domains (your school domains)
  return ["srnschool.org"];
};

const ALLOWED_PARENT_DOMAINS = getAllowedDomains();

export function middleware(request) {
  // DEVELOPMENT BYPASS - Only for non-production environments
  if (process.env.NODE_ENV === "development") {
    console.log("⚠️ Access restrictions bypassed - development mode");
    const response = NextResponse.next();
    // Set permissive CSP for development only
    response.headers.set("Content-Security-Policy", "frame-ancestors *");
    return response;
  }

  // Production code runs below

  // Get the referer header
  const referer = request.headers.get("referer");

  // Allow direct access if ALLOW_DIRECT_ACCESS is set to "true"
  const allowDirectAccess = false

  // If there's no referer and direct access is not allowed, deny access
  if (!referer && !allowDirectAccess) {
    // Return a simple access denied page or redirect
    return new NextResponse(
      "<html><body><h1>Access Denied</h1><p>This application can only be accessed through approved websites.</p></body></html>",
      {
        status: 403,
        headers: {
          "Content-Type": "text/html",
          "Content-Security-Policy": "frame-ancestors 'none'",
          "X-Frame-Options": "DENY",
        },
      }
    );
  }

  // If there's a referer, check if it's allowed
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererDomain = refererUrl.hostname;

      // Allow if the referer is from an allowed domain
      const isAllowedDomain = ALLOWED_PARENT_DOMAINS.some(
        (domain) =>
          refererDomain === domain || refererDomain.endsWith(`.${domain}`)
      );

      if (!isAllowedDomain && !allowDirectAccess) {
        // Log blocked attempts to help with debugging
        console.log(`Access blocked from: ${refererDomain}`);

        // Return access denied
        return new NextResponse(
          "<html><body><h1>Access Denied</h1><p>This application can only be accessed through approved websites.</p></body></html>",
          {
            status: 403,
            headers: {
              "Content-Type": "text/html",
              "Content-Security-Policy": "frame-ancestors 'none'",
              "X-Frame-Options": "DENY",
            },
          }
        );
      }
    } catch (e) {
      console.error("Invalid referer URL:", e);
    }
  }

  // Add security headers to the response
  const response = NextResponse.next();

  // Set Content-Security-Policy to restrict framing
  if (ALLOWED_PARENT_DOMAINS.length > 0) {
    const cspValue = `frame-ancestors ${ALLOWED_PARENT_DOMAINS.map(
      (domain) => `${domain} *.${domain}`
    ).join(" ")}`;
    response.headers.set("Content-Security-Policy", cspValue);

    // X-Frame-Options is less flexible but needed for older browsers
    // Use the first domain as the ALLOW-FROM value
    if (ALLOWED_PARENT_DOMAINS[0]) {
      response.headers.set(
        "X-Frame-Options",
        `ALLOW-FROM ${ALLOWED_PARENT_DOMAINS[0]}`
      );
    }
  } else if (allowDirectAccess) {
    // If direct access is allowed but no domains are specified,
    // set a lenient frame-ancestors policy
    response.headers.set("Content-Security-Policy", "frame-ancestors *");
    response.headers.set("X-Frame-Options", "ALLOWALL");
  } else {
    // Default to same origin if no domains are specified
    response.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  }

  return response;
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
