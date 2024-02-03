import { XMLParser } from 'fast-xml-parser'
import { TrigramIndex } from '../util/trigram.ts'
import compact from '../util/compact.ts'
import { assert } from 'std/assert/assert.ts'

const parser = new XMLParser()

export const icd10_index: ICD10Index = await Deno.readTextFile('db/resources/icd10/icd10cm-index-April-2024.xml').then(
  (data) => parser.parse(data),
)

export const icd10_eindex = await Deno.readTextFile('db/resources/icd10/icd10cm-eindex-April-2024.xml').then(
  (data) => parser.parse(data),
)

type Path = Array<number | 'term' | 'mainTerm'>

function * indexableTerms(term: ICD10IndexTerm, path: Path): Generator<[string, Path]> {
  
  if (typeof term.title === 'string') {
    yield [term.title, path]
  } else if (term.title['#text']) {
    yield [String(term.title['#text']), path]
  }
  if (!term.term) return

  if (Array.isArray(term.term)) {
    for (const [i, subTerm] of term.term.entries()) {
      yield * indexableTerms(subTerm, [...path, 'term', i])
    }
  } else if (typeof term.term === 'string') {
    yield [term.term, [...path, 'term']]
  } else if (typeof term.term === 'object') {
    yield * indexableTerms(term.term, [...path, 'term'])
  }
}

const terms: string[] = []
const paths: Path[] = []
for (const [i, letter] of icd10_index['ICD10CM.index'].letter.entries()) {
  for (const [j, mainTerm] of letter.mainTerm.entries()) {
    for (const [term, path] of indexableTerms(mainTerm, [i, 'mainTerm', j])) {
      terms.push(term.toLowerCase())
      paths.push(path)
    }
  }
}

export const searchable = new TrigramIndex(terms)

export function search(query: string) {
  const results = searchable.find(query)
  
  return results.flatMap(result => 
    result.indexes.map(index => {
      const path = paths[index]
      let current: any = icd10_index['ICD10CM.index'].letter
      for (const step of path) {
        current = current[step as any]
      }
      return { result, term: current, path }
    })
  )
}

type ICD10IndexTitle = string | {
  nemod: string
  "#text": string | number
}

type ICD10IndexTerm = {
  title: ICD10IndexTitle
  code?: string
  see?: string
  seeAlso?: string
  term?: ICD10IndexTerm | ICD10IndexTerm[]
}

type ICD10Index = { 'ICD10CM.index': {
  letter: {
    title: string
    mainTerm: ICD10IndexTerm[]
  }[]
}}
