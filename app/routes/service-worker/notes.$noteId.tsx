import { redirect, type ActionArgs, type LoaderArgs } from "#remix-server";
import { useLoaderData, Form } from "@remix-run/react";
import { deleteNote, getNote } from "~/notes";

export default function Note() {
  const note = useLoaderData();
  return (
    <div>
      <h2>{note.title}</h2>
      <div>{note.content}</div>
      <Form method="post" style={{ marginTop: "2rem" }}>
        <button type="submit">Delete</button>
      </Form>
    </div>
  );
}

export async function loader({ params }: LoaderArgs) {
  const note = await getNote(params.noteId!);
  if (!note) throw new Response("", { status: 404 });
  return note;
}

export async function action({ params }: ActionArgs) {
  await deleteNote(params.noteId!);
  return redirect("/notes/new");
}
