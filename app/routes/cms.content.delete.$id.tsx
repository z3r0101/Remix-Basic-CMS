import { redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { db } from "../database/db.server";
import { Content } from "../database/schema";
import { eq } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";
import { promises as fs } from "fs"; // Ensure to use fs.promises
import { getUserSession } from "../server/session"; // Import session utility

export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url); // Parse the request URL
  const page = url.searchParams.get("page") || "1"; // Extract the "page" query parameter

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const { id } = params;

  if (!id) {
    throw new Response("Content ID is required", { status: 400 });
  }

  const setPage = page || "1";

  // Delete the content
  try {
    const [content] = await db
      .select()
      .from(Content)
      .where(eq(Content.id, parseInt(id))); // Get the content by ID

    // Base upload directory
    const baseUploadDir = path.join(__dirname, "../public/uploads");
    const contentDir = path.join(baseUploadDir, "content");
    const specificContentDir = path.join(contentDir, id.toString());

    // Delete the directory if it exists
    try {
      await fs.rm(specificContentDir, { recursive: true, force: true });
      console.log(`Deleted directory: ${specificContentDir}`);
    } catch (dirError) {
      console.error(`Failed to delete directory: ${specificContentDir}`, dirError);
    }

    await db
      .delete(Content)
      .where(eq(Content.id, parseInt(id)));

    return redirect(`/cms/content?page=${page}`); // Redirect back to the content list
  } catch (error) {
    console.error("Error deleting content:", error);
    throw new Response("Failed to delete content", { status: 500 });
  }
}

export default function CmsContentDelete() {
  return null; // This route is just for handling delete logic
}
