import { useSignal } from '@preact/signals'
import { Button } from '../components/library/Button.tsx'
import PageHeader from '../components/library/typography/PageHeader.tsx'
import { cls } from '../util/cls.ts'
import WarningSigns from './WarningSigns.tsx'
import { WARNING_SIGNS } from '../shared/warning_signs.ts'
import { COMMON_SYMPTOMS } from '../shared/common_symptoms.ts'
import { YesNoGrid, YesNoQuestion } from './form/inputs/yes_no.tsx'
import { COMMON_CONDITIONS } from '../shared/brief_history.ts'
import { Existence } from '../types.ts'

type TutorialProgress =
  | { type: 'warning_signs' }
  | { type: 'brief_history' }

type Patient = {
  first_names: string
  surname: string
  sex: 'male' | 'female'
  date_of_birth: string
  national_id_number: string
  country: string
  gender: string
  preferred_language_code_iso_639_2_b: string
}

function WarningSignsPage({
  show,
  patient,
  onNext,
}: {
  show: boolean
  patient: Patient
  onNext(): void
}) {
  const warning_signs = [...WARNING_SIGNS, ...COMMON_SYMPTOMS]

  return (
    <div className={cls('flex flex-col gap-4', !show && 'hidden')}>
      <PageHeader className='h1'>
        Warning Signs - {patient.first_names} {patient.surname}
      </PageHeader>
      <p className='text-gray-600'>
        This is a tutorial demonstrating the triage warning signs assessment. Select any warning signs or symptoms the patient is experiencing.
      </p>
      <WarningSigns
        search_route='/tutorial/snomed-warning-signs'
        warning_signs={warning_signs}
      />
      <div className='flex justify-end mt-4'>
        <Button type='button' onClick={onNext}>
          Next<span aria-hidden='true'>&nbsp;&nbsp;&rarr;</span>
        </Button>
      </div>
    </div>
  )
}

function BriefHistoryPage({
  show,
  patient,
}: {
  show: boolean
  patient: Patient
}) {
  const conditions = useSignal<Record<string, Existence | null>>({})

  return (
    <div className={cls('flex flex-col gap-4', !show && 'hidden')}>
      <PageHeader className='h1'>
        Brief History - {patient.first_names} {patient.surname}
      </PageHeader>
      <p className='text-gray-600'>
        This is a tutorial demonstrating the brief medical history assessment. Indicate if the patient has any of these conditions.
      </p>
      <YesNoGrid title='Condition'>
        {COMMON_CONDITIONS.map((condition) => (
          <YesNoQuestion
            key={condition.key}
            name={`${condition.key}.existence`}
            required={condition.required}
            value={condition.key === 'pregnancy' && patient.sex === 'male' ? 'No' : conditions.value[condition.key] as Existence | undefined}
            label={condition.label}
            onChange={(value) => {
              conditions.value = {
                ...conditions.value,
                [condition.key]: value,
              }
            }}
          />
        ))}
      </YesNoGrid>
      <div className='flex justify-end mt-4'>
        <Button type='button'>
          Complete Tutorial<span aria-hidden='true'>&nbsp;&nbsp;&rarr;</span>
        </Button>
      </div>
    </div>
  )
}

export function TriageTutorial({ patient }: { patient: Patient }) {
  const progress = useSignal<TutorialProgress>({ type: 'warning_signs' })

  function goToBriefHistory() {
    progress.value = { type: 'brief_history' }
  }

  return (
    <div className='py-8 overflow-hidden bg-white'>
      <div className='px-6 mx-auto max-w-7xl'>
        <WarningSignsPage
          show={progress.value.type === 'warning_signs'}
          patient={patient}
          onNext={goToBriefHistory}
        />
        <BriefHistoryPage show={progress.value.type === 'brief_history'} patient={patient} />
      </div>
    </div>
  )
}
