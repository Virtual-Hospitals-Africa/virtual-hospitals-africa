// Paste into the console at https://forebears.io/south-africa/forenames

const rows = document.querySelectorAll('.forename-table > tbody > tr')

const r = []

for (const row of rows) {
  const cells = row.querySelectorAll('td')
  if (cells.length !== 5) continue

  const [_rank, gender_breakdown, first_name, incidence] = row.querySelectorAll('td')
  
  const male = gender_breakdown.querySelector('.m')
  const female = gender_breakdown.querySelector('.f')

  let female_percentage = female ? parseInt(female.textContent.replace('%', '')) : 0
  let male_percentage = male ? parseInt(male.textContent.replace('%', '')) : 0

  if (isNaN(female_percentage)) {
    female_percentage = 100 - male_percentage
  }
  if (isNaN(male_percentage)) {
    male_percentage = 100 - female_percentage
  }

  r.push({
    first_name: first_name.textContent,
    incidence: parseInt(incidence.textContent.replaceAll(',', '')),
    female_percentage,
    male_percentage,
  })
}

console.log("export const first_names = " + JSON.stringify(r, null, 2))
