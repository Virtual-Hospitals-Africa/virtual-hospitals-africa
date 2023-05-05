import { FunctionalComponent, h } from "preact";
import { useState } from "preact/hooks";

interface Props {
  selectedDate: Date;
  days: Date[];
  handlePrevWeekClick: () => void;
  handleNextWeekClick: () => void;
}

const DatePicker: FunctionalComponent<Props> = ({
  selectedDate,
  days,
  handlePrevWeekClick,
  handleNextWeekClick,
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);

  const handleDateClick = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <>
      <div class="calendar-toolbar">
        <button
          style={{ marginRight: "10px" }}
          onClick={handlePrevWeekClick}
        >
          {"<"}
        </button>
        {days.map((day, index) => (
          <button
            key={index}
            style={{
              margin: "0 40px",
              backgroundColor: day.getDate() === selectedDate.getDate() ? "#007aff" : "#fff",
              color: day.getDate() === selectedDate.getDate() ? "#fff" : "#000",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              fontWeight: "bold",
              fontSize: "1.2rem",
              cursor: "pointer"
            }}
            onClick={() => handleDateClick(day)}
          >
            {day.getDate()}
          </button>
        ))}
        <button
          style={{ marginLeft: "10px" }}
          onClick={handleNextWeekClick}
        >
          {">"}
        </button>
      </div>
    </>
  );
};

export default DatePicker;
