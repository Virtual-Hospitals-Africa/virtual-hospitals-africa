import { aJ as requestAsRecord, aK as parseWithValues, d as db, aL as timeout, aM as TimeoutError } from "../server-entry.mjs";
function postHandler(schema, callback) {
  return {
    async POST(ctx) {
      const record = await requestAsRecord(ctx.req);
      const form_values = parseWithValues(schema, record);
      return await db.transaction().setIsolationLevel("read committed").execute(async (trx) => {
        ctx.state.trx = trx;
        const response = Promise.resolve(callback(ctx, form_values));
        const timer = timeout(1e4);
        try {
          return await Promise.race([response, timer]);
        } catch (err) {
          if (err instanceof TimeoutError) {
            console.error(`TIMEOUT ${ctx.req.method}:${ctx.url.pathname}`);
          }
          throw err;
        } finally {
          timer.cancel();
        }
      });
    }
  };
}
export {
  postHandler as p
};
