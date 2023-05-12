import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";

interface Props {
  currentDay: number;
  currentYear: number;
  selectedMonth: number;
}

const MonthPicker: FunctionalComponent<Props> = (
  { selectedMonth, currentDay, currentYear },
) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);

  const handleMonthChange = (event: Event) => {
    const newMonth = parseInt((event.target as HTMLSelectElement).value);
    const newDayString = currentDay.toString().padStart(2, "0");
    // add one because the actual month list starts from 1, not 0
    const newMonthString = (newMonth + 1).toString().padStart(2, "0");
    const newYearString = currentYear.toString();
    setCurrentMonth(newMonth);
    const url =
      `/app/calendar?startday=${newYearString}-${newMonthString}-${newDayString}`;
    history.pushState({}, "", url);
    window.location.reload();
  };

  return (
    <div className="month-picker" style={{ textAlign: "center" }}>
      <select value={currentMonth} onChange={handleMonthChange}>
        {months.map((month, index) => (
          <option value={index} key={index}>
            {month}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthPicker;
