import { assertEquals } from "std/testing/asserts.ts";
import { assert } from "std/_util/asserts.ts";
import { readLines } from "std/io/mod.ts";


const mockEnv = {
  WHATSAPP_BEARER_TOKEN: 'test_bearer_token',
  WHATSAPP_FROM_PHONE_NUMBER: '90210',
  WHATSAPP_WEBHOOK_VERIFY_TOKEN: 'test_verify_token',
  WHATSAPP_URL: 'http://localhost:9000',
  GOOGLE_APIS_URL: 'http://localhost:9001',
  GOOGLE_CLIENT_ID: 'test.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'test_client_secret',
  DATABASE_URL: 'postgres://willweiss@localhost:5432/vha_test',
  REDISCLOUD_URL: 'redis://:@127.0.0.1:6379',
}

async function serveHttp(conn: Deno.Conn) {
  const httpConn = Deno.serveHttp(conn);
  for await (const requestEvent of httpConn) {
    const body = `Your user-agent is:\n\n${
      requestEvent.request.headers.get("user-agent") ?? "Unknown"
    }`;
    console.log('requestEvent', requestEvent);
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
      }),
    );
  }
}

async function startMockServer(port: number) {
  const mockServer = Deno.listen({ port })
  for await (const conn of mockServer) {
    serveHttp(conn);
  }
}

startMockServer(9000)
startMockServer(9001)

const migateLatest = new Deno.Command('deno', {
  args: ['task', 'migrate:latest'],
  env: mockEnv,
}).spawn();

const migrateResult = await migateLatest.output()
assertEquals(migrateResult.code, 0)

const redisServer = new Deno.Command("redis-server").spawn();

const server = new Deno.Command('deno', {
  args: ['task', 'start'],
  env: mockEnv,
  stdout: 'inherit',
  stderr: 'inherit',
}).spawn();

const lines = readLines(await server.stdout.getReader())

const foo = server.stdout.getReader()
// for (await const chunk of foo.)

const chatbot = new Deno.Command('deno', {
  args: ['task', 'chatbot'],
  env: mockEnv,
  stdout: 'inherit',
  stderr: 'inherit',
}).spawn();

Deno.test("chatbot responds to a message", async () => {
  console.log('in here')

  for await (const line of lines) {
    console.log('zzz', line)
  }

  await new Promise((resolve) => setTimeout(resolve, 800));

  const response = await fetch('https://localhost:8000/api/incoming-whatsapp', {
    method: 'post',
    body: JSON.stringify({
      messaging_product: 'whatsapp_business_account',
    }),
  })

  console.log('after here')

  console.log(await response.json())
});
