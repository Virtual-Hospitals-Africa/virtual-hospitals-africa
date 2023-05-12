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
    <div className="flex justify-between items-center px-4">
      <button
        className="font-bold text-2xl text-gray-400"
        onClick={() => previousWeek(days[0])}
      >
        {"<"}
      </button>
      <div className="w-10"></div>
      <div className="flex justify-between flex-grow">
        {days.map((day, index) => {
          return (
            <button
              key={index}
              className={`text-bold text-lg cursor-pointer rounded-full w-10 h-10 ${
                day === currentDay
                  ? "bg-blue-700 text-white"
                  : "bg-white text-black"
              }`}
              onClick={() => handleDateClick(day)}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="w-10"></div>
      <button
        className="font-bold text-2xl text-gray-400"
        onClick={() => nextWeek(days[days.length - 1])}
      >
        {">"}
      </button>
    </div>
  );
};

export default DatePicker;
