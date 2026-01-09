// Paste into the console at https://forebears.io/south-africa/surnames

const rows = document.querySelectorAll('.forename-table > tbody > tr')

const r = []

for (const row of rows) {
  const cells = row.querySelectorAll('td')
  if (cells.length !== 4) continue

  const [_rank, surname, incidence] = row.querySelectorAll('td')

  r.push({
    surname: surname.textContent,
    incidence: parseInt(incidence.textContent.replaceAll(',', '')),
  })
}

console.log('export const surnames = ' + humanReadableJson(r))
