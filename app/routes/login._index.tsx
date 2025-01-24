import { useEffect } from "react";
import { Form, useActionData, redirect } from "@remix-run/react";
import { db } from "../database/db.server";
import { User } from "../database/schema";
import { eq } from "drizzle-orm";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { setUserSession } from "../session.server"; // Import the session utility
import bcrypt from "bcryptjs"; // Use bcryptjs to compare passwords
import { useSearchParams } from "@remix-run/react";

export default function Login() {
  const actionData = useActionData();

  const [searchParams] = useSearchParams();
  const errorMessageFromQuery = searchParams.get("err");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script); // Cleanup script on unmount
    };
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header text-center bg-primary text-white">
              <h4>Login</h4>
            </div>
            <div className="card-body">
              <Form method="post">
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    className="form-control"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    className="form-control"
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <div className="mb-3">      {/* Turnstile widget */}
                      <div className="cf-turnstile" data-sitekey="0x4AAAAAAA2PdDM0JrNkO1kT"></div>
                </div>

                {actionData?.error && (
                  <div className="alert alert-danger" role="alert">
                    {actionData.error}
                  </div>
                )}

                {/* Display errors from query string */}
                {errorMessageFromQuery && (
                  <div className="alert alert-danger" role="alert">
                    {decodeURIComponent(errorMessageFromQuery.replace(/\+/g, ' '))}
                  </div>
                )}

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Login
                  </button>
                  {/* Azure B2C login button */}
                  <button type="button" onClick={() => window.location.href = '/login/azure-b2c'} className="btn btn-secondary">
                    Login with Azure B2C
                  </button>
                </div>
              </Form>
            </div>
            <div className="card-footer text-center">
              <p>
                Don't have an account? <a href="/register">Register here</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const token = formData.get("cf-turnstile-response");

  // Verify the token with Cloudflare
  const secretKey = "0x4AAAAAAA2PdAlBYaSVouS_pkuq8u4E-Z4";
  const responseCf = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      secret: secretKey,
      response: token,
    }),
  });

  const data = await responseCf.json();

  if (!data.success) {
    return { error: "Turnstile validation failed" };
  } else {
    console.log(data);
  }

  const userQuery = await db
    .select()
    .from(User)
    .where(eq(User.email, email));

  const user = userQuery[0];

  // If user not found or password is incorrect
  if (!user || !(await bcrypt.compare(password as string, user.password))) {
    return { error: "Invalid email or password" };
  }

  // Set session after successful login
  const response = redirect("/cms/content");
  return setUserSession(user, request, response);
}