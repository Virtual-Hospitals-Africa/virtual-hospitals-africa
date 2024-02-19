import * as trigram from '../util/trigram.ts'

type Path = Array<number | 'term' | 'mainTerm'>

function* indexableTerms(
  term: ICD10IndexTerm,
  path: Path,
): Generator<[string, Path]> {
  if (typeof term.title === 'string') {
    yield [term.title, path]
  } else if (term.title['#text']) {
    yield [String(term.title['#text']), path]
  }
  if (!term.term) return

  if (Array.isArray(term.term)) {
    for (const [i, subTerm] of term.term.entries()) {
      yield* indexableTerms(subTerm, [...path, 'term', i])
    }
  } else if (typeof term.term === 'string') {
    yield [term.term, [...path, 'term']]
  } else if (typeof term.term === 'object') {
    yield* indexableTerms(term.term, [...path, 'term'])
  }
}

export type ICD10SearchableSerialized = {
  terms: string[]
  paths: Path[]
  icd10_index: ICD10Index
  index: trigram.Serialized
}

export class ICD10Searchable {
  public terms: string[] = []
  public paths: Path[] = []
  public index: trigram.TrigramIndex
  constructor(public icd10_index: ICD10Index) {
    for (const [i, letter] of icd10_index['ICD10CM.index'].letter.entries()) {
      for (const [j, mainTerm] of letter.mainTerm.entries()) {
        for (
          const [term, path] of indexableTerms(mainTerm, [i, 'mainTerm', j])
        ) {
          this.terms.push(term.toLowerCase())
          this.paths.push(path)
        }
      }
    }
    this.index = new trigram.TrigramIndex(this.terms)
  }

  static deserialize(serialized: ICD10SearchableSerialized): ICD10Searchable {
    return Object.setPrototypeOf({
      terms: serialized.terms,
      paths: serialized.paths,
      icd10_index: serialized.icd10_index,
      index: trigram.TrigramIndex.deserialize(serialized.index),
    }, ICD10Searchable.prototype)
  }

  serialize(): ICD10SearchableSerialized {
    return {
      terms: this.terms,
      paths: this.paths,
      icd10_index: this.icd10_index,
      index: this.index.serialize(),
    }
  }

  search(query: string) {
    const results = this.index.find(query)

    return results.flatMap((result) =>
      result.indexes.map((index) => {
        const path = this.paths[index]
        // deno-lint-ignore no-explicit-any
        let current: any = this.icd10_index['ICD10CM.index'].letter
        for (const step of path) {
          // deno-lint-ignore no-explicit-any
          current = current[step as any]
        }
        return { result, term: current, path }
      })
    )
  }
}

type ICD10IndexTitle = string | {
  nemod: string
  '#text': string | number
}

type ICD10IndexTerm = {
  title: ICD10IndexTitle
  code?: string
  see?: string
  seeAlso?: string
  term?: ICD10IndexTerm | ICD10IndexTerm[]
}

export type ICD10Index = {
  'ICD10CM.index': {
    letter: {
      title: string
      mainTerm: ICD10IndexTerm[]
    }[]
  }
}
