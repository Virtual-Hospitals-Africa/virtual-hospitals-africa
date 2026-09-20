import { assert } from 'std/assert/assert.ts'
import db from '../../db/db.ts'
import { snomed_warning_signs } from '../../db/models/snomed_warning_signs.ts'
import { pMap } from '../../util/inParallel.ts'
import { FINDING_SITE_FINDINGS, FindingSiteFindings } from '../../shared/finding_site_findings.ts'
import { finding, Lang } from '../../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { TrxOrDbOrQueryCreator } from '../../types.ts'

/*
  Each finding site page's findings, split the way the warning signs search sees them:

  matches.by_top_level_finding_site: the finding's concept carries its own finding site, and
  that site lies within the page's structure without falling inside one of the structures the
  page excludes. The search under this site surfaces these of its own accord.

  matches.by_including_s_expressions: the concept's own site lies outside the page's, but one
  of the page's including_s_expressions claims it anyway — by "eye" a patient also means what
  interprets visual function. The search surfaces these too, only by the other route.

  ask_about: everything else — findings neither sited within the page nor claimed by one of
  its including_s_expressions, findings sited within an excluded structure, and concepts the
  finding-like search never returns. The page has to ask the nurse about these outright.

  The partition comes from snomed_warning_signs itself so it cannot drift from what the
  search does: the model is run under the page's site, restricted to the page's concepts,
  once without the page's including_s_expressions and once with them. What the first run
  claims is sited within the page; what only the second run adds the including_s_expressions
  claim; and whatever neither run claims is left to ask about.
*/
type FindingSiteFindingsCategorized = Omit<FindingSiteFindings, 'clinical_finding_s_expressions'> & {
  matches: {
    by_top_level_finding_site: string[]
    by_including_s_expressions: string[]
  }
  ask_about: string[]
}

function specificConcept(s_expression: string): Lang['snomed_concept'] {
  const node = parseWithSchema(s_expression, finding)
  assert(node.specific_snomed_concept, `${s_expression} names no specific concept`)
  return node.specific_snomed_concept
}

async function conceptIds(trx: TrxOrDbOrQueryCreator, concepts: Lang['snomed_concept'][]): Promise<Map<string, string>> {
  const ids = new Map<string, string>()
  for (const concept of concepts) {
    const row = await trx.selectFrom('snomed_inferred_canonical_name_and_category')
      .where('name', '=', concept.name)
      .where('category', '=', concept.category)
      .select('id')
      .executeTakeFirst()
    assert(row, `No snomed concept found for ${inverseSExpression(concept)}`)
    ids.set(inverseSExpression(concept), row.id)
  }
  return ids
}

/*
  The ids of the site's concepts the search claims for the site, whether by the concept's own
  finding site lying within it or by one of the including_s_expressions passed. snomed_warning_signs
  coalesces a situation to its associated finding, so the ids it returns are matched against the
  concept ids we passed in, not against names.
*/
async function claimedBySite(
  trx: TrxOrDbOrQueryCreator,
  { finding_site_structure, excluding_structures }: FindingSiteFindings,
  including_s_expressions: string[] | undefined,
  snomed_concept_ids: string[],
): Promise<Set<string>> {
  if (!snomed_concept_ids.length) return new Set()
  const rows = await snomed_warning_signs.baseQuery(trx, {
    age_determination: 'adult',
    finding_site: finding_site_structure,
    excluding_structures,
    including_s_expressions,
    snomed_concept_id: snomed_concept_ids,
  }).execute()

  return new Set(rows.filter((row) => row.finding_site_is_predefined).map((row) => row.id))
}

export async function categorize(trx: TrxOrDbOrQueryCreator, site: FindingSiteFindings): Promise<FindingSiteFindingsCategorized> {
  const { clinical_finding_s_expressions, ...rest } = site
  const concepts_by_s_expression = new Map(clinical_finding_s_expressions.map((s_expression) => [s_expression, specificConcept(s_expression)]))
  const ids_by_concept = await conceptIds(trx, [...concepts_by_s_expression.values()])
  const ids = [...new Set(ids_by_concept.values())]

  const by_site = await claimedBySite(trx, site, undefined, ids)
  // Only worth the second run when the page names another way in; whatever it adds, the site alone did not claim
  const by_including = site.including_s_expressions?.length ? await claimedBySite(trx, site, site.including_s_expressions, ids) : by_site

  const by_top_level_finding_site: string[] = []
  const by_including_s_expressions: string[] = []
  const ask_about: string[] = []
  for (const s_expression of clinical_finding_s_expressions) {
    const id = ids_by_concept.get(inverseSExpression(concepts_by_s_expression.get(s_expression)!))!
    const bucket = by_site.has(id) ? by_top_level_finding_site : by_including.has(id) ? by_including_s_expressions : ask_about
    bucket.push(s_expression)
  }
  return { ...rest, matches: { by_top_level_finding_site, by_including_s_expressions }, ask_about }
}

if (import.meta.main) {
  const categorized = await pMap(FINDING_SITE_FINDINGS, (site) => categorize(db, site), { concurrency: 4 })
  Deno.writeFileSync(
    'shared/finding_site_findings_categorized.ts',
    new TextEncoder().encode(
      `// THIS FILE IS AUTOGENERATED. SEE scripts/data-munging/finding-site-findings-categorized.ts
import type { FindingSiteFindings } from './finding_site_findings.ts'

/*
  matches.by_top_level_finding_site: findings whose concept carries a finding site that lies
  within the page's structure and outside its excluding_structures, so the warning signs search
  under this site surfaces them on its own.
  matches.by_including_s_expressions: findings sited outside the page's structure that one of its
  including_s_expressions claims anyway, so the search surfaces them by that route instead.
  ask_about: the rest, which the page has to ask the nurse about outright.
*/
export type FindingSiteFindingsCategorized = Omit<FindingSiteFindings, 'clinical_finding_s_expressions'> & {
  matches: {
    by_top_level_finding_site: string[]
    by_including_s_expressions: string[]
  }
  ask_about: string[]
}

export const FINDING_SITE_FINDINGS_CATEGORIZED: FindingSiteFindingsCategorized[] = ${JSON.stringify(categorized, null, 2)}
`,
    ),
  )
  await db.destroy()
}
