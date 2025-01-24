import {
  useLoaderData,
  useActionData,
  redirect,
  Form,
  Link,
} from "@remix-run/react";
import bcrypt from "bcryptjs"; // Use bcrypt for hashing passwords
import { db } from "../database/db.server"; // Import Drizzle ORM database instance
import { User } from "../database/schema"; // Import User schema
import Navbar from "../components/Navbar"; // Adjust the path based on where your Navbar is located
import { eq } from "drizzle-orm";

export async function loader({ params }: LoaderFunctionArgs) {
  const userQuery = await db
      .select()
      .from(User)
      .where(eq(User.id, parseInt(params.id, 10)));

  const user = userQuery[0];

  if (!user) {
      throw new Response("User not found", { status: 404 });
  }

  return { user };
}

export async function action({ request, params }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get("email");
  const name = formData.get("name");
  const password = formData.get("password");

  // Validation
  if (!email || !name) {
      return { error: "Email and name are required." };
  }

  // Prepare data for update
  const data: any = {
      email: email as string,
      name: name as string,
  };

  // If a password is provided, hash it
  if (password) {
      data.password = await bcrypt.hash(password as string, 10);
  }

  // Update the user in the database using Drizzle
  await db
      .update(User)
      .set(data)
      .where(eq(User.id, parseInt(params.id, 10)));

  return redirect("/cms/user");
}

export default function EditUser() {
  const { user } = useLoaderData();
  const actionData = useActionData();

  return (
      <>
          <Navbar />
          <div className="container mt-4">
              <h2 className="mb-4">Edit User</h2>
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
                          defaultValue={user.email}
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
                          defaultValue={user.name}
                          required
                      />
                  </div>
                  <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                          Password (Leave blank to keep current password):
                      </label>
                      <input
                          type="password"
                          name="password"
                          id="password"
                          className="form-control"
                      />
                  </div>
                  {actionData?.error && (
                      <p className="text-danger">{actionData.error}</p>
                  )}
                  <div className="d-flex justify-content-between">
                      <button type="submit" className="btn btn-primary">
                          Save Changes
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
