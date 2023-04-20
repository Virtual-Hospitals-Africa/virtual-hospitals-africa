import "dotenv";
import { redisSession } from "fresh_session";
import { connect } from "redis";

const connectionOpts = () => {
  const redisUrl = Deno.env.get("REDISCLOUD_URL");

  if (!redisUrl) {
    return { password: undefined, hostname: "localhost", port: 6379 };
  }

  const match = redisUrl.match(/redis:\/\/(.*):(.*)@(.*):(.*)/);

  if (!match) throw new Error("Invalid redis url");

  const [, , password, hostname, port] = match;

  return { password, hostname, port };
};

let redis;

try {
  const opts = connectionOpts();
  redis = await connect(opts);
} catch (err) {
  throw err;
}

export const handler = [
  // (req: Request, ctx: MiddlewareHandlerContext<any>) => {
  //   return ctx.next();
  // },
  redisSession(redis, {
    keyPrefix: "S_",
    maxAge: 10000000,
  }),
];
