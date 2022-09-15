import { json } from "#remix-server";
import { Link, useLoaderData } from "@remix-run/react";

export function loader() {
  return json({
    message: "This page was rendered in your browser via Service Workers.",
  });
}

export default function Offline() {
  const { message } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome to Remix!</h1>
      <p>{message}</p>
      <p>
        Go back <Link to="/">Home</Link>.
      </p>
    </div>
  );
}
