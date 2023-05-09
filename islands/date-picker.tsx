import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";

interface Props {
  selectedDate: number;
  days: number[];
}

const DatePicker: FunctionalComponent<Props> = ({
  selectedDate,
  days,
}) => {
  const [currentDate] = useState(selectedDate);
  const handleDateClick = (day: number) => {
    const now = new Date();
    now.setDate(day); // set the day of the month to the selected day
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
    const url = `/app/calendar?startday=${dateString}`;
    window.location.href = url;
  };

  const previousWeek = (day: number) => {
    const now = new Date();
    now.setDate(day - 7); // subtract 7 days from the selected day
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
    const url = `/app/calendar?startday=${dateString}`;
    window.location.href = url;
  };

  const nextWeek = (day: number) => {
    const now = new Date();
    now.setDate(day + 1); // add 1 day to the selected day
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
    const url = `/app/calendar?startday=${dateString}`;
    window.location.href = url;
  };

  return (
    <div className="calendar-toolbar">
      <button
        style={{ marginRight: "10px" }}
        onClick={() => previousWeek(days[0])}
      >
        {"<"}
      </button>

      {days.map((day, index) => {
        return (
          <button
            key={index}
            style={{
              margin: "0 40px",
              backgroundColor: day === currentDate ? "#007aff" : "#fff",
              color: day === currentDate ? "#fff" : "#000",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontWeight: "bold",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
            onClick={() => handleDateClick(day)}
          >
            {day}
          </button>
        );
      })}
      <button
        style={{ marginRight: "10px" }}
        onClick={() => nextWeek(days[days.length - 1])}
      >
        {">"}
      </button>
    </div>
  );
};

export default DatePicker;
