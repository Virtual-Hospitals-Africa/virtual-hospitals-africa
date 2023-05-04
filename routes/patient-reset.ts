import { Handlers } from "$fresh/server.ts";
import { WithSession } from "fresh_session";
import { remove } from "../models/patients.ts";

export const handler: Handlers<Record<string, never>, WithSession> = {
  async GET(req, ctx) {
    const phone_number = new URL(req.url).searchParams.get("phone_number");
    if (!phone_number) {
      return new Response("Please provide phone_number in query params", {
        status: 400,
      });
    }
    try {
      await remove({ phone_number });
    } catch (err) {
      console.error(err);
      return new Response("Error removing patient", { status: 500 });
    }
    return new Response(`Patient removed with phone_number ${phone_number}`, {
      status: 200,
    });
  },
};
