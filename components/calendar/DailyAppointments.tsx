import { FunctionComponent, h } from "preact";
import AppointmentDay from "./AppointmentDay.tsx";
import AppointmentCard from "./AppointmentCard.tsx";
import { DoctorAppointment } from "../../types.ts";

interface DailyAppointmentsProps {
  dailyAppointments: DoctorAppointment[];
}

const DailyAppointments: FunctionComponent<DailyAppointmentsProps> = ({
  dailyAppointments,
}) => {
  if (!dailyAppointments.length) return null;
  return (
    <div className="flex">
      <div className="mr-2 flex-none">
        <AppointmentDay
          day={dailyAppointments[0].start.day}
          weekday={dailyAppointments[0].start.weekday}
        />
      </div>
      <div className="w-full mr-3">
        {dailyAppointments.map((appt, key) => (
          <AppointmentCard key={key} {...appt} />
        ))}
      </div>
    </div>
  );
};

export default DailyAppointments;
