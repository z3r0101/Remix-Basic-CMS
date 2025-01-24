import { json } from "@remix-run/node";
import { sql } from "drizzle-orm";
import { db } from "../database/db.server";
import { User } from "../database/schema";

export async function loader({ request }) {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    // Count total items
    const totalItemsQuery = await db
        .select({ count: sql<number>`COUNT(*)` }) // Use raw SQL for the COUNT
        .from(User);

    const totalItems = totalItemsQuery[0]?.count || 0;

    // Fetch users with pagination
    const users = await db
        .select()
        .from(User)
        .offset(skip)
        .limit(limit)
        .orderBy(User.created_at, "desc");

    const totalPages = Math.ceil(totalItems / limit);

    return json({ users, totalPages });
}
