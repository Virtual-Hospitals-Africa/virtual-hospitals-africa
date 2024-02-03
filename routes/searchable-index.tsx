import { XMLParser } from 'fast-xml-parser'
import SearchableIndex from '../islands/SearchableIndex.tsx'

const parser = new XMLParser()

Deno.readTextFile('db/resources/icd10/icd10cm-index-April-2024.xml').then(
  (data) => {
    console.log(data.slice(0, 1000))
    const xml = parser.parse(data)
    console.log(xml)
  },
)

export default function SearchableIndexPage() {
  return <SearchableIndex />
}
