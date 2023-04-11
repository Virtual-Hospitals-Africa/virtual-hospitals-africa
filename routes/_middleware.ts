import { redisSession } from "fresh_session";
import { connect } from "redis";

const redisUrl = Deno.env.get("REDISCLOUD_URL") || "localhost:6379";

const redis = await connect(redisUrl as any);

// or Customizable cookie options and Redis key prefix

export const handler = [
  redisSession(redis, {
    keyPrefix: "S_",
    maxAge: 10,
  }),
];
