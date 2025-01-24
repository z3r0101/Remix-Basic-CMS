import { useLoaderData, useActionData, Link, Form, redirect } from "@remix-run/react";
import { unstable_createFileUploadHandler, unstable_parseMultipartFormData, unstable_createMemoryUploadHandler, unstable_composeUploadHandlers } from '@remix-run/node';
import { db } from "../database/db.server";
import { Content } from "../database/schema";
import { eq } from "drizzle-orm";
import { promises as fsPromises } from "fs"; // Use `fs/promises` for promises
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs"; // Ensure to use fs.promises
import { getUserSession } from "../session.server"; // Import session utility
import Navbar from "../components/Navbar"; // Adjust the path based on where your Navbar is located
import TinyMCEEditor from "../components/TinyMCEEditor";

export default function AddContent() {
  const actionData = useActionData();

  return (
    <>
    <Navbar /> {/* Add the Navbar at the top */}
    <div className="container mt-4">
      <h2 className="mb-4">Add New Content</h2>
      <Form method="post" encType="multipart/form-data">
        <div className="mb-3">
          <label htmlFor="title" className="form-label">
            Title:
          </label>
          <input
            type="text"
            name="title"
            id="title"
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
            <label htmlFor="copy" className="form-label">
              Copy:
            </label>
            <TinyMCEEditor
              id="copy"
              name="copy"
            />
          </div>

        <div className="mb-3">
          <label htmlFor="file" className="form-label">
            Upload Image:
          </label>
          <input
            type="file"
            name="image"
            id="image"
            accept="image/*"
            className="form-control"
          />
        </div>

        {actionData?.error && (
          <div className="alert alert-danger" role="alert">
            {actionData.error}
          </div>
        )}

        <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary">
            Add Content
          </button>
          <Link to="/cms/content/" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </Form>
    </div>
    </>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const user = await getUserSession(request);
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const timestamp = Math.floor(Date.now() / 1000);

  // Ensure only logged-in users can add content
  if (!user) {
    return redirect("/");
  }

  console.log(user);

  // Base upload directory
  const baseUploadDir = path.join(__dirname, "../../public/uploads");
  const contentDir = path.join(baseUploadDir, "content");
  const tempDir = path.join(baseUploadDir, "temp");
  const specificTempDir = path.join(tempDir, user.id.toString());

  // Ensure directories exist
  try {
    // Create /uploads/content if it doesn't exist
    await fs.mkdir(contentDir, { recursive: true });
    // Create /uploads/temp if it doesn't exist
    await fs.mkdir(tempDir, { recursive: true });
    // Create /uploads/temp/{id} if it doesn't exist
    await fs.mkdir(specificTempDir, { recursive: true });
  } catch (error) {
    console.error("Error creating directories:", error);
    return { error: "Failed to prepare upload directories." };
  }

  const uploadHandler = unstable_composeUploadHandlers(
    unstable_createFileUploadHandler({
      directory: specificTempDir, // Save the file to this directory
      file: (args) => { 
        console.log("unstable_createFileUploadHandler", args.filename);
        return `${timestamp}_${args.filename}`;
      },
      maxFileSize: 10 * 1024 * 1024, // Set limit to 10MB
    }),
    unstable_createMemoryUploadHandler()
  )

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const title = formData.get("title");
  const copy = formData.get("copy");
  const file = formData.get("image");
  const imageTempPath = `/uploads/temp/${user.id}/${timestamp}_${file.name}`;

  // Validate form data
  if (!title || !copy) {
    return { error: "All fields are required" };
  }

  // Save content to database
  try {
    const [newContent] = await db
      .insert(Content)
      .values({
        title: title as string,
        copy: copy as string,
      })
      .returning(); // Use returning() to get the inserted row

    const newId = newContent.id.toString();
    console.log("New Content ID:", newId);

    if (file.size > 0) {
      //Copy temp file
      const specificContentDir = path.join(contentDir, newId);
      // Ensure directories exist
      try {
        // Create /uploads/content/{id} if it doesn't exist
        await fs.mkdir(specificContentDir, { recursive: true });
      } catch (error) {
        console.error("Error creating directories:", error);
        return { error: "Failed to prepare upload directories." };
      }

      try {
        // Move the file
        await fs.rename(`${specificTempDir}/${file.name}`, `${specificContentDir}/${file.name.replace(`${timestamp.toString()}_`, '')}`);
        console.log(`File moved to: ${specificContentDir}/${file.name.replace(`${timestamp.toString()}_`, '')}`);
      } catch (error) {
        console.error("Error moving file:", error);
      }

      const imagePath = `/uploads/content/${newId}/${file.name.replace(`${timestamp.toString()}_`, '')}`;
      await db
      .update(Content)
      .set({ image: imagePath })
      .where(eq(Content.id, parseInt(newId, 10)));
    }

    return redirect("/cms/content");
  } catch (error) {
    console.error("Error adding content:", error);
    return { error: "Failed to add content. Please try again." };
  }
}
