import { a, l, u, cX as EmptyState, b as s, cY as Menu, cZ as GoogleMeetIcon, c_ as MapPinIcon, c$ as timeRangeInSimpleAmPm, d0 as stringify, d1 as CalendarIcon, d2 as Avatar, B as Button, c as classNames, bo as SectionHeader } from "../server-entry.mjs";
const $$_tpl_1$3 = ['<svg viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg" ', '><g clip-path="url(#clip0_905_72444)"><path d="M8 6V2M16 6V2M7 10H17M5 20H19C19.5304 20 20.0391 19.7893 20.4142 19.4142C20.7893 19.0391 21 18.5304 21 18V6C21 5.46957 20.7893 4.96086 20.4142 4.58579C20.0391 4.21071 19.5304 4 19 4H5C4.46957 4 3.96086 4.21071 3.58579 4.58579C3.21071 4.96086 3 5.46957 3 6V18C3 18.5304 3.21071 19.0391 3.58579 19.4142C3.96086 19.7893 4.46957 20 5 20Z" stroke="#3F3F46" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><g clip-path="url(#clip1_905_72444)"><rect x="14" y="13" width="12" height="12" rx="6" fill="white"></rect><path d="M27.391 22.0615C27.7931 21.0909 28 20.0506 28 19C28 16.8783 27.1571 14.8434 25.6569 13.3431C24.1566 11.8429 22.1217 11 20 11C17.8783 11 15.8434 11.8429 14.3431 13.3431C12.8429 14.8434 12 16.8783 12 19C12 20.0506 12.2069 21.0909 12.609 22.0615C13.011 23.0321 13.6003 23.914 14.3431 24.6569C15.086 25.3997 15.9679 25.989 16.9385 26.391C17.9091 26.7931 18.9494 27 20 27C21.0506 27 22.0909 26.7931 23.0615 26.391C24.0321 25.989 24.914 25.3997 25.6569 24.6569C26.3997 23.914 26.989 23.0321 27.391 22.0615Z" fill="#3E28DF"></path><path d="M20 16.3333V19M20 19V21.6667M20 19H22.6667M20 19H17.3333M28 19C28 20.0506 27.7931 21.0909 27.391 22.0615C26.989 23.0321 26.3997 23.914 25.6569 24.6569C24.914 25.3997 24.0321 25.989 23.0615 26.391C22.0909 26.7931 21.0506 27 20 27C18.9494 27 17.9091 26.7931 16.9385 26.391C15.9679 25.989 15.086 25.3997 14.3431 24.6569C13.6003 23.914 13.011 23.0321 12.609 22.0615C12.2069 21.0909 12 20.0506 12 19C12 16.8783 12.8429 14.8434 14.3431 13.3431C15.8434 11.8429 17.8783 11 20 11C22.1217 11 24.1566 11.8429 25.6569 13.3431C27.1571 14.8434 28 16.8783 28 19Z" stroke="white" stroke-width="2.37037" stroke-linecap="round" stroke-linejoin="round"></path></g></g><defs><clipPath id="clip0_905_72444"><rect width="27" height="26" fill="white"></rect></clipPath><clipPath id="clip1_905_72444"><rect x="14" y="13" width="12" height="12" rx="6" fill="white"></rect></clipPath></defs></svg>'];
function MakeAppointmentIcon({
  className
}) {
  return a($$_tpl_1$3, l("class", className));
}
function CalendarEmptyState({
  patient_id
}) {
  let search;
  if (patient_id) {
    search = new URLSearchParams({
      patient_id
    }).toString();
  }
  return u(EmptyState, {
    header: "No appointments",
    explanation: "Create an appointment with a new or existing patient",
    icon: u(MakeAppointmentIcon, {
      className: "mx-auto h-12 w-12 text-gray-400"
    }),
    button: {
      children: "New Appointment",
      href: search ? `/app/calendar/appointments/schedule?${search}` : "/app/calendar/appointments/schedule"
    }
  });
}
const $$_tpl_1$2 = ['<path fill="#E0E0E0" d="M1041.858 178.02C927.206 63.289 774.753.07 612.325 0 277.617 0 5.232 272.298 5.098 606.991c-.039 106.986 27.915 211.42 81.048 303.476L0 1225.016l321.898-84.406c88.689 48.368 188.547 73.855 290.166 73.896h.258.003c334.654 0 607.08-272.346 607.222-607.023.056-162.208-63.052-314.724-177.689-429.463zm-429.533 933.963h-.197c-90.578-.048-179.402-24.366-256.878-70.339l-18.438-10.93-191.021 50.083 51-186.176-12.013-19.087c-50.525-80.336-77.198-173.175-77.16-268.504.111-278.186 226.507-504.503 504.898-504.503 134.812.056 261.519 52.604 356.814 147.965 95.289 95.36 147.728 222.128 147.688 356.948-.118 278.195-226.522 504.543-504.693 504.543z"></path><linearGradient id="a" gradientUnits="userSpaceOnUse" x1="609.77" y1="1190.114" x2="609.77" y2="21.084"><stop offset="0" stop-color="#20b038"></stop><stop offset="1" stop-color="#60d66a"></stop></linearGradient><path fill="url(#a)" d="M27.875 1190.114l82.211-300.18c-50.719-87.852-77.391-187.523-77.359-289.602.133-319.398 260.078-579.25 579.469-579.25 155.016.07 300.508 60.398 409.898 169.891 109.414 109.492 169.633 255.031 169.57 409.812-.133 319.406-260.094 579.281-579.445 579.281-.023 0 .016 0 0 0h-.258c-96.977-.031-192.266-24.375-276.898-70.5l-307.188 80.548z"></path><image overflow="visible" opacity=".08" width="682" height="639" transform="translate(270.984 291.372)"></image><path fill-rule="evenodd" clip-rule="evenodd" fill="#FFF" d="M462.273 349.294c-11.234-24.977-23.062-25.477-33.75-25.914-8.742-.375-18.75-.352-28.742-.352-10 0-26.25 3.758-39.992 18.766-13.75 15.008-52.5 51.289-52.5 125.078 0 73.797 53.75 145.102 61.242 155.117 7.5 10 103.758 166.266 256.203 226.383 126.695 49.961 152.477 40.023 179.977 37.523s88.734-36.273 101.234-71.297c12.5-35.016 12.5-65.031 8.75-71.305-3.75-6.25-13.75-10-28.75-17.5s-88.734-43.789-102.484-48.789-23.75-7.5-33.75 7.516c-10 15-38.727 48.773-47.477 58.773-8.75 10.023-17.5 11.273-32.5 3.773-15-7.523-63.305-23.344-120.609-74.438-44.586-39.75-74.688-88.844-83.438-103.859-8.75-15-.938-23.125 6.586-30.602 6.734-6.719 15-17.508 22.5-26.266 7.484-8.758 9.984-15.008 14.984-25.008 5-10.016 2.5-18.773-1.25-26.273s-32.898-81.67-46.234-111.326z"></path><path fill="#FFF" d="M1036.898 176.091C923.562 62.677 772.859.185 612.297.114 281.43.114 12.172 269.286 12.039 600.137 12 705.896 39.633 809.13 92.156 900.13L7 1211.067l318.203-83.438c87.672 47.812 186.383 73.008 286.836 73.047h.255.003c330.812 0 600.109-269.219 600.25-600.055.055-160.343-62.328-311.108-175.649-424.53zm-424.601 923.242h-.195c-89.539-.047-177.344-24.086-253.93-69.531l-18.227-10.805-188.828 49.508 50.414-184.039-11.875-18.867c-49.945-79.414-76.312-171.188-76.273-265.422.109-274.992 223.906-498.711 499.102-498.711 133.266.055 258.516 52 352.719 146.266 94.195 94.266 146.031 219.578 145.992 352.852-.118 274.999-223.923 498.749-498.899 498.749z"></path>'];
function WhatsAppIcon(props) {
  return u("svg", {
    viewBox: "-2.73 0 1225.016 1225.016",
    ...props,
    children: a($$_tpl_1$2)
  });
}
const $$_tpl_1$1 = ['<h3 class="pr-10 font-semibold text-gray-900 xl:pr-0">', "</h3>"];
const $$_tpl_2$1 = ["", '<div class="flex-auto">', '<dl class="mt-2 flex flex-col text-gray-500 xl:flex-row"><div class="flex items-start space-x-1.5"><dt><span class="sr-only">Date</span>', "</dt><dd><time ", ">", "</time></dd></div>", "", "", "</dl></div>"];
const $$_tpl_3 = ['<div class="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5"><dt><span class="sr-only">Location</span>', "", "</dt></div>"];
const $$_tpl_4 = ['<div class="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5"><dt><span class="sr-only">Link</span>', "</dt></div>"];
const $$_tpl_5 = ['<div class="mt-2 flex items-start space-x-3 xl:ml-3.5 xl:mt-0 xl:border-l xl:border-gray-400 xl:border-opacity-50 xl:pl-3.5"><dt>', "</dt></div>"];
const $$_tpl_6 = ["<form ", ' method="POST">', "</form>"];
const $$_tpl_7 = ['<li class="relative flex space-x-6 xl:static hover:bg-gray-50 px-2 py-3">', "", "</li>"];
function AppointmentContents({
  appointment,
  href
}) {
  const featuring = appointment.type === "employee_appointment" ? appointment.patient : appointment.employees[0];
  const header = a($$_tpl_1$1, s(featuring.name));
  return a($$_tpl_2$1, u(Avatar, {
    src: featuring.avatar_url,
    className: "h-14 w-14"
  }), s(href ? u("a", {
    href,
    children: header
  }) : header), u(CalendarIcon, {
    className: "h-5 w-5 text-gray-400",
    "aria-hidden": "true"
  }), l("datetime", stringify(appointment.start)), s(timeRangeInSimpleAmPm(appointment.start, appointment.end)), s(appointment.physical_location && a($$_tpl_3, u(MapPinIcon, {
    className: "h-5 w-5 text-gray-400",
    "aria-hidden": "true"
  }), s(appointment.physical_location.organization.name))), s(appointment.virtual_location && a($$_tpl_4, u("a", {
    href: appointment.virtual_location.href,
    class: "text-indigo-600 font-bold flex",
    children: [u(GoogleMeetIcon, {
      className: "w-5 mr-1"
    }), "Join Google Meet"]
  }))), s("phone_number" in featuring && featuring.phone_number && a($$_tpl_5, u("a", {
    href: `https://wa.me/${featuring.phone_number}`,
    class: "text-indigo-600 font-bold flex",
    children: [u(WhatsAppIcon, {
      className: "w-5 mr-1"
    }), "Message"]
  }))));
}
function AppointmentSlot({
  slot,
  url
}) {
  const search = new URLSearchParams(url.search);
  search.set("start", stringify(slot.start));
  search.set("end", stringify(slot.end));
  search.set("duration_minutes", String(slot.duration_minutes));
  if (slot.employees) {
    search.set("employee_ids", JSON.stringify(slot.employees.map((employee) => employee.employee_id)));
  }
  return a($$_tpl_6, l("action", `${url.pathname}?${search}`), u(Button, {
    children: "Book"
  }));
}
function Appointment({
  url,
  appointment
}) {
  const href = appointment.type === "employee_appointment" ? `${url.pathname}/appointments/${appointment.id}` : void 0;
  return a($$_tpl_7, u(AppointmentContents, {
    appointment,
    href
  }), s(appointment.type === "employee_appointment_slot" ? u(AppointmentSlot, {
    slot: appointment,
    url
  }) : u(Menu, {
    icon: "DotsVerticalIcon",
    options: [{
      label: "Cancel",
      href: `${href}/cancel`
    }, {
      label: "Reschedule",
      href: `${href}/reschedule`
    }],
    className: "top-2 right-2 xl:relative xl:right-auto xl:top-auto xl:self-center"
  })));
}
const $$_tpl_1 = ["<div ", ">", "", "</div>"];
const $$_tpl_2 = ["<ol ", ">", "", "</ol>"];
function Appointments({
  headerText,
  patient_id,
  appointments,
  url,
  className
}) {
  const use_class_name = classNames("divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full", className);
  const header = u(SectionHeader, {
    children: headerText
  });
  if (!appointments.length) {
    return a($$_tpl_1, l("class", use_class_name), s(header), u(CalendarEmptyState, {
      patient_id
    }));
  }
  return a($$_tpl_2, l("class", use_class_name), s(header), s(appointments.map((appointment) => u(Appointment, {
    appointment,
    url
  }, appointment.id))));
}
export {
  Appointments as A
};
