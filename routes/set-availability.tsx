// import { useState } from "preact/hooks";
import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";

const cancel = console.log;

function DayInput({ day }: { day: string }) {
  // const [checked, setChecked] = useState(false);

  return (
    <div>
      <label>
        <input type="checkbox" />
        {day}
        <Counter start={0} />
      </label>
    </div>
  );
}

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function SetAvailability() {
  return (
    <form method="POST" action="/api/set-availability">
      <div>
        {days.map((day) => <DayInput key={day} day={day} />)}
      </div>
      <button onClick={cancel}>
        Cancel
      </button>
      <button type="submit">
        Save
      </button>
    </form>
  );
}

export default function SetAvailabilityPage() {
  // return (
  //   <div>
  //     <nav>
  //       <a href="/">←</a>Availability
  //     </nav>
  //     <SetAvailability />
  //   </div>
  // );
  return (
    <>
      <title>Fresh App</title>
      <div>
        <img
          src="/logo.svg"
          width="128"
          height="128"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p>
          Welcome to `fresh`. Try updating this message in the
          ./routes/index.tsx file, and refresh.
        </p>
        <Counter start={3} />
      </div>
    </>
  );
}
