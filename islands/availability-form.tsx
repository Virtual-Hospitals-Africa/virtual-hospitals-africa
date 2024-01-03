import { useState } from 'preact/hooks'
import { padTime } from '../util/pad.ts'
import { AvailabilityJSON, Time, TimeWindow } from '../types.ts'
import PlusIcon from '../components/library/icons/plus.tsx'
import TrashIcon from '../components/library/icons/trash.tsx'
import WarningModal from '../components/library/modals/Warning.tsx'
import FormButtons from '../components/library/form/buttons.tsx'
import {
  days,
  defaultTimeWindow,
  findDaysWithOverlap,
  hours,
  minutes,
} from '../shared/scheduling/availability.tsx'

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
          {padTime(minute)}
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

export default function AvailabilityForm(
  { availability }: { availability: AvailabilityJSON },
) {
  const [overlappingDays, setOverlappingDays] = useState<string[]>([])

  return (
    <form
      method='POST'
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
        className='py-6 grid gap-4 px-0 divide-y divide-gray-100'
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
            title='Time Slots Overlap'
            onConfirm={() => setOverlappingDays([])}
            message={`There are some overlapping time slots on the following days, please update them accordingly: ${
              overlappingDays.join(', ')
            }`}
          />
        )
        : null}
      <FormButtons />
    </form>
  )
}
