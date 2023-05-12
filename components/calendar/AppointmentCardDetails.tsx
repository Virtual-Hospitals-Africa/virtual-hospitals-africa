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
    <div className="relative flex border border-gray-300 rounded shadow-lg overflow-hidden">
      <div className={`w-6 h-full ${stripeColor} absolute`}></div>
      <div className="pl-10 p-2 space-y-1">
        <div className="font-semibold text-lg">{time}</div>
        <div className="font-semibold text-base">{patientName}</div>
        <div className="text-base">Age: {patientAge}</div>
        <div className="text-base pb-8">{clinicName}</div>
      </div>
      <div className="px-1 absolute text-green-900 font-bold bg-green-100 top-2 right-2 text-base font-semibold">
        {durationMinutes}
      </div>
      <div className="absolute bottom-6 right-3 text-lg bg-green-600 text-white py-2 px-6 rounded shadow-lg font-normal mb-2">
        VIEW
      </div>
    </div>
  );
};

export default AppointmentCardDetails;
