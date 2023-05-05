import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";

interface Props {
  selectedMonth: number;
}

const MonthPicker: FunctionalComponent<Props> = ({ selectedMonth }) => {
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
    setCurrentMonth(newMonth);
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
