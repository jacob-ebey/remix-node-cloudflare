import { json } from "#remix-server";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";

import { prisma } from "~/prisma.server";

export async function loader() {
  const counter = await prisma.counter.findFirst({
    where: { name: "counter" },
  });

  return json({ count: (counter && counter.count) || 0 });
}

export async function action() {
  await prisma.counter.upsert({
    where: { name: "counter" },
    update: { count: { increment: 1 } },
    create: { name: "counter", count: 1 },
  });
  return null;
}

export default function Counter() {
  const { count } = useLoaderData<typeof loader>();
  const transition = useTransition();

  return (
    <div>
      <h1>Welcome to Remix!</h1>
      <p>Count: {count} (read from posgress)</p>
      <Form method="post">
        <p>
          <button disabled={transition.state !== "idle"}>Increment</button>
        </p>
      </Form>
    </div>
  );
}
