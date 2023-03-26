const postMessageRoute = `https://graph.facebook.com/v15.0/${
  Deno.env.get("WHATSAPP_FROM_PHONE_NUMBER")
}/messages`;
const Authorization = `Bearer ${Deno.env.get("WHATSAPP_BEARER_TOKEN")}`;

export async function sendMessage(
  opts: { phone_number: string; messageBody: string },
): Promise<{
  messaging_product: "whatsapp";
  contacts: [{ input: string; wa_id: string }];
  messages: [{ id: string }];
}> {
  const response = await fetch(postMessageRoute, {
    method: "post",
    headers: { Authorization, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.phone_number,
      text: { body: opts.messageBody },
    }),
  });

  return response.json();
}
