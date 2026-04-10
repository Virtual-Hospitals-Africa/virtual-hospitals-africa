import { e0 as numberOfDaysInMonth, dp as padTime, a, u, e1 as ChevronLeftIcon, b as s, e2 as monthName, e3 as ChevronRightIcon, c as classNames, l, e4 as range, B as Button, e5 as prettyMinimal, H as HealthWorkerHomePage, x as HealthWorkerGoogleClient, a5 as todayISOInJohannesburg, $ as assertOrRedirect, a0 as warning, a2 as promiseProps, cS as appointments, m as assert, cW as parseDateTime } from "../server-entry.mjs";
import { A as Appointments } from "./Appointments-CMMRLfC-.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_2 = ['<span class="sr-only">Previous month</span>'];
const $$_tpl_3 = ['<span class="sr-only">Next month</span>'];
const $$_tpl_1$1 = ['<div class="text-center lg:col-start-8 lg:col-end-13 lg:mt-9 xl:col-start-9"><div class="flex items-center text-gray-900">', '<div class="flex-auto text-sm font-semibold">', "</div>", '</div><div class="mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500"><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div><div>S</div></div><div class="isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200">', "</div>", "</div>"];
const $$_tpl_4 = ["<time ", " ", ">", "</time>"];
function daysToShow({
  day,
  today
}) {
  const toShow = (date) => ({
    date,
    isToday: date === today,
    isSelected: date === day
  });
  const [yearInt, monthInt] = day.split("-").map((n) => parseInt(n, 10));
  const last_month_int = monthInt === 1 ? 12 : monthInt - 1;
  const last_month_year_int = monthInt === 1 ? yearInt - 1 : yearInt;
  const next_month_int = monthInt === 12 ? 1 : monthInt + 1;
  const next_month_year_int = monthInt === 12 ? yearInt + 1 : yearInt;
  const total_days_in_this_month = numberOfDaysInMonth(monthInt, yearInt);
  const days_of_this_month = range(1, total_days_in_this_month + 1).map((d) => {
    const date = `${yearInt}-${padTime(monthInt)}-${padTime(d)}`;
    return {
      isCurrentMonth: true,
      ...toShow(date)
    };
  });
  const first_day_of_this_month = /* @__PURE__ */ new Date(`${yearInt}-${padTime(monthInt)}-01`);
  const first_week_days_of_last_month = first_day_of_this_month.getDay();
  const last_day_of_this_month = /* @__PURE__ */ new Date(`${yearInt}-${padTime(monthInt)}-${total_days_in_this_month}`);
  const last_week_days_of_next_month = 6 - last_day_of_this_month.getDay();
  const total_days_in_last_month = numberOfDaysInMonth(last_month_int, last_month_year_int);
  const days_of_last_month = range(total_days_in_last_month - first_week_days_of_last_month + 1, total_days_in_last_month + 1).map((dayInt) => {
    const date = `${last_month_year_int}-${padTime(last_month_int)}-${padTime(dayInt)}`;
    return toShow(date);
  });
  const days_of_next_month = range(1, last_week_days_of_next_month + 1).map((dayInt) => {
    const date = `${next_month_year_int}-${padTime(next_month_int)}-${padTime(dayInt)}`;
    return toShow(date);
  });
  return [...days_of_last_month, ...days_of_this_month, ...days_of_next_month];
}
function Calendar({
  day,
  today,
  url,
  children
}) {
  const [yearInt, monthInt] = day.split("-").map((n) => parseInt(n, 10));
  const days = daysToShow({
    day,
    today
  });
  const last_month_int = monthInt === 1 ? 12 : monthInt - 1;
  const last_month_year_int = monthInt === 1 ? yearInt - 1 : yearInt;
  const total_days_in_last_month = numberOfDaysInMonth(last_month_int, last_month_year_int);
  const last_day_of_last_month = `${last_month_year_int}-${padTime(last_month_int)}-${total_days_in_last_month}`;
  const next_month_int = monthInt === 12 ? 1 : monthInt + 1;
  const next_month_year_int = monthInt === 12 ? yearInt + 1 : yearInt;
  const first_day_of_next_month = `${next_month_year_int}-${padTime(next_month_int)}-01`;
  return a($$_tpl_1$1, u("a", {
    type: "button",
    class: "-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500",
    href: `${url.pathname}?day=${last_day_of_last_month}`,
    children: [a($$_tpl_2), u(ChevronLeftIcon, {
      className: "h-5 w-5",
      "aria-hidden": "true"
    })]
  }), s(monthName(monthInt)), u("a", {
    type: "button",
    class: "-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500",
    href: `${url.pathname}?day=${first_day_of_next_month}`,
    children: [a($$_tpl_3), u(ChevronRightIcon, {
      className: "h-5 w-5",
      "aria-hidden": "true"
    })]
  }), s(days.map((day2, dayIdx) => u("a", {
    type: "button",
    class: classNames("py-1.5 hover:bg-gray-100 focus:z-10", day2.isCurrentMonth ? "bg-white" : "bg-gray-50", (day2.isSelected || day2.isToday) && "font-semibold", day2.isSelected && "text-white", !day2.isSelected && day2.isCurrentMonth && !day2.isToday && "text-gray-900", !day2.isSelected && !day2.isCurrentMonth && !day2.isToday && "text-gray-400", day2.isToday && !day2.isSelected && "text-indigo-600", dayIdx === 0 && "rounded-tl-lg", dayIdx === 6 && "rounded-tr-lg", dayIdx === days.length - 7 && "rounded-bl-lg", dayIdx === days.length - 1 && "rounded-br-lg"),
    href: `${url.pathname}?day=${day2.date}`,
    children: a($$_tpl_4, l("datetime", day2.date), l("class", classNames("mx-auto flex h-7 w-7 items-center justify-center rounded-full", day2.isSelected && day2.isToday && "bg-indigo-600", day2.isSelected && !day2.isToday && "bg-gray-900")), s(day2.date.split("-").pop().replace(/^0/, "")))
  }, day2.date))), s(children));
}
const $$_tpl_1 = ['<div class="lg:grid lg:grid-cols-12 lg:gap-x-16 w-full">', "", "</div>"];
function formHeaderText({
  day,
  today
}) {
  if (today === day) return "Today’s Appointments";
  const day_str_minimal = prettyMinimal(day, today);
  if (day_str_minimal === "Tomorrow") return "Tomorrow’s Appointments";
  return `Appointments on ${day_str_minimal}`;
}
function AppointmentsCalendar({
  appointments: appointments2,
  day,
  today,
  url
}) {
  return a($$_tpl_1, u(Calendar, {
    day,
    today,
    url,
    children: u(Button, {
      className: "mt-8 w-full",
      href: `${url.pathname}/appointments/schedule`,
      children: "Schedule Appointment"
    })
  }), u(Appointments, {
    headerText: formHeaderText({
      day,
      today
    }),
    appointments: appointments2,
    url,
    className: "mt-4"
  }));
}
const calendar = HealthWorkerHomePage("My Calendar", async function Calendar2(ctx) {
  const google_client = await HealthWorkerGoogleClient.fromHealthWorkerContext(ctx);
  const today = todayISOInJohannesburg();
  const day = ctx.url.searchParams.get("day") || today;
  const organization_calendars = await ctx.state.trx.selectFrom("employment_calendars").where("employment_id", "in", ctx.state.health_worker.organizations.map((o) => o.employment_id)).innerJoin("employment", "employment.id", "employment_calendars.employment_id").select(["organization_id", "gcal_appointments_calendar_id"]).execute();
  const calendar_map = new Map(organization_calendars.map((cal) => [cal.organization_id, cal.gcal_appointments_calendar_id]));
  const appointment_calendars = ctx.state.health_worker.organizations.map((organization) => {
    const gcal_appointments_calendar_id = calendar_map.get(organization.id);
    assertOrRedirect(gcal_appointments_calendar_id, warning(`Please set your availability to manage appointments at ${organization.name}`, `/app/organizations/${organization.id}/availability`));
    return gcal_appointments_calendar_id;
  });
  const {
    appointmentsOfHealthWorker,
    calendar_events
  } = await promiseProps({
    appointmentsOfHealthWorker: appointments.getWithPatientInfo(ctx.state.trx, {
      health_worker_id: ctx.state.health_worker.id
    }),
    calendar_events: Promise.all(appointment_calendars.map((calendar_id) => google_client.getActiveEvents(calendar_id, {
      time_min: `${day}T00:00:00+02:00`,
      time_max: `${day}T23:59:59+02:00`
    })))
  });
  const events = calendar_events.flatMap((events2) => events2.items);
  const gcal_event_ids = new Set(events.map((event) => event.id));
  const appointments_of_provider_with_gcal_event_ids = appointmentsOfHealthWorker.filter((appointment) => (assert(appointment.gcal_event_id), gcal_event_ids.has(appointment.gcal_event_id)));
  const employee_appointments = appointments_of_provider_with_gcal_event_ids.map((appt) => {
    const gcal_item = events.find((event) => event.id === appt.gcal_event_id);
    if (!gcal_item) {
      throw new Error("Could not find gcal event for appointment");
    }
    const start_time = new Date(gcal_item.start.dateTime);
    const end_time = new Date(gcal_item.end.dateTime);
    const duration = end_time.getTime() - start_time.getTime();
    return {
      type: "employee_appointment",
      id: appt.id,
      patient: appt.patient,
      duration_minutes: Math.round(duration / (1e3 * 60)),
      start: parseDateTime(start_time),
      end: parseDateTime(end_time),
      virtual_location: gcal_item.hangoutLink ? {
        href: gcal_item.hangoutLink
      } : void 0
    };
  });
  return u(AppointmentsCalendar, {
    url: ctx.url,
    day,
    today,
    appointments: employee_appointments
  });
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_calendar = calendar;
export {
  config,
  css,
  _freshRoute___app_calendar as default,
  handler,
  handlers
};
