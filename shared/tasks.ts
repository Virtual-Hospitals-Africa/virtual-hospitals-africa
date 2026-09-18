import { assert } from 'std/assert/assert.ts'
import { PROCEDURE, REFERENCE_DOCUMENTATION } from './snomed_concepts.ts'
import { parseWithSchema } from './s_expression.ts'
import entries from '../util/entries.ts'
import {
  ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS_TO_SNOMED,
  ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED,
} from './adult_pac_table_of_contents_to_snomed.ts'
import { ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS, ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS } from './pack-adult.ts'
import { task } from './s_expression_schemas.ts'
import { TASKS_LISP } from '../s_expression/tasks.ts'
import findMatching from '../util/findMatching.ts'
import { RenderedTaskToBeDone } from '../types.ts'
import memoize from '../util/memoize.ts'
import compactMap from '../util/compactMap.ts'
import z from 'zod'

function asTask(task_s_expression: string) {
  return parseWithSchema(task_s_expression, task)
}

const TABLE_OF_CONTENTS_SYMPTOMS = compactMap(entries(ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS_TO_SNOMED), ([table_of_contents_name, table_of_contents_entry]) => {
  const page_number = ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS[table_of_contents_name as unknown as keyof typeof ADULT_PAC_SYMPTOMS_TABLE_OF_CONTENTS]
  assert(page_number, `No page for ${table_of_contents_name}`)
  // TODO Have some way of noting that the patient is here for a procedure
  if (['procedure', 'regime/therapy'].includes(table_of_contents_entry.category)) return
  return {
    ...table_of_contents_entry,
    table_of_contents_name,
    page_number,
    link_href: `/medical-resources/primary-care/adult.pdf#page=${page_number}`,
    thumbnail_href: `/medical-resources/za/primary-care/adult/thumbnails/400/${page_number}.png`,
  }
})

const TABLE_OF_CONTENTS_CHRONIC_CONDITIONS = compactMap(
  entries(ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS_TO_SNOMED),
  ([table_of_contents_name, table_of_contents_entry]) => {
    const page_number =
      ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS[table_of_contents_name as unknown as keyof typeof ADULT_PAC_CHRONIC_CONDITIONS_TABLE_OF_CONTENTS]
    assert(page_number, `No page for ${table_of_contents_name}`)
    // TODO Have some way of noting that the patient is here for a procedure
    if (['procedure', 'regime/therapy'].includes(table_of_contents_entry.category)) return
    return {
      ...table_of_contents_entry,
      table_of_contents_name,
      page_number,
      link_href: `/medical-resources/primary-care/adult.pdf#page=${page_number}`,
      thumbnail_href: `/medical-resources/za/primary-care/adult/thumbnails/400/${page_number}.png`,
    }
  },
)

const TABLE_OF_CONTENTS_COMBINED = [
  ...TABLE_OF_CONTENTS_SYMPTOMS,
  ...TABLE_OF_CONTENTS_CHRONIC_CONDITIONS,
]

export const MEDICAL_GUIDANCE_TASKS = TABLE_OF_CONTENTS_COMBINED.map((table_of_contents_entry) => {
  const task = asTask(`
    (task
      "Display medical guidance for ${table_of_contents_entry.table_of_contents_name}"
      adult
      ${table_of_contents_entry.s_expression}
      (procedure 
        ${PROCEDURE.s_expression}
        ${REFERENCE_DOCUMENTATION.s_expression}
        (link 
          "APC 2023 — ${table_of_contents_entry.table_of_contents_name}"
          "${table_of_contents_entry.link_href}"
          "${table_of_contents_entry.thumbnail_href}"
        )
      )
    )
  `)

  return { ...task, page_number: table_of_contents_entry.page_number }
})

export const TASKS = [
  ...TASKS_LISP.map(asTask),
  ...MEDICAL_GUIDANCE_TASKS,
]
/*
// Triage nurse has permission.
  check_for finding              Yes
  do measurement                 Most of the time
  suspected diagnosis            Sometimes
  make diagnosis                 Generally no
  administer medication          Depends
*/

// TODO Separate function for permission around tasks
// That is, put the task in for analgesia, but there's separate logic to
// say who has permissions to prescribe what

/*
  The tasks must be done even if the triage nurse can't do them.
  In fact, this is the _reason_ for transfer
*/

export const task_description_validator = z.enum(
  TASKS.map(task => task.description)
)

// id is synonymous with description for now.
// TODO: We may need to distinguish these for management tasks where the same task is done for different conditions
export const getTaskById = memoize(function getTaskById(id: string) {
  return findMatching(TASKS, { description: id })
})

export function isLink(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'link' } {
  return task.atom === 'link'
}

export function isFinding(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'finding' } {
  return task.atom === 'finding'
}

export function isManage(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'procedure' } {
  return task.atom === 'procedure'
}

export function isMeasurement(task: RenderedTaskToBeDone): task is RenderedTaskToBeDone & { atom: 'measurement' } {
  return task.atom === 'measurement'
}
