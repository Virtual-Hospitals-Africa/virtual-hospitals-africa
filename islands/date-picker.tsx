import { FunctionalComponent, h } from "preact";

interface Props {
  currentDay: number;
  currentMonth: number;
  currentYear: number;
  days: number[];
}

const DatePicker: FunctionalComponent<Props> = ({
  currentDay,
  currentMonth,
  currentYear,
  days,
}) => {
  const currentDate = currentDay;
  const handleDateClick = (selectedDay: number) => {
    let newDay = currentDay;
    let newMonth = currentMonth;
    let newYear = currentYear;

    // check if we're decrementing a month
    if (selectedDay - currentDay > 20) {
      newMonth -= 1;
      // check to see if we're decrementing a year
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      // check if we're incrementing a month
    } else if (currentDay - selectedDay > 20) {
      newMonth += 1;
      // check to see if we're incrementing a year
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      // if neither, just change the day
    }
    newDay = selectedDay;
    const newDayString = newDay.toString().padStart(2, "0");
    const newMonthString = newMonth.toString().padStart(2, "0");
    const url =
      `/app/calendar?startday=${newYear}-${newMonthString}-${newDayString}`;
    history.pushState({}, "", url);
    window.location.reload();
  };

  const previousWeek = (day: number) => {
    const now = new Date();
    now.setDate(day - 4); // subtract 7 days from the selected day
    const dateString = now.toISOString().slice(0, 10);
    const url = `/app/calendar?startday=${dateString}`;

    history.pushState({}, "", url);
    window.location.reload();
  };

  const nextWeek = (day: number) => {
    const now = new Date();
    now.setDate(day + 4);
    const dateString = now.toISOString().slice(0, 10);
    const url = `/app/calendar?startday=${dateString}`;

    history.pushState({}, "", url);
    window.location.reload();
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
