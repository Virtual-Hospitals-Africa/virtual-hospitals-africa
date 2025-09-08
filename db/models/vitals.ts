import * as patient_measurements from "./patient_measurements.ts";
import * as patient_computed_findings from "./patient_computed_findings.ts";
import {
  Measurement,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from "../../types.ts";
import generateUUID from "../../util/uuid.ts";
import {
  TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE,
  VITALS_SNOMED_CODE,
  VITALS_UNITS,
} from "../../shared/vitals.ts";

// TODO
type PatientRecord = unknown;

export function insertMeasurements(
  trx: TrxOrDb,
  opts: {
    patient_id: string;
    encounter_id: string;
    encounter_provider_id: string;
    input_measurements: Measurement[];
  },
): Promise<{ success: true; procedure_id: string | null }> {
  return patient_measurements.insertMany(trx, {
    ...opts,
    procedure: {
      create_from_snomed_concept_id: TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE,
    },
  });
}

// deno-lint-ignore require-await
export async function measurementsNeededForEncounter(
  _trx: TrxOrDb,
  _patient_record: PatientRecord,
): Promise<VitalMeasurementFormInputDefition[]> {
  // Returning just adult values for now
  return [
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.height,
      required: true,
      label: "height",
      units: VITALS_UNITS.height,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.weight,
      required: true,
      label: "weight",
      units: VITALS_UNITS.weight,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.temperature,
      required: true,
      label: "temperature",
      units: VITALS_UNITS.temperature,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_diastolic,
      required: true,
      label: "blood_pressure_diastolic",
      units: VITALS_UNITS.blood_pressure_diastolic,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure_systolic,
      required: true,
      label: "blood_pressure_systolic",
      units: VITALS_UNITS.blood_pressure_systolic,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.blood_oxygen_saturation,
      required: true,
      label: "blood_oxygen_saturation",
      units: VITALS_UNITS.blood_oxygen_saturation,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.blood_glucose,
      required: true,
      label: "blood_glucose",
      units: VITALS_UNITS.blood_glucose,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.pulse,
      required: true,
      label: "pulse",
      units: VITALS_UNITS.pulse,
    },
    {
      finding_id: generateUUID(),
      snomed_concept_id: VITALS_SNOMED_CODE.respiratory_rate,
      required: true,
      label: "respiratory_rate",
      units: VITALS_UNITS.respiratory_rate,
    },
  ];
}

export async function computeAndInsertDerivedMeasurements(
  trx: TrxOrDb,
  {
    patient_id,
    encounter_id,
    encounter_provider_id,
    source_measurements,
    source_procedure_id,
  }: {
    patient_id: string;
    encounter_id: string;
    encounter_provider_id: string;
    source_measurements: Measurement[];
    source_procedure_id: string;
  },
): Promise<{ success: true; computed_findings: string[] }> {
  const measurements = new Map(
    source_measurements.map((m) => [m.snomed_concept_id, m]),
  );

  const computed_findings: string[] = [];

  // Validate required input measurements exist
  if (source_measurements.length === 0) {
    return { success: true as const, computed_findings };
  }

  // BMI Calculation
  const height_measurement = measurements.get(VITALS_SNOMED_CODE.height);
  const weight_measurement = measurements.get(VITALS_SNOMED_CODE.weight);

  if (
    height_measurement &&
    weight_measurement &&
    height_measurement.value &&
    weight_measurement.value &&
    height_measurement.value > 0 &&
    weight_measurement.value > 0
  ) {
    const height_m = height_measurement.value / 100; // Convert cm to m

    const bmi = weight_measurement.value / (height_m * height_m);

    const bmi_result = await patient_computed_findings.insertComputedFinding(
      trx,
      {
        patient_id,
        encounter_id,
        encounter_provider_id,
        procedure_id: source_procedure_id,
        snomed_concept_id: VITALS_SNOMED_CODE.bmi,
        value: Math.round(bmi * 10) / 10, // Round to 1 decimal place
        units: VITALS_UNITS.bmi,
        algorithm_version: "BMI_v1.0",
        computation_metadata: {
          formula: "weight_kg / (height_m^2)",
          height_m,
          weight_kg: weight_measurement.value,
        },
        input_measurements: [
          { record_id: height_measurement.finding_id },
          { record_id: weight_measurement.finding_id },
        ],
      },
    );
    computed_findings.push(bmi_result.computed_finding_id);
  }

  // Mean Arterial Pressure (MAP) calculation
  const systolic_measurement = measurements.get(
    VITALS_SNOMED_CODE.blood_pressure_systolic,
  );
  const diastolic_measurement = measurements.get(
    VITALS_SNOMED_CODE.blood_pressure_diastolic,
  );

  if (
    systolic_measurement &&
    diastolic_measurement &&
    systolic_measurement.value &&
    diastolic_measurement.value &&
    systolic_measurement.value > 0 &&
    diastolic_measurement.value > 0
  ) {
    const map =
      diastolic_measurement.value +
      (systolic_measurement.value - diastolic_measurement.value) / 3;

    const map_result = await patient_computed_findings.insertComputedFinding(
      trx,
      {
        patient_id,
        encounter_id,
        encounter_provider_id,
        procedure_id: source_procedure_id,
        snomed_concept_id: VITALS_SNOMED_CODE.mean_arterial_pressure,
        value: Math.round(map),
        units: VITALS_UNITS.mean_arterial_pressure,
        algorithm_version: "MAP_v1.0",
        computation_metadata: {
          formula: "diastolic + (systolic - diastolic) / 3",
          systolic_mmhg: systolic_measurement.value,
          diastolic_mmhg: diastolic_measurement.value,
        },
        input_measurements: [
          {
            record_id: systolic_measurement.finding_id,
          },
          {
            record_id: diastolic_measurement.finding_id,
          },
        ],
      },
    );
    computed_findings.push(map_result.computed_finding_id);
  }

  // Blood Pressure composite display (systolic/diastolic format)
  if (
    systolic_measurement &&
    diastolic_measurement &&
    systolic_measurement.value &&
    diastolic_measurement.value &&
    systolic_measurement.value > 0 &&
    diastolic_measurement.value > 0
  ) {
    const bp_display = `${systolic_measurement.value}/${diastolic_measurement.value} mmHg`;

    const bp_result = await patient_computed_findings.insertComputedFinding(
      trx,
      {
        patient_id,
        encounter_id,
        encounter_provider_id,
        procedure_id: source_procedure_id,
        snomed_concept_id: VITALS_SNOMED_CODE.blood_pressure,
        value_display: bp_display,
        algorithm_version: "BP_v1.0",
        computation_metadata: {
          format: "systolic/diastolic mmHg",
          systolic_mmhg: systolic_measurement.value,
          diastolic_mmhg: diastolic_measurement.value,
        },
        input_measurements: [
          {
            record_id: systolic_measurement.finding_id,
          },
          {
            record_id: diastolic_measurement.finding_id,
          },
        ],
      },
    );
    computed_findings.push(bp_result.computed_finding_id);
  }

  return { success: true as const, computed_findings };
}
