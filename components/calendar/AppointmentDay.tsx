import { FunctionComponent } from "preact";

interface AppointmentDayProps {
  dayNumber: number;
  dayShortWord: string;
}

const AppointmentDay: FunctionComponent<AppointmentDayProps> = ({
  dayNumber,
  dayShortWord,
}) => {
  return (
    <div>
      <h1>12</h1>
      <h4>Tue</h4>
    </div>
  );
};
export default AppointmentDay;
