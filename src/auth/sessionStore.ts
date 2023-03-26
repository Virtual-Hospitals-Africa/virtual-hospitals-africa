// import * as RedisStore from "koa-redis";

// if (!Deno.env.get("REDISCLOUD_URL") && Deno.env.get("NODE_ENV") !== "test") {
//   throw new Error("REDISCLOUD_URL not set");
// }

// const sessionStore = RedisStore({ url: Deno.env.get("REDISCLOUD_URL") });

// // Log errors in connecting to redis
// // If we fail to make the initial connection 5 times, throw an error to exit
// let retries = 0;
// sessionStore.client.on("error", (error: any) => {
//   console.error(error);
//   if (error.code === "ECONNREFUSED" && error.syscall === "connect") {
//     if (++retries >= 5) {
//       throw new Error(
//         "Failed to make initial connection to redis, shutting down.",
//       );
//     }
//   }
// });

// sessionStore.client.once(
//   "connect",
//   () => console.log("Established connection to redis"),
// );

// export default sessionStore;
