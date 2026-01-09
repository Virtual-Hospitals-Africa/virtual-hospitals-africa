import { useState } from 'preact/hooks'
import { padTime } from '../util/pad.ts'
import { AvailabilityJSON, Time, TimeWindow } from '../types.ts'
import WarningModal from '../components/library/modals/Warning.tsx'
import FormButtons from './form/buttons.tsx'
import {
  days,
  defaultTimeWindow,
  findDaysWithOverlap,
  hours,
  minutes,
} from '../backend/scheduling/availability.tsx'
import Form from '../components/library/Form.tsx'
import {
  PlusIcon,
  TrashIcon,
} from '../components/library/icons/heroicons/outline.tsx'

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
  { prefix, time_window, addTimeWindow, removeTimeWindow }: {
    prefix: string
    time_window: TimeWindow
    addTimeWindow(time_window: TimeWindow): void
    removeTimeWindow?(): void
  },
) {
  return (
    <div className='flex justify-between'>
      <div>
        <HourInput
          name={`${prefix}.start.hour`}
          current={time_window.start.hour}
        />
        :
        <MinuteInput
          name={`${prefix}.start.minute`}
          current={time_window.start.minute || 0}
        />
        <AmPmInput
          name={`${prefix}.start.am_pm`}
          current={time_window.start.am_pm}
        />
        —
        <HourInput name={`${prefix}.end.hour`} current={time_window.end.hour} />
        :
        <MinuteInput
          name={`${prefix}.end.minute`}
          current={time_window.end.minute || 0}
        />
        <AmPmInput
          name={`${prefix}.end.am_pm`}
          current={time_window.end.am_pm}
        />
      </div>
      <div className='flex items-center'>
        <button
          type='button'
          className='ml-2 sz-2'
          title='add'
          onClick={() => {
            const nextEndTime: Time = time_window.end.hour === 12
              ? {
                hour: 1,
                minute: time_window.end.minute,
                am_pm: time_window.end.am_pm === 'am' ? 'pm' : 'am',
              }
              : {
                hour: (time_window.end.hour + 1) as Time['hour'],
                minute: time_window.end.minute,
                am_pm: time_window.end.am_pm,
              }

            addTimeWindow({
              start: time_window.end,
              end: nextEndTime,
            })
          }}
        >
          <PlusIcon />
        </button>
        {removeTimeWindow && (
          <button
            type='button'
            className='ml-2 sz-2'
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
  { day, time_windows: initialTimeWindows }: {
    day: string
    time_windows: TimeWindow[]
  },
) {
  const [checked, setChecked] = useState(!!initialTimeWindows.length)
  const [time_windows, setTimeWindows] = useState(
    initialTimeWindows.length ? initialTimeWindows : [defaultTimeWindow],
  )

  const addTimeWindow = (time_window: TimeWindow) =>
    setTimeWindows([...time_windows, time_window])

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
      <div className='flex-col gap-8 pt-4 text-sm leading-6 text-gray-700'>
        {checked
          ? (
            time_windows.map((
              time_window,
              i,
            ) => (
              <TimeInput
                key={i}
                prefix={`${day}.${i}`}
                time_window={time_window}
                addTimeWindow={addTimeWindow}
                removeTimeWindow={() => {
                  if (i === 0 && time_windows.length === 1) {
                    return setChecked(false)
                  }
                  const new_time_windows = [...time_windows]
                  new_time_windows.splice(i, 1)
                  setTimeWindows(new_time_windows)
                }}
              />
            ))
          )
          : <span className='ml-3 text-gray-400'>Unavailable</span>}
      </div>
    </>
  )
}

export default function AvailabilityForm(
  { availability }: { availability: AvailabilityJSON },
) {
  const [overlappingDays, setOverlappingDays] = useState<string[]>([])

  return (
    <Form
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
        className='grid gap-4 px-0 py-6 divide-y divide-gray-100'
        style={{
          gridTemplateColumns: 'max-content 1fr',
        }}
      >
        {days.map((day) => (
          <DayInput key={day} day={day} time_windows={availability[day]} />
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
    </Form>
  )
}
