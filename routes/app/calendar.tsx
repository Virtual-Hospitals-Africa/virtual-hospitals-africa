import Layout from "../../components/Layout.tsx";
import { JSX } from "preact";
import DailyAppointments from "../../components/calendar/DailyAppointments.tsx";
import DatePicker from "../../islands/date-picker.tsx";
import MonthPicker from "../../islands/month-picker.tsx";
import { useState } from "https://esm.sh/preact@10.13.1/hooks";
import { Handlers, PageProps } from "$fresh/server.ts";
import { Agent } from "../../external-clients/google.ts";
import { DoctorAppointment, GCalEventsResponse } from "../../types.ts";
import { WithSession } from "fresh_session";

function CalendarLink(
  { title, href, icon }: { title: string; href: string; icon: JSX.Element },
) {
  return (
    <a class="calendar-link" href={href}>
      <span>{title}</span>
      <div class="green-button">
        {icon}
      </div>
    </a>
  );
}

let dailyAppointments: DoctorAppointment[];

export const handler: Handlers<
  { events: GCalEventsResponse },
  WithSession
> = {
  async GET(body, ctx) {
    // 1. find the gcal_appointments_calendar_id as part of the session.
    // 2. Pass that in as the id to agent.getEvents();
    // 3. Use the event data in the view
    // 4. [Optional] specify timeMin/timeMax so that we are only fetching upcoming appointments
    // https://developers.google.com/calendar/api/v3/reference/events/list?hl=es-419
    //  If necessary, do some data-massaging server side

    const agent = Agent.fromCtx(ctx);

    const events = await agent.getEvents(
      ctx.state.session.data.gcal_appointments_calendar_id,
    );
    console.log(
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    );
    const url = new URL(body.headers.get("referer") as string);
    const dateString = url.searchParams.get("startday");
    // initialize date
    let selectedYear: number;
    let selectedMonth: number;
    let selectedDay: number;
    if (dateString != null) {
      // Split the date string into an array [year, month, day]
      const dateArray = dateString.split("-");
      // Extract the year, month, and day as individual variables
      selectedYear = parseInt(dateArray[0]);
      selectedMonth = parseInt(dateArray[1]) - 1; // Subtract 1 to convert to a zero-based index for JavaScript Date object
      selectedDay = parseInt(dateArray[2]);
      console.log(
        `Year: ${selectedYear}, Month: ${selectedMonth}, Day: ${selectedDay}`,
      );
    }

    console.log(
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    );

    const mappedAppointments = events.items.map((item) => {
      const start = new Date(item.start.dateTime);
      const day = parseInt(
        start.toLocaleDateString("en-US", { day: "numeric" }),
      );
      const month = parseInt(
        start.toLocaleDateString("en-US", { month: "numeric" }),
      );
      const year = parseInt(
        start.toLocaleDateString("en-US", { year: "numeric" }),
      );
      const weekday = start.toLocaleString("en-US", { weekday: "short" });
      const appointment = {
        stripeColor: "bg-blue-500", // Just blue for now
        time: start.toLocaleString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        }),
        patientName: item.summary.replace(/^Appointment with /, ""), // Remove the prefix "Appointment with "
        patientAge: 30, // Not in the google calendar
        clinicName: item.organizer.displayName,
        durationMinutes: Math.round(
          (new Date(item.end.dateTime).getTime() - start.getTime()) /
            (1000 * 60),
        ) + " mins", // Calculate duration in minutes
      };
      return { day, weekday, appointments: [appointment] };
    });

    // Merge appointments for the same day/weekday
    const mergedAppointments: DoctorAppointment[] = [];
    mappedAppointments.forEach((appointment) => {
      const existingAppointment = mergedAppointments.find((a) =>
        a.day === appointment.day && a.weekday === appointment.weekday
      );
      if (existingAppointment) {
        existingAppointment.appointments.push(...appointment.appointments);
      } else {
        mergedAppointments.push(appointment);
      }
    });
    const currentDay = parseInt(new Date().toLocaleDateString("en-US", {
      day: "numeric",
    }));
    // sort appointments by day then filter all days from appointments to only show the next week
    dailyAppointments = mergedAppointments.sort((a, b) => a.day - b.day).filter(
      (day) => (currentDay == day.day),
    );

    return ctx.render({ events });
  },
};

export default function Calendar(
  props: PageProps<{ events: GCalEventsResponse }>,
) {
  const currentMonth = new Date().getMonth();

  const [startDay, setStartDay] = useState<number>(new Date().getDate());

  // Parse the URLSearchParams object from the URL
  const urlSearchParams = new URLSearchParams(props.url.search);

  // Extract the value of the "startday" parameter
  const startDayParam = urlSearchParams.get("startday");

  if (startDayParam) {
    // Convert the startDayParam value to a number and set it in the state
    const startDayValue = startDayParam;
    const day = startDayValue.split("-")[2];
    // const day = startDayValue.toString().slice(-2);
    console.log(day);
    setStartDay(parseInt(day));
  }

  const days = Array.from({ length: 7 }, (_, i) => startDay + i);

  const date = new Date();
  date.setHours(date.getHours() + 1);

  return (
    <Layout title="My Calendar" route={props.route}>
      <div class="calendar">
        <MonthPicker selectedMonth={currentMonth} />
        <DatePicker selectedDate={startDay} days={days} />
        <DailyAppointments dailyAppointments={dailyAppointments} />
      </div>

      <hr />
      <div class="calendar-links">
        <CalendarLink
          title="Make Appointment"
          href="/app/calendar/make-appointment"
          icon={
            <svg viewBox="0 0 20 22">
              <path
                d="M13.15 20V18.5H18.5V7.75H3.5V13.25H2V3C2 2.6 2.15 2.25 2.45 1.95C2.75 1.65 3.1 1.5 3.5 1.5H5.125V0H6.75V1.5H15.25V0H16.875V1.5H18.5C18.9 1.5 19.25 1.65 19.55 1.95C19.85 2.25 20 2.6 20 3V18.5C20 18.9 19.85 19.25 19.55 19.55C19.25 19.85 18.9 20 18.5 20H13.15ZM7 21.65L5.95 20.6L8.775 17.75H0.25V16.25H8.775L5.95 13.4L7 12.35L11.65 17L7 21.65ZM3.5 6.25H18.5V3H3.5V6.25Z"
                fill="white"
              >
              </path>
            </svg>
          }
        />{" "}
        <CalendarLink
          title="Set Availability"
          href="/app/calendar/set-availability"
          icon={
            <svg viewBox="0 0 18 20">
              <path
                d="M1.5 20C1.1 20 0.75 19.85 0.45 19.55C0.15 19.25 0 18.9 0 18.5V3C0 2.6 0.15 2.25 0.45 1.95C0.75 1.65 1.1 1.5 1.5 1.5H3.125V0H4.75V1.5H13.25V0H14.875V1.5H16.5C16.9 1.5 17.25 1.65 17.55 1.95C17.85 2.25 18 2.6 18 3V18.5C18 18.9 17.85 19.25 17.55 19.55C17.25 19.85 16.9 20 16.5 20H1.5ZM1.5 18.5H16.5V7.75H1.5V18.5ZM1.5 6.25H16.5V3H1.5V6.25ZM9 12C8.71667 12 8.47917 11.9042 8.2875 11.7125C8.09583 11.5208 8 11.2833 8 11C8 10.7167 8.09583 10.4792 8.2875 10.2875C8.47917 10.0958 8.71667 10 9 10C9.28333 10 9.52083 10.0958 9.7125 10.2875C9.90417 10.4792 10 10.7167 10 11C10 11.2833 9.90417 11.5208 9.7125 11.7125C9.52083 11.9042 9.28333 12 9 12ZM5 12C4.71667 12 4.47917 11.9042 4.2875 11.7125C4.09583 11.5208 4 11.2833 4 11C4 10.7167 4.09583 10.4792 4.2875 10.2875C4.47917 10.0958 4.71667 10 5 10C5.28333 10 5.52083 10.0958 5.7125 10.2875C5.90417 10.4792 6 10.7167 6 11C6 11.2833 5.90417 11.5208 5.7125 11.7125C5.52083 11.9042 5.28333 12 5 12ZM13 12C12.7167 12 12.4792 11.9042 12.2875 11.7125C12.0958 11.5208 12 11.2833 12 11C12 10.7167 12.0958 10.4792 12.2875 10.2875C12.4792 10.0958 12.7167 10 13 10C13.2833 10 13.5208 10.0958 13.7125 10.2875C13.9042 10.4792 14 10.7167 14 11C14 11.2833 13.9042 11.5208 13.7125 11.7125C13.5208 11.9042 13.2833 12 13 12ZM9 16C8.71667 16 8.47917 15.9042 8.2875 15.7125C8.09583 15.5208 8 15.2833 8 15C8 14.7167 8.09583 14.4792 8.2875 14.2875C8.47917 14.0958 8.71667 14 9 14C9.28333 14 9.52083 14.0958 9.7125 14.2875C9.90417 14.4792 10 14.7167 10 15C10 15.2833 9.90417 15.5208 9.7125 15.7125C9.52083 15.9042 9.28333 16 9 16ZM5 16C4.71667 16 4.47917 15.9042 4.2875 15.7125C4.09583 15.5208 4 15.2833 4 15C4 14.7167 4.09583 14.4792 4.2875 14.2875C4.47917 14.0958 4.71667 14 5 14C5.28333 14 5.52083 14.0958 5.7125 14.2875C5.90417 14.4792 6 14.7167 6 15C6 15.2833 5.90417 15.5208 5.7125 15.7125C5.52083 15.9042 5.28333 16 5 16ZM13 16C12.7167 16 12.4792 15.9042 12.2875 15.7125C12.0958 15.5208 12 15.2833 12 15C12 14.7167 12.0958 14.4792 12.2875 14.2875C12.4792 14.0958 12.7167 14 13 14C13.2833 14 13.5208 14.0958 13.7125 14.2875C13.9042 14.4792 14 14.7167 14 15C14 15.2833 13.9042 15.5208 13.7125 15.7125C13.5208 15.9042 13.2833 16 13 16Z"
                fill="white"
              >
              </path>
            </svg>
          }
        />{" "}
        <CalendarLink
          title="Schedule Time Off"
          href="/app/calendar/schedule-time-off"
          icon={
            <svg viewBox="0 0 18 20">
              <path
                d="M6.525 16.55L5.45 15.475L7.95 13L5.45 10.525L6.525 9.45L9 11.95L11.475 9.45L12.55 10.525L10.05 13L12.55 15.475L11.475 16.55L9 14.05L6.525 16.55ZM1.5 20C1.1 20 0.75 19.85 0.45 19.55C0.15 19.25 0 18.9 0 18.5V3C0 2.6 0.15 2.25 0.45 1.95C0.75 1.65 1.1 1.5 1.5 1.5H3.125V0H4.75V1.5H13.25V0H14.875V1.5H16.5C16.9 1.5 17.25 1.65 17.55 1.95C17.85 2.25 18 2.6 18 3V18.5C18 18.9 17.85 19.25 17.55 19.55C17.25 19.85 16.9 20 16.5 20H1.5ZM1.5 18.5H16.5V7.75H1.5V18.5ZM1.5 6.25H16.5V3H1.5V6.25Z"
                fill="white"
              >
              </path>
            </svg>
          }
        />
      </div>
    </Layout>
  );
}
