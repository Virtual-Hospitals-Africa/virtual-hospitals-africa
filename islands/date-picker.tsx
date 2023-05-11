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
    const dateString = now.toISOString().slice(0, 10); // get the date string in yyyy-mm-dd format
    let url = `/app/calendar?startday=${dateString}`;

    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0]);
    const month = parseInt(dateParts[1]);
    const cur_day = parseInt(dateParts[2]);
    if (cur_day < selectedDate && cur_day <= 7) {
      const newMonth = month + 1;
      const newMonthString = newMonth.toString().padStart(2, "0");
      const newDayString = day.toString().padStart(2, "0");
      url = `/app/calendar?startday=${year}-${newMonthString}-${newDayString}`;
    }
    history.pushState({}, "", url);
    window.location.reload();
  };

  const previousWeek = (day: number) => {
    const now = new Date();
    now.setDate(day - 4); // subtract 7 days from the selected day
    const dateString = now.toISOString().slice(0, 10);
    let url = `/app/calendar?startday=${dateString}`;

    // const dateParts = dateString.split("-");
    // const year = parseInt(dateParts[0]);
    // const month = parseInt(dateParts[1]);
    // const cur_day = parseInt(dateParts[2]);
    // if (cur_day > selectedDate && cur_day >= 21) {
    //   const newMonth = month - 1;
    //   const newMonthString = newMonth.toString().padStart(2, "0");
    //   url = `/app/calendar?startday=${year}-${newMonthString}-${day}`;
    // }

    history.pushState({}, "", url);
    window.location.reload();
  };

  const nextWeek = (day: number) => {
    const now = new Date();
    now.setDate(day + 4);
    const dateString = now.toISOString().slice(0, 10);
    let url = `/app/calendar?startday=${dateString}`;

    // const dateParts = dateString.split("-");
    // const year = parseInt(dateParts[0]);
    // const month = parseInt(dateParts[1]);
    // const cur_day = parseInt(dateParts[2]);
    // if (cur_day < selectedDate && cur_day <= 7) {
    //   const newMonth = month + 1;
    //   const newMonthString = newMonth.toString().padStart(2, "0");
    //   url = `/app/calendar?startday=${year}-${newMonthString}-${day}`;
    // }
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
