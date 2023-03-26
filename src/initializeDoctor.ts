// import * as doctors from "./models/doctors";
// import * as google from "./google";
// import { Doctor, GoogleTokens } from "./types.ts";

// export async function initializeDoctor(
//   ctx: RouterContext,
//   tokens: GoogleTokens,
// ): Promise<Doctor> {
//   const googleAgent = new google.Agent(tokens);

//   const gettingProfile = googleAgent.getProfile();
//   const gettingCalendars = googleAgent
//     .ensureHasAppointmentsAndAvailabilityCalendars();

//   const profile = await gettingProfile;
//   const calendars = await gettingCalendars;

//   const doctor = await doctors.upsertWithGoogleCredentials({
//     name: profile.name,
//     email: profile.email,
//     gcal_appointments_calendar_id: calendars.hgatAppointmentsCalendar.id,
//     gcal_availability_calendar_id: calendars.hgatAvailabilityCalendar.id,
//     access_token: googleAgent.tokens.access_token,
//     refresh_token: googleAgent.tokens.refresh_token,
//   });

//   ctx.session!.doctorId = doctor.id;

//   return doctor;
// }
