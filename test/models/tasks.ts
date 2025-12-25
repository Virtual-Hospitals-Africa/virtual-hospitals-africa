// import { assertEquals } from 'std/assert/assert_equals.ts'
// import { afterAll, describe, it } from 'std/testing/bdd.ts'
// import db from '../../db/db.ts'
// import { TASKS } from '../../shared/tasks.ts'

// describe('db/models/simple_record_language.ts', () => {
//   afterAll(() => db.destroy())

//   it('parsed TASKS correctly', () => {
//     assertEquals(TASKS, [
//       {
//         'if_description': 'If oxygen saturation below 92%',
//         'tasks_description': 'give oxygen and move to resuscitation area',
//         'task_s_expression': {
//           'type': 'task',
//           'if_expression': {
//             'type': '<',
//             'left': {
//               'type': 'measurement',
//               'snomed_concept_id': '103228002',
//             },
//             'right': {
//               'type': 'units',
//               'value': 92,
//               'units': '%',
//             },
//           },
//           'tasks': [
//             {
//               'type': 'procedure',
//               'snomed_concept_id': '57485005',
//               'value_snomed_concept_id': null,
//               'qualifiers': [],
//             },
//           ],
//         },
//       },
//     ])
//   })
// })
