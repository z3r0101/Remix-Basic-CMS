import { useLoaderData, useActionData, Link, Form, redirect, useSearchParams } from "@remix-run/react";
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

export async function loader({ params }) {
    const [content] = await db
      .select()
      .from(Content)
      .where(eq(Content.id, parseInt(params.id, 10))); // Get the content by ID
    return { content };
  }
  
  export async function action({ request, params }) {
    const url = new URL(request.url); // Create a URL object from the request
    const page = url.searchParams.get("page") || "1"; // Get the "page" query parameter

    const user = await getUserSession(request);
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    // Ensure only logged-in users can add content
    if (!user) {
      return redirect("/");
    }

    // Fetch the data from the database
    const [content] = await db
      .select()
      .from(Content)
      .where(eq(Content.id, parseInt(params.id, 10))); // Get the content by ID

    if (!content) {
      throw new Error(`Content with ID ${params.id} not found`);
    }

    // Base upload directory
    const baseUploadDir = path.join(__dirname, "../../public/uploads");
    const contentDir = path.join(baseUploadDir, "content");
    const specificContentDir = path.join(contentDir, params.id);

    // Ensure directories exist
    try {
      // Create /uploads/content if it doesn't exist
      await fs.mkdir(contentDir, { recursive: true });

      // Create /uploads/content/{id} if it doesn't exist
      await fs.mkdir(specificContentDir, { recursive: true });
    } catch (error) {
      console.error("Error creating directories:", error);
      return { error: "Failed to prepare upload directories." };
    }

    console.log("Directories ensured:", specificContentDir);

    const uploadHandler = unstable_composeUploadHandlers(
      unstable_createFileUploadHandler({
        directory: specificContentDir, // Save the file to this directory
        file: (args) => { 
          console.log("unstable_createFileUploadHandler", args.filename);
          return args.filename;
        }
      }),
      unstable_createMemoryUploadHandler()
    )

    const formData = await unstable_parseMultipartFormData(request, uploadHandler);
    const title = formData.get("title");
    const copy = formData.get("copy");
    const file = formData.get("image");
    const imagePath = `/uploads/content/${params.id}/${file.name}`;

    // Validation
    if (!title || !copy || !file) {
      return { error: "All fields are required." };
    }

    // Original code
    // const formData = await request.formData();
    // const title = formData.get("title");
    // const copy = formData.get("copy");
    // const file = formData.get("image");

    let arrData = {
      title, 
      copy,
    };

    if (file.size > 0) {
      if (content.image) {
        console.log(content.image);
        console.log(file.name);

        /*const imagePath = path.join(__dirname, "../public", content.image);
        try {
          await fs.access(imagePath); // Check if the file exists
          await fs.unlink(imagePath); // Delete the file
          console.log(`Deleted old image: ${content.image}`);
        } catch (error) {
          console.warn(`File not found or could not be deleted: ${imagePath}`);
        }*/
      }

      arrData = {
        title, 
        copy,
        image: imagePath,
      };
    }
  
    await db
      .update(Content)
      .set(arrData)
      .where(eq(Content.id, parseInt(params.id, 10)));
  
    return redirect(`/cms/content?page=${page}`);
  }
  
  export default function CmsContentContentEdit() {
    const [searchParams] = useSearchParams(); // To read and modify query params
    const page = searchParams.get("page") || "1";

    const { content } = useLoaderData();
  
    return (
      <>
      <Navbar /> {/* Add the Navbar at the top */}
      <div className="container mt-4">
        <h2 className="mb-4">Edit Content</h2>
        <Form method="post" encType="multipart/form-data">
          <div className="mb-3">
            <label htmlFor="title" className="form-label">
              Title:
            </label>
            <input
              type="text"
              name="title"
              id="title"
              defaultValue={content.title}
              className="form-control"
            />
          </div>
  
          <div className="mb-3">
            <label htmlFor="copy" className="form-label">
              Copy:
            </label>
            <TinyMCEEditor
              id="copy"
              name="copy"
              initialValue={content.copy}
              onEditorChange={(content) => console.log(content)} // Handle editor content change
            />
          </div>
  
          <div className="mb-3">
            {content.image && (
              <div className="mb-2">
                <strong>Current Image:</strong>
                <div>
                  <img
                    src={content.image}
                    alt="Current Content"
                    className="img-thumbnail"
                    style={{ maxWidth: "200px" }}
                  />
                </div>
              </div>
            )}
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

          <div className="mb-3">
            <label htmlFor="image_position" className="form-label">
              Image Position:
            </label>
            <input
              type="text"
              name="image_position"
              id="image_position"
              defaultValue={content.image_position}
              className="form-control"
            />
          </div>
  
          <div className="d-flex justify-content-between">
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
          <Link to={`/cms/content?page=${page}`} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
        </Form>
      </div>
      </>
    );
  }
  