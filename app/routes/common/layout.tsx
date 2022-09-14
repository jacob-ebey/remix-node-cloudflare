import { Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div>
      <h1>Layout :D</h1>
      <Outlet />
    </div>
  );
}
