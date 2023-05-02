import { FunctionComponent, h } from "preact";

interface AppointmentCardProps {
  stripeColor: string;
  time: string;
  name: string;
  patientAge: number;
  clinicName: string;
  duration: string;
}

const AppointmentCardDetails: FunctionComponent<AppointmentCardProps> = ({
  stripeColor,
  time,
  name,
  patientAge,
  clinicName,
  duration,
}) => {
  return (
    <div className="flex border border-gray-300 rounded p-2 relative shadow-lg">
      <div className={`w-6 h-max ${stripeColor} rounded-l`}></div>
      <div className="pl-4">
        <div className="font-semibold text-lg">{time}</div>
        <div className="font-semibold text-base">{name}</div>
        <div className="text-base">Age: {patientAge}</div>
        <div className="text-base">{clinicName}</div>
      </div>
      <div className="absolute bg-blue-100 top-0 right-0 mt-2 mr-2 text-base font-semibold">
        {duration}
      </div>
    </div>
  );
};

export default AppointmentCardDetails;
