import { Signal, useSignal } from '@preact/signals'
import { JSX } from 'preact'
import { GUARDIAN_RELATIONS } from '../../shared/family.ts'
import { GuardianRelationName, Maybe, Sex } from '../../types.ts'
import capitalize from '../../util/capitalize.ts'
import { Select } from '../form/inputs/select.tsx'

type OptionsProps = {
  sex?: Maybe<Sex>
  selected_family_relation_sexed: Signal<string | undefined>
  relation: {
    guardian: GuardianRelationName
    dependent: string
    female_guardian: string | null
    male_guardian: string | null
    female_dependent: string | null
    male_dependent: string | null
  }
}

function AllOptions({
  sex,
  selected_family_relation_sexed,
  relation,
}: OptionsProps) {
  const options: JSX.Element[] = []
  if ((!sex || sex === 'male') && relation.male_guardian) {
    options.push(
      <option
        value={relation.male_guardian}
        selected={selected_family_relation_sexed.value ===
          relation.male_guardian}
      >
        {capitalize(relation.male_guardian)}
      </option>,
    )
  }
  if ((!sex || sex === 'female') && relation.female_guardian) {
    options.push(
      <option
        value={relation.female_guardian}
        selected={selected_family_relation_sexed.value ===
          relation.female_guardian}
      >
        {capitalize(relation.female_guardian)}
      </option>,
    )
  }
  if (
    !sex ||
    sex === 'other' ||
    sex === 'prefer not to say' ||
    (sex === 'female' && !relation.female_guardian) ||
    (sex === 'male' && !relation.male_guardian)
  ) {
    options.push(
      <option
        value={relation.guardian}
        selected={selected_family_relation_sexed.value === relation.guardian}
      >
        {capitalize(relation.guardian)}
      </option>,
    )
  }
  if ((!sex || sex === 'male') && relation.male_dependent) {
    options.push(
      <option
        value={relation.male_dependent}
        selected={selected_family_relation_sexed.value ===
          relation.male_dependent}
      >
        {capitalize(relation.male_dependent)}
      </option>,
    )
  }
  if ((!sex || sex === 'female') && relation.female_dependent) {
    options.push(
      <option
        value={relation.female_dependent}
        selected={selected_family_relation_sexed.value ===
          relation.female_dependent}
      >
        {capitalize(relation.female_dependent)}
      </option>,
    )
  }
  if (
    !sex ||
    sex === 'other' ||
    sex === 'prefer not to say' ||
    (sex === 'female' && !relation.female_dependent) ||
    (sex === 'male' && !relation.male_dependent)
  ) {
    options.push(
      <option
        value={relation.dependent}
        selected={selected_family_relation_sexed.value ===
          relation.dependent}
      >
        {capitalize(relation.dependent)}
      </option>,
    )
  }
  return options
}

function GuardianOptions({
  sex,
  selected_family_relation_sexed,
  relation,
}: OptionsProps) {
  const options: JSX.Element[] = []
  if ((!sex || sex === 'male') && relation.male_guardian) {
    options.push(
      <option
        value={relation.male_guardian}
        selected={selected_family_relation_sexed.value ===
          relation.male_guardian}
      >
        {capitalize(relation.male_guardian)}
      </option>,
    )
  }
  if ((!sex || sex === 'female') && relation.female_guardian) {
    options.push(
      <option
        value={relation.female_guardian}
        selected={selected_family_relation_sexed.value ===
          relation.female_guardian}
      >
        {capitalize(relation.female_guardian)}
      </option>,
    )
  }
  if (
    !sex ||
    sex === 'other' ||
    sex === 'prefer not to say' ||
    (sex === 'female' && !relation.female_guardian) ||
    (sex === 'male' && !relation.male_guardian)
  ) {
    options.push(
      <option
        value={relation.guardian}
        selected={selected_family_relation_sexed.value === relation.guardian}
      >
        {capitalize(relation.guardian)}
      </option>,
    )
  }
  return options
}

function DependentOptions({
  sex,
  selected_family_relation_sexed,
  relation,
}: OptionsProps) {
  const options: JSX.Element[] = []
  if ((!sex || sex === 'male') && relation.male_dependent) {
    options.push(
      <option
        value={relation.male_dependent}
        selected={selected_family_relation_sexed.value ===
          relation.male_dependent}
      >
        {capitalize(relation.male_dependent)}
      </option>,
    )
  }
  if ((!sex || sex === 'female') && relation.female_dependent) {
    options.push(
      <option
        value={relation.female_dependent}
        selected={selected_family_relation_sexed.value ===
          relation.female_dependent}
      >
        {capitalize(relation.female_dependent)}
      </option>,
    )
  }
  if (
    !sex ||
    sex === 'other' ||
    sex === 'prefer not to say' ||
    (sex === 'female' && !relation.female_dependent) ||
    (sex === 'male' && !relation.male_dependent)
  ) {
    options.push(
      <option
        value={relation.dependent}
        selected={selected_family_relation_sexed.value ===
          relation.dependent}
      >
        {capitalize(relation.dependent)}
      </option>,
    )
  }
  return options
}

export default function RelationshipSelect({
  name,
  required,
  family_relation_sexed,
  type,
  sex,
  additionalRelations,
}: {
  name: string
  required?: boolean
  family_relation_sexed?: string
  type: 'guardian' | 'dependent' | 'all'
  sex?: Maybe<Sex>
  additionalRelations?: Map<string, string>
}) {
  const selected_family_relation_sexed = useSignal(family_relation_sexed)
  const Options = type === 'guardian'
    ? GuardianOptions
    : type === 'dependent'
    ? DependentOptions
    : AllOptions
  return (
    <Select name={name} label='Relationship' required={required}>
      <option value='' selected={!selected_family_relation_sexed.value}>
        Select a relationship
      </option>
      {GUARDIAN_RELATIONS.flatMap((relation) =>
        Options({
          sex,
          relation,
          selected_family_relation_sexed,
        })
      )}

      {additionalRelations &&
        Array.from(additionalRelations.entries()).map(([key, name]) => (
          <option
            key={key}
            value={key}
            selected={selected_family_relation_sexed.value === key}
          >
            {capitalize(name)}
          </option>
        ))}
    </Select>
  )
}
