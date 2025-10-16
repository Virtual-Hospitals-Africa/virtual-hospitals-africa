import { define } from '../define.ts'
import { sql } from 'kysely'

export default define(['snomed_family_history'], (trx) =>
  sql`
    insert into snomed_family_history(id)
    select distinct descendant_id 
      from active_descendant_snomed_concepts(416471007)
      -- 416471007 |Family history of clinical finding (situation)|
      -- https://www.snomedbrowser.org/?perspective=full&conceptId1=416471007&edition=MAIN/2025-09-01&release=&languages=en
  `.execute(trx))
