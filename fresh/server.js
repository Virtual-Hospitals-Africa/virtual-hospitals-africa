import server, { registerStaticFile } from "./server/server-entry.mjs";



export default {
  fetch: server.fetch
};
