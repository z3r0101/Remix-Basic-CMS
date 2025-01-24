import { createCookieSessionStorage, redirect } from "@remix-run/node";

const sessionSecret = process.env.SESSION_SECRET || "your-secret-key";

// Create session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Ensure cookies are sent over HTTPS in production
    sameSite: "lax", // Protect against CSRF
    path: "/", // Apply session cookies to the entire app
    secrets: [sessionSecret], // Secure secret key
  },
});

// Export `commitSession` for external use
export const commitSession = sessionStorage.commitSession;

// Export `destroySession` for external use
export const destroySession = sessionStorage.destroySession;

const USER_SESSION_KEY = "user";

// Get the session from the request
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// Get user session data
export async function getUserSession(request: Request) {
  const session = await getSession(request);
  return session.get(USER_SESSION_KEY) || null;
}

// Set user session
export async function setUserSession(
  user: { id: number; name: string; email: string },
  request: Request,
  response: Response
) {
  const session = await getSession(request);
  session.set(USER_SESSION_KEY, user);

  response.headers.set("Set-Cookie", await commitSession(session)); // Use the exported `commitSession`
  return response;
}

// Require a user to be logged in (throws redirect if not authenticated)
export async function requireUser(request: Request) {
  const user = await getUserSession(request);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

// Destroy the session and log out
export async function logout(request: Request) {
  const session = await getSession(request);
  console.log("Session before destruction:", session.data);

  const response = redirect("/");
  const cookieHeader = await destroySession(session); // Use the exported `destroySession`

  console.log("Set-Cookie header after destruction:", cookieHeader);

  response.headers.set("Set-Cookie", cookieHeader);
  return response;
}
