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
      <div className="pl-10 p-3 space-y-2">
        <div className="font-semibold text-2xl text-green-700">{time}</div>
        <div className="font-semibold text-xl">{patientName}</div>
        <div className="text-xl text-gray-500">
          Age: {patientAge}
        </div>
        <div className="text-xl pb-8 text-gray-500">
          {clinicName}
        </div>
      </div>
      <div className="px-1 absolute text-green-700 font-bold text-lg bg-blue-50 top-2 right-2">
        {durationMinutes}
      </div>
      <div className="cursor-pointer absolute bottom-6 right-3 text-lg bg-green-600 text-white py-3 px-6 rounded shadow-lg font-normal mb-2">
        VIEW
      </div>
    </div>
  );
};

export default AppointmentCardDetails;
