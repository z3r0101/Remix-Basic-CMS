import { Form, useActionData, redirect } from "@remix-run/react";
import { db } from "../database/db.server";
import { User } from "../database/schema";
import { eq } from "drizzle-orm";
import { ActionFunctionArgs } from "@remix-run/node";
import bcrypt from "bcryptjs"; // Use bcrypt to compare passwords

export default function Register() {
  const actionData = useActionData();

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header text-center bg-success text-white">
              <h4>Register</h4>
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
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="form-control"
                    placeholder="Re-enter your password"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    className="form-control"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                {actionData?.error && (
                  <div className="alert alert-danger" role="alert">
                    {actionData.error}
                  </div>
                )}
                <div className="d-grid">
                  <button type="submit" className="btn btn-success">
                    Register
                  </button>
                </div>
              </Form>
            </div>
            <div className="card-footer text-center">
              <p>
                Already have an account? <a href="/login">Login here</a>
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
  const confirmPassword = formData.get("confirmPassword");
  const name = formData.get("name");

  if (password !== confirmPassword) {
    return { error: "Passwords must match" };
  }

  const existingUserQuery = await db
    .select()
    .from(User)
    .where(eq(User.email, email as string));
  const existingUser = existingUserQuery[0];

  if (existingUser) {
    return { error: "Email is already in use" };
  }

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password as string, 10);

  // Insert the new user into the database
  await db.insert(User).values({
    email: email as string,
    password: hashedPassword as string, // Remember, store encrypted passwords in a real system!
    name: name as string,
  });

  return redirect("/login"); // Redirect to login page after successful registration
}
