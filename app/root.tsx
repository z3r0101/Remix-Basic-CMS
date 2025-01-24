import { Links, Meta, LiveReload, Outlet, Scripts } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { module } from "react/jsx-runtime";

export function links() {
  return [
    { rel: "stylesheet", href: "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" },
  ];
}

export default function App() {
  console.log("Rendering root.tsx");
  return (
    <>
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      </body>
    </html>
    </>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {

  return {  };
}