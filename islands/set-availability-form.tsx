import { useState, useRef } from 'preact/hooks'
import range from '../util/range.ts'
import padLeft from '../util/padLeft.ts'
import { AvailabilityJSON, DayOfWeek, Time, TimeWindow } from '../types.ts'
import PlusIcon from '../components/icons/plus.tsx'
import CopyIcon from '../components/icons/copy.tsx'
import TrashIcon from '../components/icons/trash.tsx'
import set from '../util/set.ts'
import { Ref } from 'preact'

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

function CopyDropDown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='relative inline-block text-left'>
      <div>
        <button
          type='button'
          className='inline-flex w-full justify-center gap-x-1.5 sz-2 ml-2'
          id='menu-button'
          aria-expanded='true'
          aria-haspopup='true'
          onClick={() => setIsOpen(!isOpen)}
        >
          <CopyIcon />
        </button>
      </div>
      {isOpen && (
        <div
          className='absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
          role='menu'
          aria-orientation='vertical'
          aria-labelledby='menu-button'
          tabIndex={-1}
        >
          <div className='py-1' role='none'>
            {/* Active: "bg-gray-100 text-gray-900", Not Active: "text-gray-700" */}
            <a
              href='#'
              className='text-gray-700 block px-4 py-2 text-sm'
              role='menuitem'
              tabIndex={-1}
              id='menu-item-0'
            >
              Account settings
            </a>
            <a
              href='#'
              className='text-gray-700 block px-4 py-2 text-sm'
              role='menuitem'
              tabIndex={-1}
              id='menu-item-1'
            >
              Support
            </a>
            <a
              href='#'
              className='text-gray-700 block px-4 py-2 text-sm'
              role='menuitem'
              tabIndex={-1}
              id='menu-item-2'
            >
              License
            </a>
            <form method='POST' action='#' role='none'>
              <button
                type='submit'
                className='text-gray-700 block w-full px-4 py-2 text-left text-sm'
                role='menuitem'
                tabIndex={-1}
                id='menu-item-3'
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
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
        {
          /* <button type="button" className="sz-2 ml-2" title="copy">
          <CopyIcon />
        </button> */
        }
        {/* <CopyDropDown /> */}
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

function validateNoOverlap(availability: AvailabilityJSON) : AvailabilityJSON | null {
  const overlappingTimes : AvailabilityJSON = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  }
  let doesOverlap = false;

  days.forEach( weekday => {
    for (let i = 0; i < availability[weekday].length; i++)
    {
      const targetTime : TimeWindow = availability[weekday].at(i)!;
      for (let n = 0; n < availability[weekday].length; n++)
      {
        if (n == i) {continue;}
        if (overlaps(targetTime,availability[weekday].at(n)!))
        {
          doesOverlap = true;
          overlappingTimes[weekday].push(targetTime)
        }
      }
    }
  })
  if (doesOverlap){return overlappingTimes;}
  else {return null;}
}

function overlaps(targetTime : TimeWindow, checkedAgainst : TimeWindow) : TimeWindow | null {
  const targetStartTime = timeToMinute(targetTime.start);
  const targetEndTime = timeToMinute(targetTime.end);
  const checkedStartTime = timeToMinute(checkedAgainst.start);
  const checkedEndTime = timeToMinute(checkedAgainst.end);
  if ((targetEndTime > checkedStartTime) && (targetStartTime < checkedEndTime))
  {
    return targetTime;
  }
  return null;

  function timeToMinute(time : Time) : number
  {
    let hour = time.hour;
    if (time.amPm == "pm") {hour += 12;}
    return (hour * 60) + time.minute;
  }
}

function validateForm(event : HTMLFormElement)
{
  const data = new FormData(event);
  const availability : AvailabilityJSON = {
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
  }
  data.forEach((value, key) => {
    const toSet = /^\d+$/g.test(value.toString()) ? parseInt(value.toString()) : value
    set(availability, key, toSet)
  })
  return validateNoOverlap(availability);
}

function OverlapMessage({ overlapTimeSlots }: { overlapTimeSlots: AvailabilityJSON}) {
  const overlapDays = Object.keys(overlapTimeSlots).reduce((acc, cur) => {
    if (overlapTimeSlots[cur as DayOfWeek].length > 1) {
      acc.push(cur as DayOfWeek);
    }
    return acc;
  }, [] as DayOfWeek[])
  return (
    <>
      There are some overlapping time slots on the following days, please update them accordingly: {overlapDays.join(', ')}
    </>
  )
}

function WarningModal({ onConfirm, overlapTimeSlots }: { 
  onConfirm(): void, overlapTimeSlots: AvailabilityJSON | null
}) {
  
  return (
    <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">Time Slots Overlap</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    {
                      overlapTimeSlots != null &&
                      <OverlapMessage overlapTimeSlots={overlapTimeSlots} />
                    }
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button type="button" class="mt-3 inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={onConfirm}>Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SetAvailabilityForm(
  { availability }: { availability: AvailabilityJSON },
) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isShowModal, setIsShowModal] = useState(false);
  const onConfirm = () => setIsShowModal(false);
  const handleValidationFailed = () => setIsShowModal(true);
  const [overlapTimeSlots, setOverlapTimeSlots] = useState<AvailabilityJSON | null>(null);
  let response : AvailabilityJSON | null = null;
  return (
    <form
      method='POST'
      action='/api/set-availability'
      className='container p-1'
      ref={formRef}
      onSubmit={event => {
        event.preventDefault();
        response = validateForm(event.currentTarget)
        if (response == null)
        {
          formRef.current?.submit();
        }
        else 
        {
          handleValidationFailed();
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
      {
        isShowModal && <WarningModal onConfirm={onConfirm} overlapTimeSlots={response} />
      }
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
