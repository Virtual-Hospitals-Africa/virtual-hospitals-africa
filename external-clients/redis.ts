import "dotenv";
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

const opts = connectionOpts();
export const redis = await connect(opts);
