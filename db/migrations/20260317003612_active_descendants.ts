import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await sql`
    create or replace function active_descendants(parent_concept_id bigint)
    returns table(id bigint)
    language sql
    stable
    as $$
      with recursive descendant_tree as (
        -- Base case: the parent concept itself
        select parent_concept_id as id
    
          union all
    
        -- Recursive case: children whose IS-A relationship points to a current node
        select sr.source_id
          from descendant_tree dt
          join snomed_relationship sr on sr.destination_id = dt.id
          join snomed_concept sc on sc.id = sr.source_id
          where sr.active
            and sc.active
            and sr.type_id = 116680003 -- "is a"
      )
      select distinct(id) as id from descendant_tree
    $$
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP FUNCTION active_descendants(parent_concept_id bigint)`.execute(db)
}
