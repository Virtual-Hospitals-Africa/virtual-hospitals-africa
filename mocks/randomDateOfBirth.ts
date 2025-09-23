export default function randomDateOfBirth() {
  const start = new Date(1950, 0, 1)
  const end = new Date(2005, 0, 1)
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
  return date.toISOString().slice(0, 10)
}
