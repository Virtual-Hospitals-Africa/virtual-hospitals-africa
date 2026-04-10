import { m as assert, v as assertOr400 } from "../server-entry.mjs";
function isWebsocketPath(ctx) {
  return ctx.url.pathname.endsWith("websocket");
}
function upgradeWebsocket(callback) {
  return async function(ctx) {
    assert(isWebsocketPath(ctx), "Route must follow the convention that websocket routes end in websocket. This is used to determine whether to open a transaction or not.");
    assertOr400(ctx.req.headers.get("upgrade") === "websocket", "Only websocket connections supported");
    const {
      socket,
      response
    } = Deno.upgradeWebSocket(ctx.req);
    callback(ctx, socket);
    return response;
  };
}
export {
  upgradeWebsocket as u
};
