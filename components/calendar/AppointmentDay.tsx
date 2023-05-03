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
    <div>
      <h1>{day}</h1>
      <h4>{weekday}</h4>
    </div>
  );
};
export default AppointmentDay;
