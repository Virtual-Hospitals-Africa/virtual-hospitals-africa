import { FunctionComponent, h } from "preact";
import AppointmentDay from "./AppointmentDay.tsx";
import AppointmentCardDetails from "./AppointmentCardDetails.tsx";

interface DailyAppointmentsProps {
  dailyAppointments: {
    day: number;
    weekday: string;
    appointments: Array<{
      stripeColor: string;
      time: string;
      patientName: string;
      patientAge: number;
      clinicName: string;
      durationMinutes: string;
    }>;
  };
}
const DailyAppointments: FunctionComponent<DailyAppointmentsProps> = ({
  dailyAppointments,
}) => {
  return (
    <div className="flex">
      <div className="mr-2 flex-none">
        <AppointmentDay
          day={dailyAppointments.day}
          weekday={dailyAppointments.weekday}
        />
      </div>
      <div className="w-full mr-3">
        {dailyAppointments.appointments.map((detail, key) => (
          <div className="mb-4">
            <AppointmentCardDetails
              stripeColor={detail.stripeColor}
              time={detail.time}
              patientName={detail.patientName}
              patientAge={detail.patientAge}
              clinicName={detail.clinicName}
              durationMinutes={detail.durationMinutes}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyAppointments;
