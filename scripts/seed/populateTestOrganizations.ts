import db from '../../db/db.ts'
import { TEST_ORGANIZATION_UUIDS } from 'test/_helpers/organizations.ts'
import { addTestEmployee, TestEmployee } from '../../mocks/testEmployee.ts'
import { employees } from '../../db/models/employees.ts'
import { patient_encounters } from '../../db/models/patient_encounters.ts'
import { patient_findings } from '../../db/models/patient_findings.ts'
import { patient_presence } from '../../db/models/patient_presence.ts'
import { patient_workflows } from '../../db/models/patient_workflows.ts'
import { organization_rooms } from '../../db/models/organization_rooms.ts'
import { organizations } from '../../db/models/organizations.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import { completeAllStepsForTest, insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest } from 'test/_helpers/workflows.ts'
import generateUUID from '../../util/uuid.ts'
import { healthWorkerIdOfEmploymentId } from '../../db/models/health_worker_id.ts'
import { WORKFLOW_STEP_SNOMED_CONCEPTS } from '../../shared/workflow.ts'
import { EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS } from '../../shared/snomed_concepts.ts'
import { exists } from '../../util/exists.ts'

const CLINIC_ID = TEST_ORGANIZATION_UUIDS.ZA.clinic
const HOSPITAL_ID = TEST_ORGANIZATION_UUIDS.ZA.hospital

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type WorkflowState = 'awaiting_triage' | 'in_triage' | 'awaiting_consultation' | 'in_consultation'

type HistoricalEncounter = {
  organization_id: string
  days_ago: number
  duration_hours: number
  findings: string[]
}

type PatientNarrative = {
  first_names: string
  surname: string
  sex: 'male' | 'female'
  date_of_birth: string
  target_organization_id: string
  arrival_minutes_ago: number
  target_state: WorkflowState
  history: HistoricalEncounter[]
  current_findings: string[]
}

// ---------------------------------------------------------------------------
// Patient Narratives
// ---------------------------------------------------------------------------

const CLINIC_NARRATIVES: PatientNarrative[] = [
  {
    // C1 — Thabo: Diabetic with hypertension, penicillin allergy
    first_names: 'Thabo',
    surname: 'Ndlovu',
    sex: 'male',
    date_of_birth: '1981-03-15',
    target_organization_id: CLINIC_ID,
    arrival_minutes_ago: 55,
    target_state: 'awaiting_triage',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 730,
        duration_hours: 3,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
          '(clinical_finding (snomed_concept "Allergy to penicillin" "finding"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 365,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Essential hypertension" "disorder"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 90,
        duration_hours: 1,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
        ],
      },
    ],
    current_findings: [],
  },
  {
    // C2 — Nomsa: Asthmatic, presenting with cough
    first_names: 'Nomsa',
    surname: 'Dlamini',
    sex: 'female',
    date_of_birth: '1994-07-22',
    target_organization_id: CLINIC_ID,
    arrival_minutes_ago: 42,
    target_state: 'in_triage',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 540,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Asthma" "disorder"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 180,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Asthma" "disorder"))',
          '(clinical_finding (snomed_concept "Cough" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Cough" "finding"))',
      '(clinical_finding (snomed_concept "Dyspnea" "finding"))',
    ],
  },
  {
    // C3 — Sipho: Young man, sulfonamide allergy, abdominal pain
    first_names: 'Sipho',
    surname: 'Mkhize',
    sex: 'male',
    date_of_birth: '1998-01-10',
    target_organization_id: CLINIC_ID,
    arrival_minutes_ago: 30,
    target_state: 'awaiting_consultation',
    history: [
      {
        organization_id: HOSPITAL_ID,
        days_ago: 400,
        duration_hours: 4,
        findings: [
          '(clinical_finding (snomed_concept "Laceration of skin" "disorder"))',
          '(clinical_finding (snomed_concept "Allergy to sulfonamide" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
    ],
  },
  {
    // C4 — Zanele: Pregnant, routine prenatal visit
    first_names: 'Zanele',
    surname: 'Khumalo',
    sex: 'female',
    date_of_birth: '2002-05-30',
    target_organization_id: CLINIC_ID,
    arrival_minutes_ago: 18,
    target_state: 'in_consultation',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 120,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Pregnancy" "finding"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 60,
        duration_hours: 3,
        findings: [
          '(clinical_finding (snomed_concept "Pregnancy" "finding"))',
          '(clinical_finding (snomed_concept "Nausea" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Nausea" "finding"))',
    ],
  },
  {
    // C5 — Bongani: Elderly, heart disease + arthritis, chest pain
    first_names: 'Bongani',
    surname: 'Nkosi',
    sex: 'male',
    date_of_birth: '1964-11-02',
    target_organization_id: CLINIC_ID,
    arrival_minutes_ago: 8,
    target_state: 'in_triage',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 900,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Heart disease" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 500,
        duration_hours: 5,
        findings: [
          '(clinical_finding (snomed_concept "Heart disease" "disorder"))',
          '(clinical_finding (snomed_concept "Chest pain" "finding"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 150,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Arthritis" "disorder"))',
          '(clinical_finding (snomed_concept "Pain in lower limb" "finding"))',
        ],
      },
    ],
    current_findings: [],
  },
]

const HOSPITAL_NARRATIVES: PatientNarrative[] = [
  {
    // H1 — Lindiwe: Diabetes + HIV, fever
    first_names: 'Lindiwe',
    surname: 'Zulu',
    sex: 'female',
    date_of_birth: '1971-04-18',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 58,
    target_state: 'awaiting_triage',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 1000,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 600,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 200,
        duration_hours: 6,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
          '(clinical_finding (snomed_concept "Human immunodeficiency virus infection" "disorder"))',
        ],
      },
    ],
    current_findings: [],
  },
  {
    // H2 — Mandla: TB, persistent cough
    first_names: 'Mandla',
    surname: 'Shabalala',
    sex: 'male',
    date_of_birth: '1986-09-05',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 50,
    target_state: 'in_triage',
    history: [
      {
        organization_id: HOSPITAL_ID,
        days_ago: 300,
        duration_hours: 4,
        findings: [
          '(clinical_finding (snomed_concept "Tuberculosis" "disorder"))',
          '(clinical_finding (snomed_concept "Cough" "finding"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 120,
        duration_hours: 3,
        findings: [
          '(clinical_finding (snomed_concept "Tuberculosis" "disorder"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Cough" "finding"))',
      '(clinical_finding (snomed_concept "Chest pain" "finding"))',
    ],
  },
  {
    // H3 — Precious: Mental disorder, penicillin allergy, severe headache
    first_names: 'Precious',
    surname: 'Moyo',
    sex: 'female',
    date_of_birth: '1991-12-14',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 43,
    target_state: 'awaiting_consultation',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 800,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Mental disorder" "disorder"))',
          '(clinical_finding (snomed_concept "Allergy to penicillin" "finding"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 400,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Mental disorder" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 100,
        duration_hours: 5,
        findings: [
          '(clinical_finding (snomed_concept "Headache" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Headache" "finding"))',
    ],
  },
  {
    // H4 — Sizwe: COPD + heart disease, sulfonamide allergy, dyspnea
    first_names: 'Sizwe',
    surname: 'Buthelezi',
    sex: 'male',
    date_of_birth: '1956-06-20',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 37,
    target_state: 'in_consultation',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 1200,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Heart disease" "disorder"))',
          '(clinical_finding (snomed_concept "Allergy to sulfonamide" "finding"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 700,
        duration_hours: 3,
        findings: [
          '(clinical_finding (snomed_concept "Chronic obstructive pulmonary disease" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 300,
        duration_hours: 6,
        findings: [
          '(clinical_finding (snomed_concept "Heart disease" "disorder"))',
          '(clinical_finding (snomed_concept "Dyspnea" "finding"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 90,
        duration_hours: 4,
        findings: [
          '(clinical_finding (snomed_concept "Chronic obstructive pulmonary disease" "disorder"))',
          '(clinical_finding (snomed_concept "Chest pain" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Dyspnea" "finding"))',
    ],
  },
  {
    // H5 — Ayanda: Epilepsy, seizure episode
    first_names: 'Ayanda',
    surname: 'Ngcobo',
    sex: 'female',
    date_of_birth: '1997-08-11',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 32,
    target_state: 'awaiting_triage',
    history: [
      {
        organization_id: HOSPITAL_ID,
        days_ago: 500,
        duration_hours: 5,
        findings: [
          '(clinical_finding (snomed_concept "Epilepsy" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 150,
        duration_hours: 4,
        findings: [
          '(clinical_finding (snomed_concept "Epilepsy" "disorder"))',
          '(clinical_finding (snomed_concept "Seizure" "finding"))',
        ],
      },
    ],
    current_findings: [],
  },
  {
    // H6 — Thulani: Diabetes + hypertension, abdominal pain
    first_names: 'Thulani',
    surname: 'Cele',
    sex: 'male',
    date_of_birth: '1976-02-28',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 25,
    target_state: 'in_triage',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 800,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 400,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Essential hypertension" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 100,
        duration_hours: 4,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
          '(clinical_finding (snomed_concept "Essential hypertension" "disorder"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Abdominal pain" "finding"))',
      '(clinical_finding (snomed_concept "Nausea" "finding"))',
    ],
  },
  {
    // H7 — Nontobeko: Cancer, fatigue
    first_names: 'Nontobeko',
    surname: 'Mthembu',
    sex: 'female',
    date_of_birth: '1984-10-03',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 19,
    target_state: 'awaiting_consultation',
    history: [
      {
        organization_id: HOSPITAL_ID,
        days_ago: 400,
        duration_hours: 6,
        findings: [
          '(clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 150,
        duration_hours: 5,
        findings: [
          '(clinical_finding (snomed_concept "Malignant neoplastic disease" "disorder"))',
          '(clinical_finding (snomed_concept "Fatigue" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Fatigue" "finding"))',
    ],
  },
  {
    // H8 — Jabulani: No chronic conditions, knee injury
    first_names: 'Jabulani',
    surname: 'Zwane',
    sex: 'male',
    date_of_birth: '1993-03-25',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 14,
    target_state: 'in_consultation',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 600,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Sprain of ankle" "disorder"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Anterior knee pain" "finding"))',
    ],
  },
  {
    // H9 — Nosipho: Arthritis + diabetes, joint pain
    first_names: 'Nosipho',
    surname: 'Majola',
    sex: 'female',
    date_of_birth: '1968-01-16',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 7,
    target_state: 'awaiting_triage',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 900,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Arthritis" "disorder"))',
        ],
      },
      {
        organization_id: CLINIC_ID,
        days_ago: 500,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Diabetes mellitus" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 100,
        duration_hours: 3,
        findings: [
          '(clinical_finding (snomed_concept "Arthritis" "disorder"))',
          '(clinical_finding (snomed_concept "Pain in lower limb" "finding"))',
        ],
      },
    ],
    current_findings: [],
  },
  {
    // H10 — David: Asthma, worsening wheeze
    first_names: 'David',
    surname: 'Pretorius',
    sex: 'male',
    date_of_birth: '1979-07-09',
    target_organization_id: HOSPITAL_ID,
    arrival_minutes_ago: 3,
    target_state: 'awaiting_consultation',
    history: [
      {
        organization_id: CLINIC_ID,
        days_ago: 700,
        duration_hours: 2,
        findings: [
          '(clinical_finding (snomed_concept "Asthma" "disorder"))',
        ],
      },
      {
        organization_id: HOSPITAL_ID,
        days_ago: 200,
        duration_hours: 4,
        findings: [
          '(clinical_finding (snomed_concept "Asthma" "disorder"))',
          '(clinical_finding (snomed_concept "Wheezing" "finding"))',
        ],
      },
    ],
    current_findings: [
      '(clinical_finding (snomed_concept "Wheezing" "finding"))',
      '(clinical_finding (snomed_concept "Cough" "finding"))',
    ],
  },
]

const ALL_NARRATIVES: PatientNarrative[] = [...CLINIC_NARRATIVES, ...HOSPITAL_NARRATIVES]

// ---------------------------------------------------------------------------
// Phase 1: Close all open encounters at test organizations
// ---------------------------------------------------------------------------

async function closeAllOpenEncountersAtTestOrgs() {
  const open_encounters = await db
    .selectFrom('patient_encounters')
    .innerJoin('organizations', 'organizations.id', 'patient_encounters.organization_id')
    .where('organizations.is_test', '=', true)
    .where('patient_encounters.closed_at', 'is', null)
    .select(['patient_encounters.id', 'patient_encounters.patient_id'])
    .execute()

  if (open_encounters.length === 0) {
    console.log('  No open encounters to close.')
    return
  }

  const patient_ids = open_encounters.map((e) => e.patient_id)
  const encounter_ids = open_encounters.map((e) => e.id)

  // Clear employment_presence for employees with these patients
  await db.updateTable('employment_presence')
    .set({ with_patient_id: null })
    .where('with_patient_id', 'in', patient_ids)
    .execute()

  // Delete patient_presence
  await db.deleteFrom('patient_presence')
    .where('id', 'in', patient_ids)
    .execute()

  // Close all encounters
  await db.updateTable('patient_encounters')
    .set({ closed_at: new Date().toISOString() })
    .where('id', 'in', encounter_ids)
    .execute()

  console.log(`  Closed ${open_encounters.length} open encounter(s).`)
}

// ---------------------------------------------------------------------------
// Phase 2: Ensure staff at test organizations
// ---------------------------------------------------------------------------

type Staff = {
  clinic: {
    receptionist: TestEmployee
    nurses: TestEmployee[]
  }
  hospital: {
    receptionist: TestEmployee
    nurse: TestEmployee
    doctors: TestEmployee[]
  }
}

const HOSPITAL_DOCTOR_SPECIALTIES = [
  'EMERGENCY MEDICINE',
  'FAMILY MEDICINE',
  'OBSTETRICS AND GYNAECOLOGY',
  'PAEDIATRICS',
  'SURGERY',
  'CARDIOLOGY',
  'NEUROLOGY',
]

async function findOrCreateReceptionist(organization_id: string): Promise<TestEmployee> {
  const existing = await employees.findAll(db, { organization_id, roles: ['receptionist'] })
  if (existing.length > 0) return existing[0] as unknown as TestEmployee
  return addTestEmployee(db, { role: 'receptionist', organization_id })
}

async function ensureStaff(): Promise<Staff> {
  const clinic_receptionist = await findOrCreateReceptionist(CLINIC_ID)
  const hospital_receptionist = await findOrCreateReceptionist(HOSPITAL_ID)

  // Always create fresh test employees for active encounter assignments
  // so we never pick up real users (like the logged-in dev) and block them.
  // Created sequentially to avoid seniority_order conflicts.
  const clinic_nurses: TestEmployee[] = []
  for (const specialty of ['Primary care', 'Primary care', 'Triage']) {
    clinic_nurses.push(await addTestEmployee(db, { role: 'nurse', specialty, organization_id: CLINIC_ID }))
  }

  const hospital_nurse = await addTestEmployee(db, { role: 'nurse', specialty: 'Primary care', organization_id: HOSPITAL_ID })

  const hospital_doctors: TestEmployee[] = []
  for (const specialty of HOSPITAL_DOCTOR_SPECIALTIES) {
    hospital_doctors.push(await addTestEmployee(db, { role: 'doctor', specialty, organization_id: HOSPITAL_ID }))
  }

  console.log(`  Clinic: 1 receptionist, ${clinic_nurses.length} nurses`)
  console.log(`  Hospital: 1 receptionist, 1 nurse, ${hospital_doctors.length} doctors`)

  return {
    clinic: { receptionist: clinic_receptionist, nurses: clinic_nurses },
    hospital: { receptionist: hospital_receptionist, nurse: hospital_nurse, doctors: hospital_doctors },
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getOrgAndEmployment(organization_id: string, employment_id: string) {
  const [organization, health_worker] = await Promise.all([
    organizations.getById(db, organization_id),
    health_workers.getEmployed(db, {
      health_worker_id: healthWorkerIdOfEmploymentId(db, employment_id),
    }),
  ])
  const organization_employment = exists(
    health_worker.organizations.find((o) => o.id === organization_id),
  )
  return { organization, organization_employment }
}

function receptionistForOrg(staff: Staff, organization_id: string): TestEmployee {
  return organization_id === CLINIC_ID ? staff.clinic.receptionist : staff.hospital.receptionist
}

/** Returns a nurse or doctor that can serve as the encounter employee at the given org */
function triageEmployeeForOrg(staff: Staff, organization_id: string, index: number): TestEmployee {
  if (organization_id === CLINIC_ID) {
    return staff.clinic.nurses[index % staff.clinic.nurses.length]
  }
  return staff.hospital.nurse
}

function consultationDoctorForOrg(staff: Staff, organization_id: string, index: number): TestEmployee {
  if (organization_id === CLINIC_ID) {
    // At the clinic, nurses do consultations
    return staff.clinic.nurses[index % staff.clinic.nurses.length]
  }
  return staff.hospital.doctors[index % staff.hospital.doctors.length]
}

// ---------------------------------------------------------------------------
// Phase 3: Create a patient with historical encounters
// ---------------------------------------------------------------------------

async function createPatientWithHistory(
  narrative: PatientNarrative,
  staff: Staff,
) {
  const { first_names, surname, sex, date_of_birth, history } = narrative

  // Use the first historical encounter's org for patient creation
  const first_hist = history[0]
  const receptionist = receptionistForOrg(staff, first_hist.organization_id)

  // Create patient + first encounter via the test helper
  console.log(`  Creating ${first_names} ${surname}...`)
  const initial_encounter = await insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
    db,
    first_hist.organization_id,
    {
      employment_id: receptionist.employee_id,
      patient_demographics: {
        first_names,
        surname,
        name: `${first_names} ${surname}`,
        preferred_name: first_names,
        date_of_birth,
        sex,
      },
      is_tutorial: true,
    },
  )

  const patient_id = initial_encounter.patient.id

  // Insert findings for the first historical encounter
  if (first_hist.findings.length > 0) {
    await patient_findings.insertMany(db, {
      patient_id,
      patient_encounter_id: initial_encounter.patient_encounter_id,
      patient_encounter_employee_id: initial_encounter.employee.patient_encounter_employee_id,
      employment_id: initial_encounter.employee.employee_id,
      procedure: {
        create_with_specific_snomed_concept_id: EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS.id,
      },
      findings: first_hist.findings,
    })
  }

  // Close the first encounter
  await patient_encounters.close(db, {
    patient_encounter_id: initial_encounter.patient_encounter_id,
  })

  // Backdate the first encounter
  const first_created = new Date(Date.now() - first_hist.days_ago * 24 * 60 * 60 * 1000)
  const first_closed = new Date(first_created.getTime() + first_hist.duration_hours * 60 * 60 * 1000)
  await db.updateTable('patient_encounters')
    .set({ created_at: first_created.toISOString(), closed_at: first_closed.toISOString() })
    .where('id', '=', initial_encounter.patient_encounter_id)
    .execute()

  // Create additional historical encounters
  for (let i = 1; i < history.length; i++) {
    const hist = history[i]
    const hist_receptionist = receptionistForOrg(staff, hist.organization_id)
    const { organization, organization_employment } = await getOrgAndEmployment(
      hist.organization_id,
      hist_receptionist.employee_id,
    )

    const encounter_id = generateUUID()
    await patient_encounters.insertSeekingTreatmentForRegisteredPatient(
      db,
      organization,
      organization_employment,
      {
        patient_id,
        encounter: {
          create: true,
          to_create: { reason: 'seeking treatment' },
          patient_encounter_id: encounter_id,
        },
      },
    )

    // Fetch the encounter to get employee info for findings insertion
    const encounter = await patient_encounters.getById(db, encounter_id)

    // Insert findings
    if (hist.findings.length > 0) {
      await patient_findings.insertMany(db, {
        patient_id,
        patient_encounter_id: encounter_id,
        patient_encounter_employee_id: encounter.all_employees_seen[0].patient_encounter_employee_id,
        employment_id: encounter.all_employees_seen[0].employee_id,
        procedure: {
          create_with_specific_snomed_concept_id: EVALUATION_FOR_SIGNS_AND_SYMPTOMS_OF_PHYSICAL_HEALTH_PROBLEMS.id,
        },
        findings: hist.findings,
      })
    }

    // Close
    await patient_encounters.close(db, { patient_encounter_id: encounter_id })

    // Backdate
    const created = new Date(Date.now() - hist.days_ago * 24 * 60 * 60 * 1000)
    const closed = new Date(created.getTime() + hist.duration_hours * 60 * 60 * 1000)
    await db.updateTable('patient_encounters')
      .set({ created_at: created.toISOString(), closed_at: closed.toISOString() })
      .where('id', '=', encounter_id)
      .execute()
  }

  return patient_id
}

// ---------------------------------------------------------------------------
// Phase 4: Create open encounter and advance workflow state
// ---------------------------------------------------------------------------

// Track which triage/consultation employee index to use per org to avoid assigning
// the same employee to multiple patients simultaneously
const triage_employee_index: Record<string, number> = { [CLINIC_ID]: 0, [HOSPITAL_ID]: 0 }
const consultation_employee_index: Record<string, number> = { [CLINIC_ID]: 0, [HOSPITAL_ID]: 0 }

async function createOpenEncounter(
  patient_id: string,
  narrative: PatientNarrative,
  staff: Staff,
) {
  const { target_organization_id, arrival_minutes_ago, target_state, current_findings } = narrative
  const receptionist = receptionistForOrg(staff, target_organization_id)

  const { organization, organization_employment } = await getOrgAndEmployment(
    target_organization_id,
    receptionist.employee_id,
  )

  const encounter_id = generateUUID()
  await patient_encounters.insertSeekingTreatmentForRegisteredPatient(
    db,
    organization,
    organization_employment,
    {
      patient_id,
      encounter: {
        create: true,
        to_create: { reason: 'seeking treatment' },
        patient_encounter_id: encounter_id,
      },
    },
  )

  // Backdate arrival time
  const arrival_time = new Date(Date.now() - arrival_minutes_ago * 60 * 1000)
  await db.updateTable('patient_encounters')
    .set({ created_at: arrival_time.toISOString() })
    .where('id', '=', encounter_id)
    .execute()

  // Get encounter details for workflow manipulation
  const encounter = await patient_encounters.getById(db, encounter_id)

  if (target_state === 'awaiting_triage') {
    // Default state — nothing to do
    return
  }

  // For all other states, we need to advance through triage
  const triage_workflow = encounter.workflows.triage
  if (!triage_workflow) throw new Error('Expected triage workflow')
  const consultation_workflow = encounter.workflows.consultation
  if (!consultation_workflow) throw new Error('Expected consultation workflow')

  const triage_employee = triageEmployeeForOrg(staff, target_organization_id, triage_employee_index[target_organization_id])

  // Add the triage employee as having seen the patient
  const triage_pee_id = generateUUID()
  await db.insertInto('patient_encounter_employees')
    .values({
      id: triage_pee_id,
      patient_encounter_id: encounter_id,
      employment_id: triage_employee.employee_id,
    })
    .execute()

  if (target_state === 'in_triage') {
    triage_employee_index[target_organization_id]++

    // Move patient to triage room
    const triage_room = await organization_rooms.findFirstOptional(db, {
      organization_id: target_organization_id,
      department_name: 'Triage',
      is_available: true,
    })
    if (!triage_room) throw new Error('No available triage room')

    await patient_presence.set(db, patient_id, {
      department_name: 'Triage',
      current_workflow: 'triage',
      next_workflow: 'consultation',
      organization_room_id: triage_room.id,
    })

    // Start triage workflow
    await db.insertInto('patient_workflows_started')
      .values({
        patient_workflow_id: triage_workflow.patient_workflow_id,
        patient_encounter_employee_id: triage_pee_id,
      })
      .execute()

    // Mark employee as with patient
    await db.insertInto('employment_presence')
      .values({
        id: triage_employee.employee_id,
        at_work: true,
        with_patient_id: patient_id,
      })
      .onConflict((oc) =>
        oc.column('id').doUpdateSet({
          at_work: true,
          with_patient_id: patient_id,
        })
      )
      .execute()

    // Insert current findings if any
    if (current_findings.length > 0) {
      await patient_findings.insertMany(db, {
        patient_id,
        patient_encounter_id: encounter_id,
        patient_encounter_employee_id: triage_pee_id,
        employment_id: triage_employee.employee_id,
        procedure: {
          create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
        },
        findings: current_findings,
      })
    }

    return
  }

  // For awaiting_consultation and in_consultation, complete triage first
  // Start triage workflow
  await db.insertInto('patient_workflows_started')
    .values({
      patient_workflow_id: triage_workflow.patient_workflow_id,
      patient_encounter_employee_id: triage_pee_id,
    })
    .execute()

  // Insert current findings during triage
  if (current_findings.length > 0) {
    await patient_findings.insertMany(db, {
      patient_id,
      patient_encounter_id: encounter_id,
      patient_encounter_employee_id: triage_pee_id,
      employment_id: triage_employee.employee_id,
      procedure: {
        create_with_specific_snomed_concept_id: WORKFLOW_STEP_SNOMED_CONCEPTS.triage!.warning_signs.snomed_concept_id,
      },
      findings: current_findings,
    })
  }

  // Complete triage steps and workflow
  await completeAllStepsForTest(db, 'triage', triage_workflow.patient_workflow_id, true)
  await patient_workflows.completedWorkflow(db, {
    patient_workflow_id: triage_workflow.patient_workflow_id,
    patient_encounter_employee_id: triage_pee_id,
  })

  if (target_state === 'awaiting_consultation') {
    // Move patient back to waiting room
    await patient_presence.set(db, patient_id, {
      department_name: 'Waiting room',
      current_workflow: null,
      next_workflow: 'consultation',
      organization_room_id: exists(organization.waiting_room_id),
    })

    return
  }

  // in_consultation: start consultation
  const doctor = consultationDoctorForOrg(staff, target_organization_id, consultation_employee_index[target_organization_id])
  consultation_employee_index[target_organization_id]++

  // Find a consultation room (Primary care department)
  const consultation_room = await organization_rooms.findFirstOptional(db, {
    organization_id: target_organization_id,
    department_name: 'Primary care',
    is_available: true,
  })
  if (!consultation_room) throw new Error('No available Primary care room')

  // Add doctor as having seen the patient
  const consult_pee_id = generateUUID()
  await db.insertInto('patient_encounter_employees')
    .values({
      id: consult_pee_id,
      patient_encounter_id: encounter_id,
      employment_id: doctor.employee_id,
    })
    .execute()

  // Start consultation workflow
  await db.insertInto('patient_workflows_started')
    .values({
      patient_workflow_id: consultation_workflow.patient_workflow_id,
      patient_encounter_employee_id: consult_pee_id,
    })
    .execute()

  // Move patient to consultation room
  await patient_presence.set(db, patient_id, {
    department_name: 'Primary care',
    current_workflow: 'consultation',
    next_workflow: null,
    organization_room_id: consultation_room.id,
  })

  // Mark doctor as with patient
  await db.insertInto('employment_presence')
    .values({
      id: doctor.employee_id,
      at_work: true,
      with_patient_id: patient_id,
    })
    .onConflict((oc) =>
      oc.column('id').doUpdateSet({
        at_work: true,
        with_patient_id: patient_id,
      })
    )
    .execute()
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('Phase 1: Closing existing open encounters at test orgs...')
  await closeAllOpenEncountersAtTestOrgs()

  console.log('Phase 2: Ensuring staff...')
  const staff = await ensureStaff()

  console.log('Phase 3: Creating patients with history...')
  const patient_ids: string[] = []
  for (const narrative of ALL_NARRATIVES) {
    const patient_id = await createPatientWithHistory(narrative, staff)
    patient_ids.push(patient_id)
  }

  console.log('Phase 4: Creating open encounters...')
  for (let i = 0; i < ALL_NARRATIVES.length; i++) {
    const narrative = ALL_NARRATIVES[i]
    console.log(`  ${narrative.first_names} ${narrative.surname} → ${narrative.target_state}`)
    await createOpenEncounter(patient_ids[i], narrative, staff)
  }

  console.log('Done!')
}

if (import.meta.main) {
  await main()
  await db.destroy()
}
