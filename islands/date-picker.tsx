import { FunctionalComponent, h } from "preact";

interface Props {
  selectedDate: number;
  days: number[];
}

const lastDaysOfMonth: { [month: number]: number } = {
  0: 31, // January
  1: 28, // February
  2: 31, // March
  3: 30, // April
  4: 31, // May
  5: 30, // June
  6: 31, // July
  7: 31, // August
  8: 30, // September
  9: 31, // October
  10: 30, // November
  11: 31, // December
};

const DatePicker: FunctionalComponent<Props> = ({
  selectedDate,
  days,
}) => {
  const currentDate = selectedDate;
  const handleDateClick = (day: number) => {
    const now = new Date();
    now.setDate(day); // set the day of the month to the selected day
    const selectedMonth = now.getMonth();
    const selectedYear = now.getFullYear();
    const selectedDate = now.getDate();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentDate = new Date().getDate();
  
    // If selected date is smaller than current date, add 1 to month
    if (selectedYear < currentYear || (selectedYear === currentYear && selectedMonth < currentMonth) || (selectedYear === currentYear && selectedMonth === currentMonth && selectedDate < currentDate)) {
      now.setMonth(selectedMonth + 1);
    }
  
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
    const date = parseInt(dateString.split("-")[2]);
    const url = `/app/calendar?startday=${dateString}`;
    history.pushState({}, "", url);
    window.location.reload();
  };
  
  const previousWeek = (day: number) => {
    const now = new Date();
    now.setDate(day - 4); // subtract 7 days from the selected day
    // if (now > new Date()) {
    //   now.setMonth(now.getMonth() - 1); // add 1 month if selected date is before current date
    // }
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
    const url = `/app/calendar?startday=${dateString}`;
    history.pushState({}, "", url);
    window.location.reload();
  };

  const nextWeek = (day: number) => {
    const now = new Date();
    now.setDate(day + 4); // add 1 day to the selected day
    if (now < new Date()) {
      now.setMonth(now.getMonth() + 1); // add 1 month if selected date is before current date
    }
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
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
