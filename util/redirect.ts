export default function redirect(
  Location: string | URL,
  status = 302,
): Response {
  return new Response('Found', {
    status,
    headers: {
      Location: Location instanceof URL ? Location.toString() : Location,
    },
  })
}
