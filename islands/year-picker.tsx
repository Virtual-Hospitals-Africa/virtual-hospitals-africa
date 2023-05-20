import { FunctionalComponent, h } from 'preact'
import { useState } from 'preact/hooks'
import { JSX } from 'preact'

interface Props {
  currentDay: number
  currentMonth: number
  selectedYear: number
}
const YearPicker: FunctionalComponent<Props> = (
  { selectedYear, currentDay, currentMonth },
) => {
  // Array of years to choose from
  const years = Array.from(
    { length: 5 },
    (_, i) => selectedYear - 2 + i,
  )

  // State to keep track of the currently selected year
  const [currentYear, setCurrentYear] = useState(selectedYear)

  // Handle changing the year
  const handleYearChange = (event: Event) => {
    const newYear = parseInt((event.target as HTMLSelectElement).value)
    const newDayString = currentDay.toString().padStart(2, '0')
    const newMonthString = (currentMonth).toString().padStart(2, '0')
    setCurrentYear(newYear)
    const url =
      `/app/calendar?startday=${newYear}-${newMonthString}-${newDayString}`
    history.pushState({}, '', url)
    window.location.reload()
  }

  return (
    <select value={currentYear} onChange={handleYearChange}>
      {years.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </select>
  )
}

export default YearPicker
