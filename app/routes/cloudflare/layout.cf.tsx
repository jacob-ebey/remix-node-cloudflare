export default function CF() {
  return (
    <p>
      Since <code>/layout/cf</code> requested to render on the edge in a CF Worker,
      the common layout is also rendering in the worker.
    </p>
  );
}
