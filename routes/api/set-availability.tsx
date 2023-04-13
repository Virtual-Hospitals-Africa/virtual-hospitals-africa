import { Handlers } from "$fresh/server.ts";

export const handler: Handlers = {
  async POST(req) {
    console.log("");
    return new Response("OK", { status: 200 });
  },
};
