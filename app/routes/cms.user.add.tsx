import { useActionData, redirect, Form, Link } from "@remix-run/react";
import bcrypt from "bcryptjs"; // Use bcrypt to hash passwords
import { db } from "../database/db.server"; // Import Drizzle ORM database instance
import { User } from "../database/schema"; // Import User schema
import Navbar from "../components/Navbar"; // Adjust the path based on where your Navbar is located

export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");

  // Validation
  if (!email || !name || !password) {
    return { error: "All fields are required." };
  }

  // Hash the password using bcrypt
  const hashedPassword = await bcrypt.hash(password as string, 10);

  // Insert the new user into the database using Drizzle
  await db.insert(User).values({
    email: email as string,
    password: hashedPassword,
    name: name as string,
  });

  return redirect("/cms/user");
}

export default function AddUser() {
  const actionData = useActionData();

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-4">Add New User</h2>
        <Form method="post">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email:
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">
              Name:
            </label>
            <input
              type="text"
              name="name"
              id="name"
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password:
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="form-control"
              required
            />
          </div>
          {actionData?.error && (
            <p className="text-danger">{actionData.error}</p>
          )}
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-success">
              Add User
            </button>
            <Link to="/cms/user" className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </Form>
      </div>
    </>
  );
}
