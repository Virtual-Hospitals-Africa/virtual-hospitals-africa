import { XMLParser } from 'fast-xml-parser'
import { Handlers, PageProps } from '$fresh/server.ts'
import { ICD10Index, ICD10Searchable } from '../shared/icd10.ts'
import SearchableIndex from '../islands/SearchableIndex.tsx'

const parser = new XMLParser()

export const icd10_index: ICD10Index = await Deno.readTextFile(
  'db/resources/icd10/icd10cm-index-April-2024.xml',
).then(
  (data) => parser.parse(data),
)

export const icd10_searchable = new ICD10Searchable(icd10_index)

export const handler: Handlers = {
  async GET(req, ctx) {
    return ctx.render({
      icd10_searchable: icd10_searchable.serialize(),
    })
  },
}

export default function SearchableIndexPage(props: PageProps) {
  return (
    <SearchableIndex
      serialized_icd10_searchable={props.data.icd10_searchable}
    />
  )
}
