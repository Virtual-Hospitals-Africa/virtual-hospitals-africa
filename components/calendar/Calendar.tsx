import { ChevronLeftIcon, ChevronRightIcon } from '../library/icons/heroicons/outline.tsx'
import cls from '../../util/cls.ts'
import { monthName, numberOfDaysInMonth } from '../../util/date.ts'
import range from '../../util/range.ts'
import { padTime } from '../../util/pad.ts'
import { MonthNum } from '../../types.ts'
import { ComponentChildren } from 'preact'

type CalendarDayProps = {
  date: string
  isCurrentMonth?: boolean
  isToday?: boolean
  isSelected?: boolean
}

function daysToShow(
  { day, today }: { day: string; today: string },
): CalendarDayProps[] {
  const toShow = (date: string) => ({
    date,
    isToday: date === today,
    isSelected: date === day,
  })

  const [yearInt, monthInt] = day.split('-').map((n) => parseInt(n, 10))

  const last_month_int = monthInt === 1 ? 12 : monthInt - 1
  const last_month_year_int = monthInt === 1 ? yearInt - 1 : yearInt

  const next_month_int = monthInt === 12 ? 1 : monthInt + 1
  const next_month_year_int = monthInt === 12 ? yearInt + 1 : yearInt

  const total_days_in_this_month = numberOfDaysInMonth(monthInt, yearInt)

  const days_of_this_month: CalendarDayProps[] = range(
    1,
    total_days_in_this_month + 1,
  )
    .map((d) => {
      const date = `${yearInt}-${padTime(monthInt)}-${padTime(d)}`
      return {
        isCurrentMonth: true,
        ...toShow(date),
      }
    })

  const first_day_of_this_month = new Date(`${yearInt}-${padTime(monthInt)}-01`)
  const first_week_days_of_last_month = first_day_of_this_month.getDay()

  const last_day_of_this_month = new Date(
    `${yearInt}-${padTime(monthInt)}-${total_days_in_this_month}`,
  )
  const last_week_days_of_next_month = 6 - last_day_of_this_month.getDay()

  const total_days_in_last_month = numberOfDaysInMonth(
    last_month_int,
    last_month_year_int,
  )

  const days_of_last_month: CalendarDayProps[] = range(
    total_days_in_last_month - first_week_days_of_last_month + 1,
    total_days_in_last_month + 1,
  ).map((dayInt) => {
    const date = `${last_month_year_int}-${padTime(last_month_int)}-${padTime(dayInt)}`
    return toShow(date)
  })

  const days_of_next_month: CalendarDayProps[] = range(
    1,
    last_week_days_of_next_month + 1,
  ).map((dayInt) => {
    const date = `${next_month_year_int}-${padTime(next_month_int)}-${padTime(dayInt)}`
    return toShow(date)
  })

  return [
    ...days_of_last_month,
    ...days_of_this_month,
    ...days_of_next_month,
  ]
}

export default function Calendar(
  { day, today, url, children }: {
    day: string
    today: string
    url: URL
    children?: ComponentChildren
  },
) {
  const [yearInt, monthInt] = day.split('-').map((n) => parseInt(n, 10))
  const days = daysToShow({ day, today })

  const last_month_int = monthInt === 1 ? 12 : monthInt - 1
  const last_month_year_int = monthInt === 1 ? yearInt - 1 : yearInt
  const total_days_in_last_month = numberOfDaysInMonth(
    last_month_int,
    last_month_year_int,
  )
  const last_day_of_last_month = `${last_month_year_int}-${padTime(last_month_int)}-${total_days_in_last_month}`

  const next_month_int = monthInt === 12 ? 1 : monthInt + 1
  const next_month_year_int = monthInt === 12 ? yearInt + 1 : yearInt
  const first_day_of_next_month = `${next_month_year_int}-${padTime(next_month_int)}-01`

  return (
    <div className='text-center lg:col-start-8 lg:col-end-13 lg:mt-9 xl:col-start-9'>
      <div className='flex items-center text-gray-900'>
        <a
          type='button'
          className='-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500'
          href={`${url.pathname}?day=${last_day_of_last_month}`}
        >
          <span className='sr-only'>Previous month</span>
          <ChevronLeftIcon className='h-5 w-5' aria-hidden='true' />
        </a>
        <div className='flex-auto text-sm font-semibold'>
          {monthName(monthInt as MonthNum)}
        </div>
        <a
          type='button'
          className='-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500'
          href={`${url.pathname}?day=${first_day_of_next_month}`}
        >
          <span className='sr-only'>Next month</span>
          <ChevronRightIcon className='h-5 w-5' aria-hidden='true' />
        </a>
      </div>
      <div className='mt-6 grid grid-cols-7 text-xs leading-6 text-gray-500'>
        <div>M</div>
        <div>T</div>
        <div>W</div>
        <div>T</div>
        <div>F</div>
        <div>S</div>
        <div>S</div>
      </div>
      <div className='isolate mt-2 grid grid-cols-7 gap-px rounded-lg bg-gray-200 text-sm shadow ring-1 ring-gray-200'>
        {days.map((day, dayIdx) => (
          <a
            key={day.date}
            type='button'
            className={cls(
              'py-1.5 hover:bg-gray-100 focus:z-10',
              day.isCurrentMonth ? 'bg-white' : 'bg-gray-50',
              (day.isSelected || day.isToday) && 'font-semibold',
              day.isSelected && 'text-white',
              !day.isSelected && day.isCurrentMonth && !day.isToday &&
                'text-gray-900',
              !day.isSelected && !day.isCurrentMonth && !day.isToday &&
                'text-gray-400',
              day.isToday && !day.isSelected && 'text-indigo-600',
              dayIdx === 0 && 'rounded-tl-lg',
              dayIdx === 6 && 'rounded-tr-lg',
              dayIdx === days.length - 7 && 'rounded-bl-lg',
              dayIdx === days.length - 1 && 'rounded-br-lg',
            )}
            href={`${url.pathname}?day=${day.date}`}
          >
            <time
              dateTime={day.date}
              className={cls(
                'mx-auto flex h-7 w-7 items-center justify-center rounded-full',
                day.isSelected && day.isToday && 'bg-indigo-600',
                day.isSelected && !day.isToday && 'bg-gray-900',
              )}
            >
              {day.date.split('-').pop()!.replace(/^0/, '')}
            </time>
          </a>
        ))}
      </div>
      {children}
    </div>
  )
}
