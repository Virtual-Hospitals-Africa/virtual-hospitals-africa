/* TODO
  Start up a mock WhatsApp server
  Start up the server
  Start up the chatbot
*/


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

const redisServer = new Deno.Command("redis-server").spawn();

const server = new Deno.Command('deno', {
  args: ['task', 'start'],
  env: mockEnv,
}).spawn();

const chatbot = new Deno.Command('deno', {
  args: ['task', 'chatbot'],
  env: mockEnv,
}).spawn();

Deno.test("chatbot responds to a message", async () => {
  console.log('in here')
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const response = await fetch('http://localhost:8000/api/incoming-whatsapp', {
    method: 'post',
    body: JSON.stringify({
      messaging_product: 'whatsapp',
    }),
  })

  console.log(response.json())
});

