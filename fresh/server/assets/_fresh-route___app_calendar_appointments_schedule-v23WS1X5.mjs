import { u, av as Form, K as FormRow, dN as PersonSearch, dO as DateInput, aB as TextInput, dP as FormButtons, m as assert, dj as assertAllJohannesburg, au as employees, S as assertEquals, dn as formatJohannesburg, a2 as promiseProps, cV as google_tokens, x as HealthWorkerGoogleClient, dQ as isIsoJohannesburg, dR as differenceInMinutes, dS as assertOr401, cS as appointments, H as HealthWorkerHomePage, r as redirect, dI as parseRequest, z, p as patients, cW as parseDateTime, a, b as s, cL as positive_integer, dT as insertEvent } from "../server-entry.mjs";
import { e as employment_calendars } from "./employment_calendars-DTp7pD3u.mjs";
import { A as Appointments } from "./Appointments-CMMRLfC-.mjs";
import { p as postHandler } from "./postHandler-C0kx5_nS.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
function ScheduleForm({
  className,
  patient
}) {
  return u(Form, {
    className,
    children: [u(FormRow, {
      children: u(PersonSearch, {
        name: "patient",
        value: patient,
        search_route: "/app/patients?completed_registration=true",
        required: true
      })
    }), u(FormRow, {
      children: u(PersonSearch, {
        name: "provider",
        search_route: "/app/providers?roles=[doctor,nurse]"
      })
    }), u(FormRow, {
      children: u(DateInput, {
        className: "w-full"
      })
    }), u(FormRow, {
      children: u(TextInput, {
        name: "reason",
        required: true
      })
    }), u(FormButtons, {
      className: "mt-4",
      submitText: "Next Available"
    })]
  });
}
function flatten(array) {
  const result = [];
  for (const item of array) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}
function getAvailability(calendars, free_busy) {
  const availability = [...free_busy.calendars[calendars.gcal_availability_calendar_id].busy];
  const appointments2 = free_busy.calendars[calendars.gcal_appointments_calendar_id].busy;
  appointments2.forEach((appointment) => {
    const conflict_index = availability.findIndex((availabilityBlock) => appointment.start >= availabilityBlock.start && appointment.start < availabilityBlock.end || appointment.end > availabilityBlock.start && appointment.end <= availabilityBlock.end);
    if (conflict_index === -1) return;
    const conflict = availability[conflict_index];
    let spliceWith;
    if (conflict.start === appointment.start && conflict.end === appointment.end) {
      spliceWith = [];
    } else if (conflict.start === appointment.start) {
      spliceWith = [{
        start: appointment.end,
        end: conflict.end
      }];
    } else if (conflict.end === appointment.end) {
      spliceWith = [{
        start: conflict.start,
        end: appointment.start
      }];
      return;
    } else {
      spliceWith = [{
        start: conflict.start,
        end: appointment.start
      }, {
        start: appointment.end,
        end: conflict.end
      }];
    }
    availability.splice(conflict_index, 1, ...spliceWith);
  });
  return availability;
}
function defaultTimeRange() {
  const time_min = /* @__PURE__ */ new Date();
  time_min.setHours(time_min.getHours() + 2);
  const time_max = new Date(time_min);
  time_max.setDate(time_min.getDate() + 7);
  return {
    time_min,
    time_max
  };
}
async function providerAvailability(trx, employee, timeRange = defaultTimeRange()) {
  const {
    google_tokens_of_provider,
    calendars
  } = await promiseProps({
    google_tokens_of_provider: google_tokens.getByEntityId(trx, "health_worker", employee.id),
    calendars: employment_calendars.findOneOptional(trx, employee)
  });
  if (!google_tokens_of_provider || !calendars?.availability_set) {
    return {
      provider: {
        ...employee,
        calendars: null
      },
      availability: [],
      availability_set: false
    };
  }
  const health_worker_google_client = new HealthWorkerGoogleClient(trx, {
    ...employee,
    ...google_tokens_of_provider
  });
  const free_busy = await health_worker_google_client.getFreeBusy({
    ...timeRange,
    calendarIds: [calendars.gcal_appointments_calendar_id, calendars.gcal_availability_calendar_id]
  });
  return {
    provider: {
      ...employee,
      calendars
    },
    health_worker_google_client,
    availability: getAvailability(calendars, free_busy)
  };
}
function getAllProviderAvailability(trx, providers, timeRange = defaultTimeRange()) {
  return Promise.all(providers.map((provider) => providerAvailability(trx, provider, timeRange)));
}
async function availableSlots(trx, {
  dates,
  declined_times = [],
  count,
  employment_ids,
  duration_minutes = 30
}) {
  assert(count > 0, "count must be greater than 0");
  assertAllJohannesburg(declined_times);
  const providers = await employees.getByIds(trx, employment_ids);
  const provider_availability = await getAllProviderAvailability(trx, providers);
  const slots = [];
  for (const {
    provider,
    availability
  } of provider_availability) {
    for (const {
      start,
      end
    } of availability) {
      const more_slots = generateSlots({
        start,
        end,
        duration_minutes
      }).filter((slot) => !declined_times.includes(slot.start)).filter((appointment) => {
        if (!dates) return true;
        const appointment_date = appointment.start.substring(0, 10);
        return dates.includes(appointment_date);
      }).map((slot) => ({
        provider,
        ...slot
      }));
      slots.push(...more_slots);
    }
  }
  slots.sort((a2, b) => new Date(a2.start).valueOf() - new Date(b.start).valueOf());
  if (!slots.length) return [];
  const unique_slots = [...new Map(slots.map((slot) => [slot.start, slot])).values()];
  assert(unique_slots.length > 0, "No availability found");
  const slots_with_dates = unique_slots.map((slot) => ({
    provider: slot.provider,
    start: new Date(slot.start),
    end: new Date(slot.end),
    duration_minutes: slot.duration_minutes
  }));
  if (!dates) return slots_with_dates.slice(0, count);
  assertEquals(count / dates.length, Math.floor(count / dates.length), "For now we only support balancing slots across dates evenly");
  return flatten(dates.map((date) => slots_with_dates.filter((time) => formatJohannesburg(time.start).startsWith(date)).slice(0, count / dates.length)));
}
function generateSlots({
  start,
  end,
  duration_minutes = 30
}) {
  const duration_millis = duration_minutes * 60 * 1e3;
  const current = new Date(start);
  current.setMinutes(Math.ceil(current.getMinutes() / duration_minutes) * duration_minutes);
  current.setSeconds(0);
  current.setMilliseconds(0);
  const end_time = new Date(end).getTime();
  const slots = [];
  while (current.getTime() + duration_millis <= end_time) {
    const start_date = formatJohannesburg(current);
    current.setTime(current.getTime() + duration_millis);
    const end_date = formatJohannesburg(current);
    slots.push({
      start: start_date,
      end: end_date,
      duration_minutes
    });
  }
  return slots;
}
function gcal({
  start,
  end
}) {
  return {
    summary: "Appointment",
    start: {
      dateTime: start
    },
    end: {
      dateTime: end
    }
  };
}
async function makeAppointmentWeb(trx, values, insertEvent2) {
  assertEquals(values.employee_ids.length, 1, "TODO support multiple health workers");
  assert(isIsoJohannesburg(values.start));
  assert(isIsoJohannesburg(values.end));
  const start = new Date(values.start);
  const end = new Date(values.end);
  assertEquals(values.duration_minutes, differenceInMinutes(end, start));
  const matching_provider = await employees.getById(trx, values.employee_ids[0]);
  const tokens = await google_tokens.getByEntityId(trx, "health_worker", matching_provider.id);
  const calendars = await employment_calendars.findOneOptional(trx, matching_provider);
  assertOr401(tokens);
  assertOr401(calendars?.availability_set, "Google calendar availability not yet set");
  const inserted_event = await insertEvent2(tokens, calendars.gcal_appointments_calendar_id, gcal({
    start: values.start,
    end: values.end
  }));
  const appointment = await appointments.upsert(trx, {
    start,
    end,
    duration_minutes: values.duration_minutes,
    patient_id: values.patient_id,
    reason: values.reason,
    gcal_event_id: inserted_event.id
  });
  await appointments.addAttendees(trx, {
    appointment_id: appointment.id,
    employee_ids: values.employee_ids
  });
}
const $$_tpl_1 = ['<div class="flex gap-x-4">', "", "</div>"];
const ScheduleFormSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
  duration_minutes: positive_integer,
  reason: z.string(),
  patient_id: z.string().uuid(),
  employee_ids: z.string().uuid().array()
});
const SearchSchema = z.object({
  employee_id: z.string().uuid().optional(),
  organization_id: z.string().uuid().optional(),
  provider_name: z.string().uuid().optional(),
  patient_id: z.string().uuid().optional(),
  patient_name: z.string().uuid().optional(),
  date: z.string().uuid().optional(),
  reason: z.string().uuid().optional()
});
const handler$1 = postHandler(ScheduleFormSchema, async (ctx, form_values) => {
  await makeAppointmentWeb(ctx.state.trx, form_values, insertEvent);
  return redirect("/app/calendar");
});
const schedule = HealthWorkerHomePage("Schedule Appointment", async function SchedulePage(ctx) {
  const search = await parseRequest(ctx.req, SearchSchema.parse);
  const {
    patient,
    availability
  } = await promiseProps({
    patient: search.patient_id ? patients.getByIdCompletedRegistration(ctx.state.trx, search.patient_id) : Promise.resolve(void 0),
    availability: search.employee_id ? availableSlots(ctx.state.trx, {
      count: 10,
      dates: search.date ? [search.date] : void 0,
      employment_ids: [search.employee_id]
    }) : Promise.resolve([])
  });
  const slots = patient ? availability.map((slot) => ({
    type: "employee_appointment_slot",
    patient,
    id: `${slot.provider.employee_id}-${slot.start}`,
    duration_minutes: slot.duration_minutes,
    start: parseDateTime(new Date(slot.start)),
    end: parseDateTime(new Date(slot.end)),
    employees: [slot.provider]
  })) : [];
  return a($$_tpl_1, u(ScheduleForm, {
    className: "w-1/2",
    patient
  }), s(slots && u(Appointments, {
    headerText: "Slots available",
    patient_id: patient?.id,
    appointments: slots,
    url: ctx.url,
    className: "w-1/2"
  })));
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = handler$1;
const handlers = void 0;
const _freshRoute___app_calendar_appointments_schedule = schedule;
export {
  config,
  css,
  _freshRoute___app_calendar_appointments_schedule as default,
  handler,
  handlers
};
