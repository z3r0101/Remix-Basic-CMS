import { useLoaderData, Link } from "@remix-run/react";
import { db } from "../database/db.server";
import { Content } from "../database/schema";
import { getUserSession } from "../session.server"; // Import session utility

export default function Index() {
  const { user, contents } = useLoaderData();

  return (
    <div className="container mt-4">
      {/* Website Title */}
      <header className="text-center mb-4">
        <h1 className="display-4 fw-bold text-primary">Remix Demo Blog</h1>
        <p className="lead text-muted">Explore stories, news, and insights.</p>
      </header>

      {/* Blog Section */}
      <div className="row justify-content-center">
        {contents.length > 0 ? (
          contents.map((content) => (
            <div key={content.id} className="col-lg-8 mb-4">
              <article className="card shadow-sm">
                {content.image && (
                  <img
                    src={content.image}
                    alt={content.title}
                    className="card-img-top"
                    style={{ maxHeight: "300px", objectFit: "cover", objectPosition: content.image_position }}
                  />
                )}
                <div className="card-body">
                  <h2 className="card-title text-dark fw-bold">{content.title}</h2>
                  {/* Render the HTML content from `copy` */}
                  <div
                    className="card-text"
                    dangerouslySetInnerHTML={{ __html: content.copy }}
                  ></div>
                  <p className="text-muted small">
                    Published on {new Date(content.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </article>
            </div>
          ))
        ) : (
          <div className="col-lg-8 text-center">
            <p className="text-muted">No content available yet. Stay tuned!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center mt-5">
        <p className="text-muted small">&copy; 2024 Remix Demo Blog. All Rights Reserved.</p>
        {user ? (
          <Link to="/logout" className="btn btn-outline-danger btn-sm">
            Logout
          </Link>
        ) : (
          <Link to="/login" className="btn btn-outline-primary btn-sm">
            Login
          </Link>
        )}
      </footer>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getUserSession(request);

  // Fetch all the content from the Content table
  const contents = await db
    .select()
    .from(Content)
    .orderBy(Content.created_at, "desc");

  return { user: user || null, contents };
}
