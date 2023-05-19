import { FunctionComponent, h } from "preact";
import AppointmentDay from "./AppointmentDay.tsx";
import AppointmentCardDetails from "./AppointmentCardDetails.tsx";
import { DoctorAppointment } from "../../types.ts";

interface DailyAppointmentsProps {
  dailyAppointments: DoctorAppointment[];
}

const DailyAppointments: FunctionComponent<DailyAppointmentsProps> = ({
  dailyAppointments,
}) => {
  return (
    <div>
      {dailyAppointments.map((dailyAppointment) => (
        <div className="flex">
          <div className="mr-2 flex-none">
            <AppointmentDay
              day={dailyAppointment.day}
              weekday={dailyAppointment.weekday}
            />
          </div>
          <div className="w-full mr-3">
            {dailyAppointment.appointments.map((detail, key) => (
              <div className="mb-4">
                <AppointmentCardDetails
                  stripeColor={detail.stripeColor}
                  time={detail.time}
                  patientName={detail.patientName}
                  patientAge={detail.patientAge}
                  clinicName={detail.clinicName}
                  durationMinutes={detail.durationMinutes}
                  status={detail.status}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DailyAppointments;
