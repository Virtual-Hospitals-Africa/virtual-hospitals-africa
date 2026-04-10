import fetcher from "./server.js";

Deno.serve(
  { port: Deno.env.get("PORT"), hostname: Deno.env.get("HOSTNAME") },
  fetcher.fetch
);