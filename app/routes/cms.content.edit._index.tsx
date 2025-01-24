// app/routes/cms.content.edit.tsx
import { Outlet } from "@remix-run/react";

export default function CmsContentEdit() {
  return (
    <div>
      <h1>CMS Page</h1>
      <Outlet />
    </div>
  );
}
