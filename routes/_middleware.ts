import "https://deno.land/x/dotenv@v3.2.2/load.ts";
import { redisSession } from "fresh_session";
import { connect } from "redis";

console.log("HERE");

console.log(Deno.env.toObject());

const redisUrl = Deno.env.get("REDISCLOUD_URL");

if (!redisUrl) throw new Error("Missing redis url");

const match = redisUrl.match(/redis:\/\/(.*):(.*)@(.*):(.*)/);

if (!match) throw new Error("Invalid redis url");

const [, , password, hostname, port] = match;

console.log(redisUrl);
console.log("foo", password, hostname, port);

let redis;

try {
  redis = await connect({ password, hostname, port });
} catch (err) {
  throw err;
}

export const handler = [
  redisSession(redis, {
    keyPrefix: "S_",
    maxAge: 10,
  }),
];
