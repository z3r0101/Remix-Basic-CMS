import { useLoaderData, Link, useNavigate, useSearchParams } from "@remix-run/react";
import { json } from "@remix-run/node";
import { db } from "../database/db.server";
import { Content } from "../database/schema";
import { sql } from "drizzle-orm";
import Navbar from "../components/Navbar"; // Adjust the path based on your Navbar component

const ITEMS_PER_PAGE = 10; // Number of items per page

// Loader Function
export async function loader({ request }) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10); // Get current page from URL query
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const totalItemsQuery = await db
    .select({ count: sql<number>`COUNT(*)` }) // Use raw SQL for count
    .from(Content);
  const totalItems = totalItemsQuery[0]?.count || 0; // Extract total count

  const contents = await db
    .select()
    .from(Content)
    .offset(skip)
    .limit(ITEMS_PER_PAGE)
    .orderBy(Content.created_at, "desc"); // Order contents by `created_at` in descending order

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return json({ contents, currentPage: page, totalPages });
}

// Default Exported Component
export default function CmsContent() {
  const { contents, currentPage, totalPages } = useLoaderData(); // Data from the loader
  const [searchParams] = useSearchParams(); // To read and modify query params
  const navigate = useNavigate(); // For programmatic navigation

  // Function to handle page navigation
  const handlePageChange = (page) => {
    searchParams.set("page", page); // Update the "page" query param
    navigate(`?${searchParams.toString()}`); // Update the URL
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-4">Content List</h2>

        <table className="table table-bordered">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contents.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{new Date(item.created_at).toISOString()}</td>
                <td>
                  <Link
                    to={`/cms/content/edit/${item.id}?page=${currentPage}`}
                    className="btn btn-sm btn-primary me-2"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/cms/content/delete/${item.id}?page=${currentPage}`}
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination mt-3">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="btn btn-outline-secondary ms-2"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        <hr />
        <div className="mt-3">
          <Link to="/cms/content/add" className="btn btn-success">
            Add New Content
          </Link>
        </div>
      </div>
    </>
  );
}
