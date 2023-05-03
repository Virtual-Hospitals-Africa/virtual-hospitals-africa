import { FunctionComponent, h } from "preact";

interface AppointmentCardProps {
  stripeColor: string;
  time: string;
  patientName: string;
  patientAge: number;
  clinicName: string;
  durationMinutes: string;
}

const AppointmentCardDetails: FunctionComponent<AppointmentCardProps> = ({
  stripeColor,
  time,
  patientName,
  patientAge,
  clinicName,
  durationMinutes,
}) => {
  return (
    <div className="flex border border-gray-300 rounded p-2 relative shadow-lg">
      <div className={`w-6 h-max ${stripeColor} rounded-l`}></div>
      <div className="pl-4">
        <div className="font-semibold text-lg">{time}</div>
        <div className="font-semibold text-base">{patientName}</div>
        <div className="text-base">Age: {patientAge}</div>
        <div className="text-base">{clinicName}</div>
      </div>
      <div className="absolute bg-blue-100 top-0 right-0 mt-2 mr-2 text-base font-semibold">
        {durationMinutes}
      </div>
    </div>
  );
};

export default AppointmentCardDetails;
