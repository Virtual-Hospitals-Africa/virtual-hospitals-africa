import { FunctionComponent } from "preact";

interface CalendarDayProps {
  dayNumber: number;
  dayShortWord: string;
}

const CalendarDay: FunctionComponent<CalendarDayProps> = ({
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
export default CalendarDay;
