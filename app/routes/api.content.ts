import { json } from "@remix-run/node";
import { db } from "../database/db.server";
import { Content } from "../database/schema";
import { sql } from "drizzle-orm";

export async function loader({ request }) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  // Fetch total content count
  const totalItemsQuery = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(Content);
  const totalItems = totalItemsQuery[0]?.count || 0;

  // Fetch content with pagination
  const content = await db
    .select()
    .from(Content)
    .offset(skip)
    .limit(limit)
    .orderBy(Content.created_at, "desc");

  const totalPages = Math.ceil(totalItems / limit);

  return json({
    content, // Singular
    totalPages,
    currentPage: page,
  });
}