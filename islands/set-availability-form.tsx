import { useState } from "preact/hooks";
import range from "../src/lodash/range.ts";
import padLeft from "../src/lodash/padLeft.ts";
import { AvailabilityJSON, DayOfWeek, TimeWindow } from "../src/types.ts";

const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const minutes = range(0, 60, 5);

function HourInput({ name, current }: { name: string; current: number }) {
  return (
    <select name={name}>
      {hours.map((hour) => (
        <option
          value={hour}
          selected={hour === current}
          className="text-right"
        >
          {hour}
        </option>
      ))}
    </select>
  );
}

function MinuteInput({ name, current }: { name: string; current: number }) {
  return (
    <select name={name}>
      {minutes.map((minute) => (
        <option
          value={minute}
          selected={minute === current}
          className="text-right"
        >
          {padLeft(String(minute), 2, "0")}
        </option>
      ))}
    </select>
  );
}

function AmPmInput({ name, current }: { name: string; current: "am" | "pm" }) {
  return (
    <select name={name}>
      <option value="am" selected={"am" === current}>
        am
      </option>
      <option value="pm" selected={"pm" === current}>
        pm
      </option>
    </select>
  );
}

function TimeInput(
  { prefix, timeWindow }: { prefix: string; timeWindow: TimeWindow },
) {
  return (
    <>
      <HourInput
        name={`${prefix}.start.hour`}
        current={timeWindow.start.hour}
      />
      :
      <MinuteInput
        name={`${prefix}.start.minute`}
        current={timeWindow.start.minute}
      />
      <AmPmInput
        name={`${prefix}.start.ampm`}
        current={timeWindow.start.amPm}
      />
      —
      <HourInput name={`${prefix}.end.hour`} current={timeWindow.end.hour} />
      :
      <MinuteInput
        name={`${prefix}.end.minute`}
        current={timeWindow.end.minute}
      />
      <AmPmInput
        name={`${prefix}.end.ampm`}
        current={timeWindow.end.amPm}
      />
    </>
  );
}

function DayInput(
  { day, timeWindows }: { day: string; timeWindows: TimeWindow[] },
) {
  const [checked, setChecked] = useState(!!timeWindows.length);

  return (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      {day}
      {checked && (
        timeWindows.map((timeWindow, i) => (
          <TimeInput
            key={i}
            prefix={`${day}.${i}`}
            timeWindow={timeWindow}
          />
        ))
      )}
    </label>
  );
}

const days: Array<DayOfWeek> = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function SetAvailabilityForm(
  { availability }: { availability: AvailabilityJSON },
) {
  return (
    <form method="POST" action="/api/set-availability">
      <div className="flex flex-col space-y-4">
        {days.map((day) => (
          <DayInput key={day} day={day} timeWindows={availability[day]} />
        ))}
      </div>
      <button onClick={() => console.log("cancel")}>
        Cancel
      </button>
      <button type="submit">
        Save
      </button>
    </form>
  );
}
