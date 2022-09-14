import { json } from "#remix-server";
import { Link, useLoaderData } from "@remix-run/react";

export function loader() {
  return json({ message: "This page was rendered on the origin Node server." });
}

export default function Test() {
  const { message } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.4" }}>
      <h1>Welcome to Remix!</h1>
      <p>{message}</p>
      <p>
        Go back <Link to="/">Home</Link>.
      </p>
    </div>
  );
}
