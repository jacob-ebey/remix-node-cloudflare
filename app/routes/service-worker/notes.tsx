import { json } from "#remix-server";
import { useLoaderData, Link, Outlet } from "@remix-run/react";
import { getNotes } from "~/notes";

export async function loader() {
  return json(await getNotes());
}

export default function Root() {
  const notes = useLoaderData<typeof loader>();

  return (
    <div style={{ display: "flex" }}>
      <div style={{ paddingRight: "2rem", borderRight: "solid 1px #ccc" }}>
        <h1>Notes!</h1>
        <p>
          <Link to="new">Create Note</Link>
        </p>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>
              <Link to={note.id}>{note.title}</Link>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1, paddingLeft: "2rem" }}>
        <Outlet />
      </div>
    </div>
  );
}
