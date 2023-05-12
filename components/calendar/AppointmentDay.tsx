import { FunctionComponent } from "preact";

interface AppointmentDayProps {
  day: number;
  weekday: string;
}

const AppointmentDay: FunctionComponent<AppointmentDayProps> = ({
  day,
  weekday,
}) => {
  return (
    <div className={"flex flex-col items-center px-5 pt-3"}>
      <p className={"font-semibold text-indigo-800 text-3xl"}>
        {day}
      </p>
      <p className={"text-base mt-[-4]"}>{weekday}</p>
    </div>
  );
};
export default AppointmentDay;
