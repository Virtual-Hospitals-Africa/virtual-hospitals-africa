import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<DB>) {
  await sql`
create or replace function is_descendant(child_concept_id bigint, parent_concept_id bigint)
returns boolean
language plpgsql
as $$
begin
    return exists (
      with recursive ancestor_tree as (
        -- Base case: start with the child
        select child_concept_id as concept_id

         union all

        -- Recursive case: parents of parents
        select sr.destination_id as concept_id
         from ancestor_tree at
        inner join snomed_relationship sr on at.concept_id = sr.source_id
        inner join snomed_concept sc on sr.destination_id = sc.id
        where sr.active
          and sc.active
          and sr.type_id = 116680003 -- "is a"
      )
      select 1
       from ancestor_tree
      where ancestor_tree.concept_id = parent_concept_id
    );
end $$
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP FUNCTION is_descendant(child_concept_id bigint, parent_concept_id bigint)`.execute(db)
}
