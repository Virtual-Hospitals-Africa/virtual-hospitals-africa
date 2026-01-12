import { describe, it } from 'std/testing/bdd.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { normalForm, parseExpression, parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import { CLINICAL_FINDING, PROCEDURE } from '../../shared/snomed_concepts.ts'
import { assertMatches } from '../../util/assertMatches.ts'
import { positive_decimal } from '../../util/validators.ts'
import { Decimal } from '../../util/decimal.ts'

describe('shared/s_expression.ts', () => {
  it('can parse a simple finding expression', () => {
    const finding = parseExpression('(finding 182899812 1219200912)')
    assertEquals(finding, {
      atom: 'finding',
      root_snomed_concept: {
        atom: 'snomed_concept',
        type: 'snomed_concept_id',
        id: '182899812',
      },
      specific_snomed_concept: {
        atom: 'snomed_concept',
        type: 'snomed_concept_id',
        id: '1219200912',
      },
      exact: false,
      value_snomed_concept: null,
      attributes: [],
      qualifiers: [],
    })
  })

  it('can parse a finding expression with qualifiers', () => {
    const finding = parseExpression(
      '(finding 182899812 1219200912 (qualifier 121277))',
    )
    assertEquals(finding, {
      atom: 'finding',
      root_snomed_concept: {
        atom: 'snomed_concept',
        type: 'snomed_concept_id',
        id: '182899812',
      },
      specific_snomed_concept: {
        atom: 'snomed_concept',
        type: 'snomed_concept_id',
        id: '1219200912',
      },
      exact: false,
      value_snomed_concept: null,
      attributes: [],
      qualifiers: [{
        atom: 'qualifier',
        specific_snomed_concept: {
          atom: 'snomed_concept',
          type: 'snomed_concept_id',
          id: '121277',
        },
        qualifiers: [],
      }],
    })
  })

  /**
   * finding: attribute
    relation: finding site
    specific_snomed_concept_id: the actual finding site
   */
  it('can parse a finding expression with attributes & snomed concepts', () => {
    const parsed = parseExpressionExpectingAtom(
      `(finding ${CLINICAL_FINDING.s_expression} 
          (snomed_concept "Burn" "disorder")
          (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure"))
      )`,
      'finding',
    )

    assertEquals(parsed, {
      'atom': 'finding',
      'root_snomed_concept': {
        'atom': 'snomed_concept',
        'type': 'snomed_concept_name_and_category',
        'name': 'Clinical finding',
        'category': 'finding',
      },
      'specific_snomed_concept': {
        'atom': 'snomed_concept',
        'name': 'Burn',
        'category': 'disorder',
        'type': 'snomed_concept_name_and_category',
      },
      'value_snomed_concept': null,
      'exact': false,
      'qualifiers': [],
      'attributes': [
        {
          'atom': 'attribute',
          'specific_snomed_concept': {
            'atom': 'snomed_concept',
            'name': 'Finding site',
            'category': 'attribute',
            'type': 'snomed_concept_name_and_category',
          },
          'value': {
            'atom': 'snomed_concept',
            'name': 'Left upper arm structure',
            'category': 'body structure',
            'type': 'snomed_concept_name_and_category',
          },
        },
      ],
    })

    assertEquals(
      inverseSExpression(parsed),
      `(finding ${CLINICAL_FINDING.s_expression} (snomed_concept "Burn" "disorder") (attribute (snomed_concept "Finding site" "attribute") (snomed_concept "Left upper arm structure" "body structure")))`,
    )
  })

  it('can parse bare evaluations', () => {
    const parsed = parseExpression('(evaluation (evaluates (finding)))')
    assertEquals(parsed, {
      'atom': 'evaluation',
      'root_snomed_concept': null,
      'specific_snomed_concept': null,
      'value_snomed_concept': null,
      'qualifiers': [],
      'evaluates': {
        'atom': 'evaluates',
        'expression': {
          'atom': 'finding',
          'root_snomed_concept': null,
          'specific_snomed_concept': null,
          'value_snomed_concept': null,
          'qualifiers': [],
          'attributes': [],
          'exact': false,
        },
      },
      'attributes': [],
    })
  })

  it('can parse something moderately crazy', () => {
    const parsed = parseExpression(`
      (and (or (finding 404684003)
               (finding 1269489004)))`)
    assertEquals(parsed, {
      'atom': 'and',
      'expressions': [
        {
          'atom': 'or',
          'expressions': [
            {
              'atom': 'finding',
              'root_snomed_concept': {
                'atom': 'snomed_concept',
                'type': 'snomed_concept_id',
                'id': '404684003',
              },
              'specific_snomed_concept': null,
              'value_snomed_concept': null,
              'qualifiers': [],
              'attributes': [],
              'exact': false,
            },
            {
              'atom': 'finding',
              'root_snomed_concept': {
                'atom': 'snomed_concept',
                'type': 'snomed_concept_id',
                'id': '1269489004',
              },
              'specific_snomed_concept': null,
              'value_snomed_concept': null,
              'qualifiers': [],
              'attributes': [],
              'exact': false,
            },
          ],
        },
      ],
    })
  })

  it('can parse something crazy', () => {
    const parsed = parseExpression(`
      (and (or (finding 404684003)
             (finding 1269489004))
         (not (finding (qualifier 1156040003)))
         (not (exact (finding 404684003 79688008))) (not (exact (finding 404684003 91175000 (qualifier 15240007)))) (not (exact (finding 404684003 262582004))) (not (exact (finding 404684003 425082000))) (not (exact (finding 404684003 410429000))) (not (exact (finding 404684003 400209005))) (not (exact (finding 404684003 230690007))) (not (exact (finding 404684003 125666000 (qualifier 255593009)))) (not (exact (finding 404684003 267036007 (qualifier 24484000)))) (not (exact (finding 404684003 61372001))) (not (exact (finding 404684003 426284001))) (not (exact (finding 404684003 21631000119105))) (not (exact (finding 404684003 75478009))) (not (exact (finding 404684003 1149222004))) (not (exact (finding 404684003 66857006))) (not (exact (finding 404684003 231794000))) (not (exact (finding 404684003 29857009))) (not (exact (finding 404684003 87642003))) (not (exact (finding 404684003 267051003))) (not (exact (finding 404684003 283457003))) (not (exact (finding 404684003 52329006))) (not (exact (finding 404684003 417746004))) (not (exact (finding 404684003 21522001))) (not (exact (finding 404684003 131148009 (qualifier 19032002)))) (not (exact (finding 404684003 31758001))) (not (exact (finding 404684003 76948002))) (not (exact (finding 404684003 284549007 (qualifier 6736007)))) (not (exact (finding 404684003 131148009 (qualifier 31509003)))) (not (exact (finding 404684003 827108008))) (not (exact (finding 404684003 263030002))) (not (exact (finding 404684003 423125000))) (not (exact 
      (finding 404684003 125666000)
    )) (not (exact (finding 404684003 21522001))) (not (exact (finding 404684003 196746003))) (not (exact (finding 404684003 (snomed_concept "Moderate pain" "finding")))))
    `)

    assertEquals(parsed, {
      'atom': 'and',
      'expressions': [
        {
          'atom': 'or',
          'expressions': [
            {
              'atom': 'finding',
              'root_snomed_concept': {
                'atom': 'snomed_concept',
                'type': 'snomed_concept_id',
                'id': '404684003',
              },
              'specific_snomed_concept': null,
              'value_snomed_concept': null,
              'qualifiers': [],
              'attributes': [],
              'exact': false,
            },
            {
              'atom': 'finding',
              'root_snomed_concept': {
                'atom': 'snomed_concept',
                'type': 'snomed_concept_id',
                'id': '1269489004',
              },
              'specific_snomed_concept': null,
              'value_snomed_concept': null,
              'qualifiers': [],
              'attributes': [],
              'exact': false,
            },
          ],
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': null,
            'specific_snomed_concept': null,
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '1156040003',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': false,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '79688008',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '91175000',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '15240007',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '262582004',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '425082000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '410429000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '400209005',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '230690007',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '125666000',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '255593009',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '267036007',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '24484000',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '61372001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '426284001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '21631000119105',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '75478009',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '1149222004',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '66857006',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '231794000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '29857009',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '87642003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '267051003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '283457003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '52329006',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '417746004',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '21522001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '131148009',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '19032002',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '31758001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '76948002',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '284549007',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '6736007',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '131148009',
            },
            'value_snomed_concept': null,
            'qualifiers': [
              {
                'atom': 'qualifier',
                'specific_snomed_concept': {
                  'atom': 'snomed_concept',
                  'type': 'snomed_concept_id',
                  'id': '31509003',
                },
                'qualifiers': [],
              },
            ],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '827108008',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '263030002',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '423125000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '125666000',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '21522001',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '196746003',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
        {
          'atom': 'not',
          'expression': {
            'atom': 'finding',
            'root_snomed_concept': {
              'atom': 'snomed_concept',
              'type': 'snomed_concept_id',
              'id': '404684003',
            },
            'specific_snomed_concept': {
              'atom': 'snomed_concept',
              'name': 'Moderate pain',
              'category': 'finding',
              'type': 'snomed_concept_name_and_category',
            },
            'value_snomed_concept': null,
            'qualifiers': [],
            'attributes': [],
            'exact': true,
          },
        },
      ],
    })
  })

  it('can parse a measurement', () => {
    const parsed = parseExpressionExpectingAtom(
      `(< (measurement 103228002) (units 92 %))`,
      '<',
    )
    assertMatches(parsed, {
      atom: '<',
      left: {
        atom: 'measurement',
        snomed_concept: {
          atom: 'snomed_concept',
          id: '103228002',
          type: 'snomed_concept_id',
        },
      },
      right: {
        atom: 'units',
        units: '%',
        value: positive_decimal.parse(92),
      },
    })
  })

  it('can produce a normal form', () => {
    const normal_for_age = normalForm(`
      (finding
        ${CLINICAL_FINDING.s_expression}
        (snomed_concept "Ability to move" "observable entity")
        (snomed_concept "Normal" "qualifier value")
        (qualifier (snomed_concept "For" "qualifier value")
          (qualifier (snomed_concept "Age" "qualifier value"))))
    `)
    assertEquals(
      normal_for_age,
      '(finding (snomed_concept "Clinical finding" "finding") (snomed_concept "Ability to move" "observable entity") (snomed_concept "Normal" "qualifier value") (qualifier (snomed_concept "For" "qualifier value") (qualifier (snomed_concept "Age" "qualifier value"))))',
    )
  })

  it('can parse a task', () => {
    const parsed = parseExpressionExpectingAtom(
      `
      (task
          "Give oxygen if saturation below 92%"
            (< (measurement 103228002) (units 92 %))
            (procedure ${PROCEDURE.s_expression} 57485005))`,
      'task',
    )

    assertEquals(parsed, {
      atom: 'task',
      description: 'Give oxygen if saturation below 92%',
      when: {
        atom: '<',
        left: {
          atom: 'measurement',
          snomed_concept: {
            atom: 'snomed_concept',
            type: 'snomed_concept_id',
            id: '103228002',
          },
        },
        right: {
          atom: 'units',
          value: new Decimal(92),
          units: '%',
        },
      },
      procedure: {
        atom: 'procedure',
        root_snomed_concept: {
          atom: 'snomed_concept',
          name: 'Procedure',
          category: 'procedure',
          type: 'snomed_concept_name_and_category',
        },
        specific_snomed_concept: {
          atom: 'snomed_concept',
          type: 'snomed_concept_id',
          id: '57485005',
        },
        qualifiers: [],
        attributes: [],
        value: null,
      },
    })
  })
})
