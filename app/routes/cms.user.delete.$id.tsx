import { useLoaderData, redirect, Form, Link } from "@remix-run/react";
import { db } from "../database/db.server"; // Drizzle ORM database instance
import { User } from "../database/schema"; // User schema
import { eq } from "drizzle-orm"; // Helper for equality conditions
import Navbar from "../components/Navbar"; // Adjust path based on Navbar location

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

export async function action({ params }: LoaderFunctionArgs) {
  // Delete the user from the database
  await db
    .delete(User)
    .where(eq(User.id, parseInt(params.id, 10)));

  // Redirect back to the user listing page
  return redirect("/cms/user");
}

export default function DeleteUser() {
  const { user } = useLoaderData();

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="text-danger mb-4">Delete User</h2>
        <p>
          Are you sure you want to delete the following user? This action cannot
          be undone.
        </p>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>ID</th>
              <td>{user.id}</td>
            </tr>
            <tr>
              <th>Email</th>
              <td>{user.email}</td>
            </tr>
            <tr>
              <th>Name</th>
              <td>{user.name}</td>
            </tr>
            <tr>
              <th>Created At</th>
              <td>{new Date(user.created_at).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <Form method="post">
          <div className="d-flex justify-content-between">
            <button type="submit" className="btn btn-danger">
              Confirm Delete
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