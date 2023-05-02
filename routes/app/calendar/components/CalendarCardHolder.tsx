import { FunctionComponent, h } from "preact";
import CalendarDay from "./CalendarDay.tsx";
import CalendarCardDetails from "./CalendarCardDetails.tsx";

interface CalendarCardHolderProps {
  getCalendarInfoDay: () => {
    dayNumber: number;
    dayShortWord: string;
    cardDetails: Array<{
      stripeColor: string;
      time: string;
      name: string;
      patientAge: number;
      clinicName: string;
      duration: string;
    }>;
  };
}
const CalendarCardHolder: FunctionComponent<CalendarCardHolderProps> = ({
  getCalendarInfoDay,
}) => {
  const calendarInfo = getCalendarInfoDay();

  return (
    <div className="flex">
      <div className="mr-2 flex-none">
        <CalendarDay
          dayNumber={calendarInfo.dayNumber}
          dayShortWord={calendarInfo.dayShortWord}
        />
      </div>
      <div className="w-full mr-3">
        {calendarInfo.cardDetails.map((detail) => (
          <div className="mb-4">
            <CalendarCardDetails
              stripeColor={detail.stripeColor}
              time={detail.time}
              name={detail.name}
              patientAge={detail.patientAge}
              clinicName={detail.clinicName}
              duration={detail.duration}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarCardHolder;
