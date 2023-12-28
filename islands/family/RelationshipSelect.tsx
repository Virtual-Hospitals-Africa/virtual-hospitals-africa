import { useCallback, useEffect, useState } from 'preact/hooks'
import { assert } from 'std/assert/assert.ts'
import debounce from '../../util/debounce.ts'
import { GuardianRelation, HasId } from '../../types.ts'
import { Select } from '../../components/library/form/Inputs.tsx'

export default function RelationshipSelect({
  name,
  required,
  value,
  type,
  gender,
}: {
  name: string
  required?: boolean
  value?: { id: number | 'next_available'; name: string }
  type?: 'guardian' | 'dependent'
  gender?: 'male' | 'female' | 'other'
}) {
  const [relations, setRelations] = useState<HasId<GuardianRelation>[]>(
    [],
  )

  const getRelationships = async () => {
    const url = new URL(`${window.location.origin}/app/family`)
    await fetch(url, {
      headers: { accept: 'application/json' },
    }).then(async (response) => {
      const result = await response.json()
      assert(Array.isArray(result))
      setRelations(result)
    }).catch(console.error)
  }

  useEffect(() => {
    getRelationships()
  }, [type, gender])

  return (
    <Select
      name={`${name}`}
      label='Relationship'
      required={required}
    >
      {relations.map((relation) => (
        <>
          {(!type || type === 'guardian') &&
              (
                <>
                  {(!gender || gender === 'male' || gender === 'other') &&
                      (
                        <option value={relation.guardian}>
                          {relation.male_guardian ?? relation.guardian}
                        </option>
                      )}
                  {(!gender || gender === 'female' || gender === 'other') &&
                      (
                        <option value={relation.guardian}>
                          {relation.female_guardian ?? relation.guardian}
                        </option>
                      )}
                </>
              )}

          {(!type || type === 'dependent') &&
              (
                <>
                  {(!gender || gender === 'male' || gender === 'other') &&
                      (
                        <option value={relation.dependent}>
                          {relation.male_dependent ?? relation.dependent}
                        </option>
                      )}
                  {(!gender || gender === 'female' || gender === 'other') &&
                      (
                        <option value={relation.dependent}>
                          {relation.female_dependent ?? relation.dependent}
                        </option>
                      )}
                </>
              )}
        </>
      ))}
    </Select>
  )
}
