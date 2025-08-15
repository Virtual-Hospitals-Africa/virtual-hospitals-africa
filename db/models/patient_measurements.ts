import { sql } from 'kysely'
import { MEASUREMENTS } from '../../shared/measurements.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'
import {
  Measurements,
  MeasurementsUpsert,
  PatientMeasurement,
  TrxOrDb,
  VitalX,
} from '../../types.ts'

export async function upsertVitals(
  trx: TrxOrDb,
  { input_measurements, patient_id, encounter_id, encounter_provider_id }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    input_measurements: MeasurementsUpsert[]
  },
) {
  const unseen_vitals = new Set(Object.keys(MEASUREMENTS))

  const patient_measurements: PatientMeasurement[] = input_measurements.map(
    (input_measurement) => {
      unseen_vitals.delete(input_measurement.measurement_name)
      return {
        patient_id,
        encounter_id,
        encounter_provider_id,
        measurement_name: input_measurement
          .measurement_name as keyof Measurements,
        is_flagged: input_measurement.is_flagged,
        value: input_measurement.value!,
      }
    },
  )

  const removing_vitals = trx.deleteFrom('patient_measurements')
    .where('patient_id', '=', patient_id)
    .where('encounter_id', '=', encounter_id)
    .where('measurement_name', 'in', [...unseen_vitals])
    .execute()

  const updating_vitals = patient_measurements.length && trx
    .insertInto('patient_measurements')
    .values(patient_measurements)
    .onConflict((oc) =>
      oc.constraint('one_measurement_per_encounter').doUpdateSet((eb) => ({
        value: eb.ref('excluded.value'),
        is_flagged: eb.ref('excluded.is_flagged'),
      }))
    )
    .execute()

  await Promise.all([removing_vitals, updating_vitals])
}

export async function getEncounterVitals(
  trx: TrxOrDb,
  { patient_id, encounter_id }: {
    patient_id: string
    encounter_id: string | 'open'
  },
): Promise<VitalX[]> {
  const this_encounter_measurement_rows = await trx
    .selectFrom('patient_measurements')
    .innerJoin(
      'measurements',
      'measurements.name',
      'patient_measurements.measurement_name',
    )
    .where('patient_measurements.patient_id', '=', patient_id)
    .where('patient_measurements.encounter_id', '=', encounter_id)
    .select([
      'measurement_name',
      'patient_measurements.value',
      'measurements.units',
      'patient_measurements.is_flagged',
    ]).execute()

  const most_recent_not_this_encounter_measurement_rows = await trx
    .selectFrom('patient_measurements')
    .innerJoin(
      'measurements',
      'measurements.name',
      'patient_measurements.measurement_name',
    )
    .where('patient_measurements.patient_id', '=', patient_id)
    .where('patient_measurements.encounter_id', '!=', encounter_id)
    .select([
      'measurement_name',
      sql<number>`max(patient_measurements.created_at)`.as('max_created_at'),
    ])
    .groupBy('measurement_name')
    .execute()

  const most_recent_not_this_encounter_measurement_values = await trx
    .selectFrom('patient_measurements')
    .innerJoin(
      'measurements',
      'measurements.name',
      'patient_measurements.measurement_name',
    )
    .where('patient_measurements.patient_id', '=', patient_id)
    .where('patient_measurements.encounter_id', '!=', encounter_id)
    .select([
      'measurement_name',
      'patient_measurements.value',
      'patient_measurements.is_flagged',
      'patient_measurements.created_at',
    ])
    .where((eb) =>
      eb.or(
        most_recent_not_this_encounter_measurement_rows.map((
          { measurement_name, max_created_at },
        ) =>
          eb.and([
            eb('patient_measurements.measurement_name', '=', measurement_name),
            eb(
              'patient_measurements.created_at',
              '=',
              new Date(max_created_at),
            ),
          ])
        ),
      )
    )
    .execute()

  const vitals = [
    'height',
    'weight',
    'temperature',
    // 'blood_pressure_diastolic',
    // 'blood_pressure_systolic',
    'blood_oxygen_saturation',
    'blood_glucose',
    'pulse',
    'respiratory_rate',
    'midarm_circumference',
    'triceps_skinfold',
  ]

  return vitals.map((vital) => {
    const this_encounter = this_encounter_measurement_rows.find((x) =>
      x.measurement_name === vital
    )
    const last_known = most_recent_not_this_encounter_measurement_values.find(
      (x) => x.measurement_name === vital,
    )
    const measurement: VitalX = {
      vital_name: vital,
      snomed_code: VITALS_SNOMED_CODE[vital as keyof Measurements],

      is_flagged: this_encounter?.is_flagged || false,
      measurements: this_encounter
        ? [{
          measurement_name: this_encounter.measurement_name,
          value: parseFloat(this_encounter.value),
          units: this_encounter.units,
          is_flagged: !!this_encounter.is_flagged,
        }]
        : [],
      last_known: last_known
        ? [{
          value: parseFloat(last_known.value),
          created_at: last_known.created_at,
        }]
        : [],
    }

    return measurement;
  })
}

// Observations <=> Vitals


// Procedure <- Taking Height Measurement
/*

* Required
height                    [   ]
weight                    [   ]
BMI                       [   ]
-------------------
blood pressure: systolic  [   ]
blood pressure: diastolic [   ]
-------------------


*/


// Theoretical Observations Table

// One table for actions
// one table for inferences
// one table for observations

// getAllPatientEverything(patientId) => observations, inferences, actions

// getActionValues(patient_id, action_snomed_code)




// Action: Taking patient vital signs (61746007)
// Action: Row for procedure blood pressure taking (46973005) <- points to taking patient vital signs
// Observation: Row for observable entity blood pressure (75367002) points to action above
// Observation: Row for observable entity systolic blood pressure (75367003) points to action above, also points to blood pressure
// Observation: Row for observable entity diastolic blood pressure (753670045) points to action above, also points to blood pressure

// Logging data:
// id-123 75367002 display: '120 / 80'
// id-123 75367003 value '120' (referrant)
// id-124 75367045  '80' (referrant)


/* Blood Pressure          Diastolic 📬
   120 / 80 mmHg           Systolic 📬

*/


/*
  Vitals Form: Array of SnoMed action codes
  [
    '12781278871',
    '128912',
    'ffff'
  ]
    
  SnoMed dictionary: pulled from SnoMed once a year?
  {
    '12781278871': {
      display: 'height',
      unit: 'cm'
    }
    '128912': {
      display: 'Systolic',
      unit: 'mmHg'
    },
    'ffff': {
      display: 'Diastolic',
      unit: 'mmHg'
    }
  }

  Would yeild:
  height:                   [   cm    ]
  blood pressure: systolic  [   mmHg  ]
  blood pressure: diastolic [   mmHg  ]

*/


// getPatientActionValues(patient_id, 61746007) =>
//   []

// getMostRecentPatientActionValues(patient_id, 61746007) =>
//   []

// getThisEncounterPatientActionValues(patient_id, 61746007) =>
//   []

// getWholePatientRecord(patient_id) => record { actions, inferences, observations }

// getFormStructureForActionDuringActiveEncounter(patient_record, 61746007)




getObservedValue(patient_record, 'age')


// Adult
const Actions = [
  {
    label: 'Measuring height of patient',
    snomed_code: 14456009,
    required: true,
    observations: [
      {
        label: 'Standing height',
        snomed_code: 248333004,
        units: 'cm'
      }
    ],
  },
  {
    label: 'Taking arterial blood pressure',
    snomed_code: 40594005,
    observations: [
      {
        label: 'Systolic blood pressure',
        snomed_code: 271649006,
        units: 'mmHg'
      },
      {
        label: 'Diastolic blood pressure',
        snomed_code: 271650006,
        units: 'mmHg'
      },
    ]
  }
]

// ON SAVE
// COMPUTE_OBSERVATIONS = {
  40594005: (patient_observation) => {
    Systolic = getObservation(271649006)
    Diastolic = getObservation(271650006)
    return [
      {
        label: "blood pressure",
        snomed_code: 10920912,
        value: `${Systolic} / ${Diastolic}`
      }
    ]
  }
// }




// Give me all the records for this encounter for each of these codes
// Give me all the records for the last encounter for each of these codes

// {
//   "(blood pressure) 12781278871": (patient_observations) => {
//     const systolic = findObservation(patient_observations, "systolic (128912)")
//     const diastolic = findObservation(patient_observations, "diastolic (ffff)")
//     return `${systolic} / ${diastolic}`
//   },
//   "(BMI)"
// }

// action <- display (string)
// observation <- value (number)

// to save observations 


// BMI & Blood pressure (parent) are computed observations

