export default function redirect(
  Location: string,
  status = 302,
): Response {
  return new Response("Found", {
    status,
    headers: { Location },
  });
}
