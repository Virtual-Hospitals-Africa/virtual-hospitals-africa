import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

// A parenthesized group containing no nested parens, e.g. (snomed_concept "Watery" "qualifier value")
const FLAT_GROUP = String.raw`\([^()]*\)`

// A parenthesized group nested one level deep, e.g. (qualifier (snomed_concept "Watery" "qualifier value"))
const NESTED_GROUP = String.raw`\((?:[^()]|${FLAT_GROUP})*\)`

/*
  Matches a whole (qualifier ...) node, including any qualifiers nested within it.
  Because the group being matched is balanced, the leftmost-longest match starting at
  "(qualifier " is exactly that node, so a global match walks the sibling qualifiers
  one by one, the same way flatMapping over the parsed finding's top-level qualifiers would.
*/
const QUALIFIER_NODE = String.raw`\(qualifier (?:[^()]|${NESTED_GROUP})*\)`

/*
  regexp_matches(..., 'g') is set-returning, and set-returning functions, subqueries and
  references to other tables are all rejected inside a column generation expression. Wrapping
  the match in an IMMUTABLE function sidesteps all three, so due_to.qualifiers can be a plain
  stored generated column over due_to.s_expression.
*/
export async function up(db: Kysely<DB>) {
  await sql.raw(`
    CREATE FUNCTION s_expression_qualifiers(s_expression text) RETURNS text[]
      LANGUAGE sql
      IMMUTABLE
      PARALLEL SAFE
      STRICT
    AS $fn$
      SELECT coalesce(array_agg(qualifier_node[1] ORDER BY ord), '{}')
      FROM regexp_matches($1, '${QUALIFIER_NODE}', 'g') WITH ORDINALITY AS t(qualifier_node, ord)
    $fn$
  `).execute(db)

  await sql`
    ALTER TABLE due_to
    ADD qualifiers text[] NOT NULL
    GENERATED ALWAYS AS (s_expression_qualifiers(s_expression)) STORED
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`ALTER TABLE due_to DROP COLUMN qualifiers`.execute(db)
  await sql`DROP FUNCTION s_expression_qualifiers(text)`.execute(db)
}
