import { Branch } from './snowstorm/Branch.ts'

const branch = new Branch()

type ConceptsQuery = Parameters<typeof branch.findConcepts>[1]

export function searchConcepts(query: ConceptsQuery) {
  return branch.findConcepts('MAIN', query)
}

export function findConcept(code: string) {
  return branch.findConcept('MAIN', code)
}
