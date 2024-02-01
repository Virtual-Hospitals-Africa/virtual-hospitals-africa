import db from '../db/db.ts'
import * as cheerio from 'cheerio'

const results = await db.selectFrom('conditions')
  .where('info_link_href', 'is not', null)
  .select(['info_link_href', 'name', 'id'])
  .limit(10)
  .execute()

for await (const condition of results) {
  console.log(condition)
  const response = await fetch(condition.info_link_href!)
  const $ = cheerio.load(await response.text())
  // console.log($.html())
  if ($('h2:contains("Symptoms:)').first().html()) {
    console.log('found symptoms')
    break
  }
  // console.log($('h2:contains("Symptoms:)').first().html())
}
