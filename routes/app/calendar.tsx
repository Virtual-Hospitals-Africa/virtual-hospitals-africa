import Layout from "../../components/Layout.tsx";
import { JSX } from "preact";
import DailyAppointments from "../../components/calendar/DailyAppointments.tsx";
import { PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";

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

// imagine we are reading off db and getting appointments
const currentDay = new Date().getDate();
const all_appointments = [
  {
    day: 3,
    weekday: "Tue",
    appointments: [
      {
        stripeColor: "bg-blue-500",
        time: "1:34PM",
        patientName: "belal",
        patientAge: 27,
        clinicName: "bkhealth",
        durationMinutes: "30 mins",
      },
      {
        stripeColor: "bg-red-500",
        time: "10:00 AM",
        patientName: "Jane Smith",
        patientAge: 27,
        clinicName: "Town Clinic",
        durationMinutes: "45 mins",
      },
    ],
  },
  {
    day: 4,
    weekday: "Wed",
    appointments: [
      {
        stripeColor: "bg-green-500",
        time: "3:00 PM",
        patientName: "John Doe",
        patientAge: 35,
        clinicName: "City Clinic",
        durationMinutes: "60 mins",
      },
      {
        stripeColor: "bg-purple-500",
        time: "9:30 AM",
        patientName: "Sarah Johnson",
        patientAge: 42,
        clinicName: "Health Hub",
        durationMinutes: "30 mins",
      },
    ],
  },
  {
    day: 11,
    weekday: "Wed",
    appointments: [
      {
        stripeColor: "bg-green-500",
        time: "3:00 PM",
        patientName: "Big Leg",
        patientAge: 35,
        clinicName: "BCIT",
        durationMinutes: "60 mins",
      },
      {
        stripeColor: "bg-purple-500",
        time: "9:30 AM",
        patientName: "huh",
        patientAge: 42,
        clinicName: "yep",
        durationMinutes: "30 mins",
      },
    ],
  },
]

// filter all days to only show the next week
const dailyAppointments = all_appointments.filter((day) => day.day <= currentDay + 6);

// const dailyAppointments = {
//   day: 3,
//   weekday: "Tue",
//   appointments: [
//     {
//       stripeColor: "bg-blue-500",
//       time: "1:34PM",
//       patientName: "belal",
//       patientAge: 27,
//       clinicName: "bkhealth",
//       durationMinutes: "30 mins",
//     },
//     {
//       stripeColor: "bg-red-500",
//       time: "10:00 AM",
//       patientName: "Jane Smith",
//       patientAge: 27,
//       clinicName: "Town Clinic",
//       durationMinutes: "45 mins",
//     },
//   ],
// };

export default function Calendar(
  props: PageProps<{ props: PageProps }>,
) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const day_multiplier = 24 * 60 * 60 * 1000;

  const handlePrevWeekClick = () => {
    setSelectedDate((prevDate) => {
      const prevWeek = new Date(prevDate.getTime() - 7 * day_multiplier);
      return prevWeek;
    });
  };

  const handleNextWeekClick = () => {
    setSelectedDate((prevDate) => {
      const nextWeek = new Date(prevDate.getTime() + 7 * day_multiplier);
      return nextWeek;
    });
  };

  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(selectedDate.getTime() + i * day_multiplier);
    days.push(date);
  }

  return (
    <Layout title="My Calendar" route={props.route}>
      <div class="calendar">

      <div class="calendar-toolbar">
          <button onClick={handlePrevWeekClick}>Prev</button>
          {days.map((day, index) => (
            <button
              key={index}
              class={day.getDate() === selectedDate.getDate() ? "selected" : ""}
              onClick={() => setSelectedDate(day)}
            >
              {day.getDate()}
            </button>
          ))}
          <button onClick={handleNextWeekClick}>Next</button>
        </div>

        <p>TODO: Implement calendar view</p>
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
