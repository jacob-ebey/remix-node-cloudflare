import { useOutlet } from "@remix-run/react";

export default function Layout() {
  const outlet = useOutlet();

  return (
    <main>
      <h1>I'm the common layout, but...</h1>
      {outlet ? (
        outlet
      ) : (
        <p>I render in different places depending on what route you request.</p>
      )}
    </main>
  );
}
