import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import Navbar from "../components/Navbar";

const ITEMS_PER_PAGE = 10; // Number of items per page

export default function CmsUser() {
  const [users, setUsers] = useState([]); // Holds the user list
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [totalPages, setTotalPages] = useState(0); // Total pages
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/user?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);
        const data = await response.json();
        setUsers(data.users);
        setTotalPages(data.totalPages);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-4">
        <h2 className="mb-4">User List</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.name}</td>
                    <td>{new Date(user.created_at).toISOString()}</td>
                    <td>
                      <Link
                        to={`/cms/user/edit/${user.id}`}
                        className="btn btn-sm btn-primary me-2"
                      >
                        Edit
                      </Link>
                      <Link
                        to={`/cms/user/delete/${user.id}`}
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
          </>
        )}
        <hr />
        <div className="mt-3">
          <Link to="/cms/user/add" className="btn btn-success">
            Add New User
          </Link>
        </div>
      </div>
    </>
  );
}
