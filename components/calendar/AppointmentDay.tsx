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
      <h1>12</h1>
      <h4>Tue</h4>
    </div>
  );
};
export default AppointmentDay;
