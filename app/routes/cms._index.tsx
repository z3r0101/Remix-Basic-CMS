// app/routes/cms.tsx
import { Outlet } from "@remix-run/react";

export default function Cms() {
  return (
    <div>
      <h1>CMS Page</h1>
      <Outlet />
    </div>
  );
}
