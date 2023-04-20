import "dotenv";
import { assert, assertEquals } from "std/testing/asserts.ts";
import moment from "https://deno.land/x/momentjs@2.29.1-deno/mod.ts";
// const formatRFC3339 = require("date-fns/formatRFC3339");
import {
  DeepPartial,
  GCalCalendarList,
  GCalCalendarListEntry,
  GCalEvent,
  GCalEventsResponse,
  GCalFreeBusy,
  GoogleProfile,
  GoogleTokens,
} from "./types.ts";
import { WithSession } from "fresh_session";
import { HandlerContext } from "$fresh/src/server/mod.ts";

const googleApisUrl = "https://www.googleapis.com";

type RequestOpts = {
  method?: "get" | "post" | "put" | "delete";
  data?: any;
};

export function isGoogleTokens(tokens: any): tokens is GoogleTokens {
  return !!tokens && typeof tokens === "object" &&
    "access_token" in tokens && typeof tokens.access_token === "string" &&
    "refresh_token" in tokens && typeof tokens.refresh_token === "string";
}

export class Agent {
  tokens: GoogleTokens;
  constructor(tokens: any) {
    if (!isGoogleTokens(tokens)) {
      throw new Error("Invalid tokens object");
    }
    this.tokens = tokens;
  }

  static fromCtx(ctx: HandlerContext<any, WithSession>): Agent {
    return new Agent({
      access_token: ctx.state.session.get("access_token"),
      refresh_token: ctx.state.session.get("refresh_token"),
    });
  }

  private async makeRequest(path: string, opts?: RequestOpts): Promise<any> {
    const url = `${googleApisUrl}${path}`;
    const method = opts?.method || "get";
    console.log(`${method} ${url}`);
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.tokens.access_token}`,
      },
      body: opts?.data ? JSON.stringify(opts.data) : undefined,
    });
    if (method !== "delete") {
      try {
        const data = await response.json();
        console.log(`${method} ${url}`, JSON.stringify(data));
        return data;
      } catch (err) {
        console.error(`${method} ${url}`, err);
        throw err;
      }
    } else {
      const text = await response.text();
      console.log(`${method} ${url}`, text);
      return text;
    }
  }

  private makeCalendarRequest(path: string, opts?: RequestOpts): Promise<any> {
    return this.makeRequest(`/calendar/v3${path}`, opts);
  }

  getCalendarList(): Promise<GCalCalendarList> {
    return this.makeCalendarRequest("/users/me/calendarList");
  }

  insertCalendar(
    calendarDetails: DeepPartial<GCalCalendarListEntry>,
  ): Promise<GCalCalendarListEntry> {
    return this.makeCalendarRequest("/calendars", {
      method: "post",
      data: calendarDetails,
    });
  }

  insertCalendarIntoList(calendarId: string): Promise<GCalCalendarListEntry> {
    return this.makeCalendarRequest("/users/me/calendarList", {
      method: "post",
      data: { id: calendarId },
    });
  }

  getEvents(calendarId = "primary"): Promise<GCalEventsResponse> {
    return this.makeCalendarRequest(`/calendars/${calendarId}/events`);
  }

  insertEvent(
    calendarId: string,
    eventDetails: DeepPartial<GCalEvent>,
  ): Promise<GCalEvent> {
    return this.makeCalendarRequest(`/calendars/${calendarId}/events`, {
      method: "post",
      data: eventDetails,
    });
  }

  deleteEvent(calendarId: string, eventId: string) {
    return this.makeCalendarRequest(
      `/calendars/${calendarId}/events/${eventId}`,
      {
        method: "delete",
      },
    );
  }

  async ensureHasAppointmentsAndAvailabilityCalendars(): Promise<{
    hgatAppointmentsCalendar: GCalCalendarListEntry;
    hgatAvailabilityCalendar: GCalCalendarListEntry;
  }> {
    const list = await this.getCalendarList();

    let hgatAppointmentsCalendar = list.items.find((calendar) =>
      calendar.summary === "HGAT Appointments"
    );

    if (!hgatAppointmentsCalendar) {
      hgatAppointmentsCalendar = await this.insertCalendar({
        summary: "HGAT Appointments",
        description: "Appointments for HGAT",
        timeZone: "Africa/Johannesburg",
      });

      hgatAppointmentsCalendar = await this.insertCalendarIntoList(
        hgatAppointmentsCalendar.id,
      );
      console.log("Created Cppointments Calendar");
    }

    let hgatAvailabilityCalendar = list.items.find((calendar) =>
      calendar.summary === "HGAT Availability"
    );

    if (!hgatAvailabilityCalendar) {
      hgatAvailabilityCalendar = await this.insertCalendar({
        summary: "HGAT Availability",
        description: "Availability for HGAT",
        timeZone: "Africa/Johannesburg",
      });

      hgatAvailabilityCalendar = await this.insertCalendarIntoList(
        hgatAvailabilityCalendar.id,
      );
      console.log("Created Availability Calendar");
    }

    return { hgatAppointmentsCalendar, hgatAvailabilityCalendar };
  }

  async getFreeBusy({ timeMin, timeMax, calendarIds }: {
    timeMin: Date;
    timeMax: Date;
    calendarIds: string[];
  }): Promise<GCalFreeBusy> {
    const freeBusy: GCalFreeBusy = await this.makeCalendarRequest("/freeBusy", {
      method: "post",
      data: {
        timeMin: moment(timeMin).format(),
        timeMax: moment(timeMax).format(),
        timeZone: "Africa/Johannesburg",
        items: calendarIds.map((id) => ({ id })),
      },
    });

    for (const calendar of Object.values(freeBusy.calendars)) {
      for (const busy of calendar.busy) {
        assert(
          busy.start.endsWith("+02:00"),
          "Expected all dates to be on Zimbabwe time",
        );
        assert(
          busy.start.endsWith("+02:00"),
          "Expected all dates to be on Zimbabwe time",
        );
      }
    }

    return freeBusy;
  }

  getProfile(): Promise<GoogleProfile> {
    return this.makeRequest("/oauth2/v3/userinfo");
  }
}

console.log('Deno.env.get("SELF_URL")', Deno.env.get("SELF_URL"));

const selfUrl = Deno.env.get("SELF_URL") ||
  "https://hgat-platform.herokuapp.com";
const redirect_uri = `${selfUrl}/logged-in`;

export const oauthParams = new URLSearchParams({
  redirect_uri,
  prompt: "consent",
  response_type: "code",
  client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
  scope:
    "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
  access_type: "offline",
  service: "lso",
  o2v: "2",
  flowName: "GeneralOAuthFlow",
});

export async function getInitialTokensFromAuthCode(
  google_auth_code: string,
): Promise<GoogleTokens> {
  const formData = new URLSearchParams({
    redirect_uri,
    code: google_auth_code,
    client_id: Deno.env.get("GOOGLE_CLIENT_ID")!,
    client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET")!,
    scope: "",
    grant_type: "authorization_code",
  });

  const result = await fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  const tokens = await result.json();

  console.log("tokens", JSON.stringify(tokens));

  assert(tokens);
  assertEquals(typeof tokens.access_token, "string");
  assertEquals(typeof tokens.refresh_token, "string");

  return tokens;
}

type GetFromRefreshTokenResult =
  | { error: true; error_description: string }
  | { error: false; access_token: string };

export async function getNewAccessTokenFromRefreshToken(
  refresh_token: string,
): Promise<GetFromRefreshTokenResult> {
  const result = await fetch("https://oauth2.googleapis.com/token", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      refresh_token,
      client_id: Deno.env.get("GOOGLE_CLIENT_ID"),
      client_secret: Deno.env.get("GOOGLE_CLIENT_SECRET"),
      grant_type: "refresh_token",
    }),
  });

  const json = await result.json();

  assert(json);

  if (json.error) {
    return {
      error: true,
      error_description: json.error_description,
    };
  }

  assertEquals(typeof json.access_token, "string");

  return {
    error: false,
    access_token: json.access_token,
  };
}
