import { a, b as s, u, dU as PaperClipIcon, l, H as HealthWorkerHomePage, cS as appointments, m as assert } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1$3 = ['<div class="px-4 py-6 bg-gray-300 border-2 border-gray-300 rounded-md"><div class="px-4 sm:px-0"><h3 class="text-base font-semibold leading-7 text-gray-900">Patient Registration</h3><p class="max-w-2xl mt-1 text-sm leading-6 text-gray-500">Personal details and application.</p></div><div class="mt-6"><dl class="grid grid-cols-1 sm:grid-cols-2"><div class="px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0"><dt class="text-sm font-medium leading-6 text-gray-900">Full name</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">', '</dd></div><div class="px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0"><dt class="text-sm font-medium leading-6 text-gray-900">Application for</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">Backend Developer</dd></div><div class="px-4 py-6 border-t border-gray-100 sm:col-span-1 sm:px-0"><dt class="text-sm font-medium leading-6 text-gray-900">Salary expectation</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">$120,000</dd></div><div class="px-4 py-6 border-t border-gray-100 sm:col-span-2 sm:px-0"><dt class="text-sm font-medium leading-6 text-gray-900">About</dt><dd class="mt-1 text-sm leading-6 text-gray-700 sm:mt-2">Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.</dd></div><div class="px-4 py-6 border-t border-gray-100 sm:col-span-2 sm:px-0"><dt class="text-sm font-medium leading-6 text-gray-900">Attachments</dt><dd class="mt-2 text-sm text-gray-900"><ul role="list" class="border border-gray-200 divide-y divide-gray-100 rounded-md"><li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"><div class="flex items-center flex-1 w-0">', '<div class="flex flex-1 min-w-0 gap-2 ml-4"><span class="font-medium truncate">resume_back_end_developer.pdf</span><span class="flex-shrink-0 text-gray-400">2.4mb</span></div></div><div class="flex-shrink-0 ml-4">', '</div></li><li class="flex items-center justify-between py-4 pl-4 pr-5 text-sm leading-6"><div class="flex items-center flex-1 w-0">', '<div class="flex flex-1 min-w-0 gap-2 ml-4"><span class="font-medium truncate">coverletter_back_end_developer.pdf</span><span class="flex-shrink-0 text-gray-400">4.5mb</span></div></div><div class="flex-shrink-0 ml-4">', "</div></li></ul></dd></div></dl></div></div>"];
function PatientDetailedCard({
  patient
}) {
  return a($$_tpl_1$3, s(patient.name), u(PaperClipIcon, {
    className: "flex-shrink-0 w-5 h-5 text-gray-400",
    "aria-hidden": "true"
  }), u("a", {
    href: "#",
    class: "font-medium text-indigo-600 hover:text-indigo-500",
    children: "Download"
  }), u(PaperClipIcon, {
    className: "flex-shrink-0 w-5 h-5 text-gray-400",
    "aria-hidden": "true"
  }), u("a", {
    href: "#",
    class: "font-medium text-indigo-600 hover:text-indigo-500",
    children: "Download"
  }));
}
const $$_tpl_1$2 = ["<video controls ", "></video>"];
const $$_tpl_2 = ["<audio controls ", "></audio>"];
function Media({
  src,
  mime_type
}) {
  const media_type = mime_type.toLowerCase();
  if (media_type.startsWith("image/")) {
    return u("img", {
      src
    });
  } else if (media_type.startsWith("video/")) {
    return a($$_tpl_1$2, l("src", src));
  } else if (media_type.startsWith("audio/")) {
    return a($$_tpl_2, l("src", src));
  }
  throw "Unspported Media Type: {mime_type}";
}
const $$_tpl_1$1 = ['<div class="py-6 px-4 rounded-md border-2 border-gray-300 bg-gray-300"><div>Appointment Medias:</div><div>', "</div></div>"];
function AppointmentDetail({
  appointment
}) {
  return a($$_tpl_1$1, s(appointment.media.map((media) => u(Media, {
    src: `/app/calendar/appointments/${appointment.id}/media/${media.media_id}`,
    mime_type: media.mime_type
  }))));
}
const $$_tpl_1 = ["", "", ""];
const _id_ = HealthWorkerHomePage(async function AppointmentPage(ctx) {
  const {
    health_worker
  } = ctx.state;
  const {
    id
  } = ctx.params;
  const [appointment] = await appointments.getWithPatientInfo(ctx.state.trx, {
    id,
    health_worker_id: health_worker.id
  });
  assert(appointment, "Appointment not found");
  return {
    title: `Appointment with ${appointment.patient.name}`,
    children: a($$_tpl_1, u(PatientDetailedCard, {
      patient: appointment.patient
    }), u(AppointmentDetail, {
      appointment
    }))
  };
});
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___app_calendar_appointments_id_ = _id_;
export {
  config,
  css,
  _freshRoute___app_calendar_appointments_id_ as default,
  handler,
  handlers
};
