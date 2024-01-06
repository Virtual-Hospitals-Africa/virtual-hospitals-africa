import { GuardianRelationName, Maybe } from '../../types.ts'
import { Select } from '../../components/library/form/Inputs.tsx'
import { Signal, useSignal } from '@preact/signals'
import { JSX } from 'preact'
import { GUARDIAN_RELATIONS } from '../../shared/family.ts'

type OptionsProps = {
  gender?: Maybe<'male' | 'female' | 'other'>
  selected_family_relation_gendered: Signal<string | undefined>
  relation: {
    guardian: GuardianRelationName
    dependent: string
    female_guardian: string | null
    male_guardian: string | null
    female_dependent: string | null
    male_dependent: string | null
  }
}

function GuardianOptions({
  gender,
  selected_family_relation_gendered,
  relation,
}: OptionsProps) {
  const options: JSX.Element[] = []
  if ((!gender || gender === 'male') && relation.male_guardian) {
    options.push(
      <option
        value={relation.male_guardian}
        selected={selected_family_relation_gendered.value ===
          relation.male_guardian}
      >
        {relation.male_guardian}
      </option>,
    )
  }
  if ((!gender || gender === 'female') && relation.female_guardian) {
    options.push(
      <option
        value={relation.female_guardian}
        selected={selected_family_relation_gendered.value ===
          relation.female_guardian}
      >
        {relation.female_guardian}
      </option>,
    )
  }
  if (
    (!gender || gender === 'other') ||
    (gender === 'female' && !relation.female_guardian) ||
    (gender === 'male' && !relation.male_guardian)
  ) {
    options.push(
      <option
        value={relation.guardian}
        selected={selected_family_relation_gendered.value ===
          relation.guardian}
      >
        {relation.guardian}
      </option>,
    )
  }
  return options
}

function DependentOptions({
  gender,
  selected_family_relation_gendered,
  relation,
}: OptionsProps) {
  const options: JSX.Element[] = []
  if ((!gender || gender === 'male') && relation.male_dependent) {
    options.push(
      <option
        value={relation.male_dependent}
        selected={selected_family_relation_gendered.value ===
          relation.male_dependent}
      >
        {relation.male_dependent}
      </option>,
    )
  }
  if ((!gender || gender === 'female') && relation.female_dependent) {
    options.push(
      <option
        value={relation.female_dependent}
        selected={selected_family_relation_gendered.value ===
          relation.female_dependent}
      >
        {relation.female_dependent}
      </option>,
    )
  }
  if (
    (!gender || gender === 'other' ||
      (gender === 'female' && !relation.female_dependent) ||
      (gender === 'male' && !relation.male_dependent))
  ) {
    options.push(
      <option
        value={relation.dependent}
        selected={selected_family_relation_gendered.value ===
          relation.dependent}
      >
        {relation.dependent}
      </option>,
    )
  }
  return options
}

export default function RelationshipSelect({
  name,
  required,
  family_relation_gendered,
  type,
  gender,
}: {
  name: string
  required?: boolean
  family_relation_gendered?: string
  type: 'guardian' | 'dependent'
  gender?: Maybe<'male' | 'female' | 'other'>
}) {
  const selected_family_relation_gendered = useSignal(family_relation_gendered)
  const Options = (type === 'guardian') ? GuardianOptions : DependentOptions
  return (
    <Select
      name={name}
      label='Relationship'
      required={required}
    >
      <>
      <option 
      selected={!selected_family_relation_gendered.value} 
      value={undefined}></option>
      {GUARDIAN_RELATIONS.flatMap((relation) =>
        Options({
          gender,
          relation,
          selected_family_relation_gendered,
        })
      )}
      </>
    </Select>
  )
}
