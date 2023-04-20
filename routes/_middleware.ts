import { redisSession } from "fresh_session";
import { redis } from "../src/redis.ts";

export const handler = [
  redisSession(redis, {
    keyPrefix: "S_",
    maxAge: 10000000,
  }),
];
