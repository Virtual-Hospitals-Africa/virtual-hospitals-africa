import { FunctionComponent, h } from "preact";
import AppointmentDay from "./AppointmentDay.tsx";
import AppointmentCardDetails from "./AppointmentCardDetails.tsx";

interface DailyAppointmentsProps {
  dailyAppointments: {
    dayNumber: number;
    dayShortWord: string;
    appointments: Array<{
      stripeColor: string;
      time: string;
      name: string;
      patientAge: number;
      clinicName: string;
      duration: string;
    }>;
  };
}
const DailyAppointments: FunctionComponent<DailyAppointmentsProps> = ({
  dailyAppointments,
}) => {
  const calendarInfo = dailyAppointments;

  return (
    <div className="flex">
      <div className="mr-2 flex-none">
        <AppointmentDay
          dayNumber={calendarInfo.dayNumber}
          dayShortWord={calendarInfo.dayShortWord}
        />
      </div>
      <div className="w-full mr-3">
        {calendarInfo.appointments.map((detail, key) => (
          <div className="mb-4">
            <AppointmentCardDetails
              stripeColor={detail.stripeColor}
              time={detail.time}
              name={detail.name}
              patientAge={detail.patientAge}
              clinicName={detail.clinicName}
              duration={detail.duration}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyAppointments;
