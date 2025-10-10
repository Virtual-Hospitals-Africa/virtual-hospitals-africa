// Paste into the console at https://forebears.io/south-africa/surnames

const rows = document.querySelectorAll('.forename-table > tbody > tr')

const r = []

for (const row of rows) {
  const cells = row.querySelectorAll('td')
  if (cells.length !== 4) continue

  const [_rank, last_name, incidence] = row.querySelectorAll('td')
  
  r.push({
    last_name: last_name.textContent,
    incidence: parseInt(incidence.textContent.replaceAll(',', '')),
  })
}

console.log("export const last_names = " + JSON.stringify(r, null, 2))
