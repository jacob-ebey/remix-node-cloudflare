import { json } from "#remix-server";
import { Link, useLoaderData } from "@remix-run/react";

export function loader() {
  return json({
    message: "This page was rendered on the edge via Cloudflare Workers.",
  });
}

export default function Index() {
  const { message } = useLoaderData<typeof loader>();

  return (
    <div>
      <h1>Welcome to Remix!</h1>
      <p>{message}</p>
      <p>
        Go to a page rendered on the <Link to="/counter">origin server</Link>.
      </p>
    </div>
  );
}
