import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export function up(db: Kysely<DB>) {
  return sql`
create or replace function active_descendant_snomed_concepts (parent_concept_id bigint)
returns table (descendant_id bigint, ancestor_ids bigint[])
language plpgsql
as $$
begin
    return query
    with recursive descendant_tree as (
      -- Base case, gets filtered out later
      select parent_concept_id as descendant_id
           , array[]::bigint[] as ancestor_ids

       union all

      -- Recursive case: children of children
      select sr.source_id as descendant_id
           , dt.ancestor_ids || sr.destination_id as ancestor_ids
       from descendant_tree dt
      inner join snomed_relationship sr on dt.descendant_id = sr.destination_id
      inner join snomed_concept sc on sr.source_id = sc.id
      where sr.active
        and sc.active
        and sr.type_id = 116680003 -- "is a"
    )
    select descendant_tree.descendant_id
         , descendant_tree.ancestor_ids
     from descendant_tree;
    -- where descendant_tree.descendant_id != parent_concept_id;
end $$
  `.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`
    DROP FUNCTION active_descendant_snomed_concepts(parent_concept_id bigint)
  `.execute(db)
}
