import { useState } from 'preact/hooks'
import range from '../util/range.ts'
import padLeft from '../util/padLeft.ts'
import { AvailabilityJSON, DayOfWeek, Time, TimeWindow } from '../types.ts'
import PlusIcon from '../components/icons/plus.tsx'
import TrashIcon from '../components/icons/trash.tsx'
import WarningModal from '../components/modals/Warning.tsx'
import parseAvailabilityForm from '../util/parseAvailabilityForm.ts'
import timeToMin from '../util/timeToMin.ts'

const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
const minutes = range(0, 60, 5)

function HourInput({ name, current }: { name: string; current: number }) {
  return (
    <select name={name}>
      {hours.map((hour) => (
        <option
          value={hour}
          selected={hour === current}
          className='text-right'
        >
          {hour}
        </option>
      ))}
    </select>
  )
}

function MinuteInput({ name, current }: { name: string; current: number }) {
  return (
    <select name={name}>
      {minutes.map((minute) => (
        <option
          value={minute}
          selected={minute === current}
          className='text-right'
        >
          {padLeft(String(minute), 2, '0')}
        </option>
      ))}
    </select>
  )
}

function AmPmInput({ name, current }: { name: string; current: 'am' | 'pm' }) {
  return (
    <select name={name}>
      <option value='am' selected={'am' === current}>am</option>
      <option value='pm' selected={'pm' === current}>pm</option>
    </select>
  )
}

function TimeInput(
  { prefix, timeWindow, addTimeWindow, removeTimeWindow }: {
    prefix: string
    timeWindow: TimeWindow
    addTimeWindow(timeWindow: TimeWindow): void
    removeTimeWindow?(): void
  },
) {
  return (
    <div className='flex justify-between'>
      <div>
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
          name={`${prefix}.start.amPm`}
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
          name={`${prefix}.end.amPm`}
          current={timeWindow.end.amPm}
        />
      </div>
      <div className='flex items-center'>
        <button
          type='button'
          className='sz-2 ml-2'
          title='add'
          onClick={() => {
            const nextEndTime: Time = timeWindow.end.hour === 12
              ? {
                hour: 1,
                minute: timeWindow.end.minute,
                amPm: timeWindow.end.amPm === 'am' ? 'pm' : 'am',
              }
              : {
                hour: (timeWindow.end.hour + 1) as Time['hour'],
                minute: timeWindow.end.minute,
                amPm: timeWindow.end.amPm,
              }

            addTimeWindow({
              start: timeWindow.end,
              end: nextEndTime,
            })
          }}
        >
          <PlusIcon />
        </button>
        {removeTimeWindow && (
          <button
            type='button'
            className='sz-2 ml-2'
            title='remove'
            onClick={removeTimeWindow}
          >
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  )
}

const defaultTimeWindow: TimeWindow = {
  start: { hour: 9, minute: 0, amPm: 'am' },
  end: { hour: 5, minute: 0, amPm: 'pm' },
}

function DayInput(
  { day, timeWindows: initialTimeWindows }: {
    day: string
    timeWindows: TimeWindow[]
  },
) {
  const [checked, setChecked] = useState(!!initialTimeWindows.length)
  const [timeWindows, setTimeWindows] = useState(
    initialTimeWindows.length ? initialTimeWindows : [defaultTimeWindow],
  )

  const addTimeWindow = (timeWindow: TimeWindow) =>
    setTimeWindows([...timeWindows, timeWindow])

  return (
    <>
      <div className='pt-4 text-sm font-medium leading-6 text-gray-900 w-max'>
        <label className='flex gap-1'>
          <input
            type='checkbox'
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          {day.slice(0, 3)}
        </label>
      </div>
      <div className='pt-4 text-sm leading-6 text-gray-700 flex-col gap-8'>
        {checked
          ? (
            timeWindows.map((
              timeWindow,
              i,
            ) => (
              <TimeInput
                key={i}
                prefix={`${day}.${i}`}
                timeWindow={timeWindow}
                addTimeWindow={addTimeWindow}
                removeTimeWindow={() => {
                  if (i === 0 && timeWindows.length === 1) {
                    return setChecked(false)
                  }
                  const newTimeWindows = [...timeWindows]
                  newTimeWindows.splice(i, 1)
                  setTimeWindows(newTimeWindows)
                }}
              />
            ))
          )
          : <span className='text-gray-400 ml-3'>Unavailable</span>}
      </div>
    </>
  )
}

const days: Array<DayOfWeek> = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export function overlaps(
  timeWindow: TimeWindow,
  otherTimeWindow: TimeWindow,
): boolean {
  console.log(timeWindow, otherTimeWindow)

  return (timeToMin(timeWindow.end) > timeToMin(otherTimeWindow.start)) &&
    (timeToMin(timeWindow.start) < timeToMin(timeWindow.end))
}

export function windowsOverlap(timeWindows: TimeWindow[]): boolean {
  if (timeWindows.length <= 1) return false
  const [timeWindow, ...rest] = timeWindows
  if (rest.some((otherTimeWindow) => overlaps(timeWindow, otherTimeWindow))) {
    return true
  }
  return windowsOverlap(rest)
}

function findDaysWithOverlap(event: HTMLFormElement) {
  const data = new FormData(event)
  const availability = parseAvailabilityForm(data)
  return Object.keys(availability).filter((day) =>
    windowsOverlap(availability[day as DayOfWeek])
  )
}

export default function SetAvailabilityForm(
  { availability }: { availability: AvailabilityJSON },
) {
  const [overlappingDays, setOverlappingDays] = useState<string[]>([])

  return (
    <form
      method='POST'
      action='/api/set-availability'
      className='container p-1'
      onSubmit={(event) => {
        const overlapping = findDaysWithOverlap(event.currentTarget)
        setOverlappingDays(overlapping)

        if (overlapping.length) {
          event.preventDefault()
        }
      }}
    >
      <div
        className='px-4 py-6 grid gap-4 px-0 divide-y divide-gray-100'
        style={{
          gridTemplateColumns: 'max-content 1fr',
        }}
      >
        {days.map((day) => (
          <DayInput key={day} day={day} timeWindows={availability[day]} />
        ))}
      </div>
      {overlappingDays.length
        ? (
          <WarningModal
            onConfirm={() => setOverlappingDays([])}
            message={`There are some overlapping time slots on the following days, please update them accordingly: ${
              overlappingDays.join(', ')
            }`}
          />
        )
        : null}
      <div className='container grid gap-x-2 grid-cols-2'>
        <button
          type='button'
          className='rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
          onClick={() => window.history.back()}
        >
          Cancel
        </button>
        <button
          type='submit'
          className='rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
        >
          Save
        </button>
      </div>
    </form>
  )
}
