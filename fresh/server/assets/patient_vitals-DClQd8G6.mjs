import { bN as asText, bO as now, bM as vitalMeasurementFromSnomedConceptId, bP as VITAL_MEASUREMENTS_UNITS, aU as base, bQ as formatRecord, bz as patient_findings, m as assert, U as completedPersonal, aI as sql, aV as jsonObjectFrom, bR as patient_encounter_employees, bk as partition, bS as isMeasurement, bT as assertArrayEmpty, a2 as promiseProps } from "../server-entry.mjs";
const clinical_measurement_requirements = {
  /**
   * Determines required measurements for a patient based on age and medical conditions
   * Pure function that combines age-based and condition-based requirements
   */
  async determineMeasurementsForPatient(trx, {
    age_days,
    active_condition_snomed_codes
  }) {
    const age_requirements = await getAgeMeasurementRequirements(trx, age_days);
    const condition_requirements = await getConditionMeasurementRequirements(trx, active_condition_snomed_codes);
    const all_requirements = [...age_requirements, ...condition_requirements];
    const merged_measurements = mergeMeasurementRequirements(all_requirements);
    return {
      measurements: merged_measurements,
      applied_requirements: all_requirements,
      audit_info: {
        age_based_count: age_requirements.length,
        condition_based_count: condition_requirements.length,
        total_requirements: all_requirements.length
      }
    };
  }
};
async function getAgeMeasurementRequirements(trx, age_days) {
  const requirements = await trx.selectFrom("age_measurement_requirements").select((eb) => [asText(eb, "required_measurement_snomed_concept_id").as("snomed_concept_id"), "is_required", "clinical_rationale", "medical_standard"]).where("active", "=", true).where((eb) => eb.or([eb("age_min_days", "is", null), eb("age_min_days", "<=", age_days)])).where((eb) => eb.or([eb("age_max_days", "is", null), eb("age_max_days", ">=", age_days)])).where("effective_date", "<=", now).where((eb) => eb.or([eb("expiration_date", "is", null), eb("expiration_date", ">", now)])).execute();
  return requirements.map((requirement) => ({
    vital: vitalMeasurementFromSnomedConceptId(requirement.snomed_concept_id),
    ...requirement
  }));
}
async function getConditionMeasurementRequirements(trx, condition_snomed_codes) {
  if (condition_snomed_codes.length === 0) {
    return [];
  }
  const requirements = await trx.selectFrom("condition_measurement_requirements").select((eb) => [asText(eb, "required_measurement_snomed_concept_id").as("snomed_concept_id"), "is_required", "clinical_rationale", "medical_standard", "frequency_recommendation"]).where("condition_snomed_concept_id", "in", condition_snomed_codes.map((code) => code)).where("active", "=", true).where("effective_date", "<=", now).where((eb) => eb.or([eb("expiration_date", "is", null), eb("expiration_date", ">", now)])).execute();
  return requirements.map((req) => ({
    snomed_concept_id: req.snomed_concept_id,
    is_required: req.is_required,
    clinical_rationale: req.clinical_rationale,
    medical_standard: req.medical_standard,
    frequency_recommendation: req.frequency_recommendation || void 0
  }));
}
function mergeMeasurementRequirements(requirements) {
  const requirements_map = /* @__PURE__ */ new Map();
  for (const requirement of requirements) {
    const existing = requirements_map.get(requirement.snomed_concept_id);
    if (!existing) {
      requirements_map.set(requirement.snomed_concept_id, requirement);
    } else {
      const should_replace = requirement.frequency_recommendation && !existing.frequency_recommendation || requirement.medical_standard > existing.medical_standard;
      if (should_replace) {
        requirements_map.set(requirement.snomed_concept_id, requirement);
      }
    }
  }
  return Array.from(requirements_map.values()).map((requirement) => {
    const vital = vitalMeasurementFromSnomedConceptId(requirement.snomed_concept_id);
    return {
      vital,
      snomed_concept_id: requirement.snomed_concept_id,
      required: true,
      units: VITAL_MEASUREMENTS_UNITS[vital]
    };
  });
}
const patient_vitals = base({
  top_level_table: "patient_findings",
  baseQuery: patient_findings.baseQuery,
  formatResult: formatRecord,
  async getMostRecent(trx, {
    measurement_snomed_concept_ids,
    assessment_snomed_concept_ids,
    ...args
  }) {
    const {
      measurements,
      assessments
    } = await promiseProps({
      measurements: patient_vitals.getMostRecentMeasurements(trx, {
        ...args,
        snomed_concept_ids: measurement_snomed_concept_ids
      }),
      assessments: patient_vitals.getMostRecentAssessments(trx, {
        ...args,
        snomed_concept_ids: assessment_snomed_concept_ids
      })
    });
    return {
      measurements,
      assessments,
      all: [...measurements, ...assessments]
    };
  },
  async getMostRecentMeasurements(trx, {
    health_worker_id,
    patient_id,
    patient_encounter_id,
    excluding_patient_encounter_id,
    snomed_concept_ids
  }) {
    const findings = await getMostRecent();
    const formatted = findings.map(formatRecord);
    const [measurements, rest] = partition(formatted, isMeasurement);
    assertArrayEmpty(rest);
    return measurements;
    function getMostRecent() {
      return trx.with("ranked_findings", (qb) => patient_findings.baseQuery(qb, {
        patient_id,
        patient_encounter_id,
        excluding_patient_encounter_id
      }).where("patient_records_aggregated.specific_snomed_concept_id", "in", snomed_concept_ids).select(sql`ROW_NUMBER() OVER (PARTITION BY patient_records_aggregated.specific_snomed_concept_id ORDER BY patient_records_aggregated.created_at DESC)`.as("rank")).orderBy("patient_records_aggregated.created_at", "desc")).selectFrom("ranked_findings").where("ranked_findings.rank", "=", 1).selectAll("ranked_findings").select((eb) => [jsonObjectFrom(patient_encounter_employees.baseQuery(trx, {}).where("patient_encounter_employees.id", "=", eb.ref("ranked_findings.patient_encounter_employee_id")).select((eb_employees) => [eb_employees("health_workers.id", "=", health_worker_id).as("is_me")])).$notNull().as("provider")]).execute();
    }
  },
  async getMostRecentAssessments(trx, {
    health_worker_id,
    patient_id,
    patient_encounter_id,
    excluding_patient_encounter_id,
    snomed_concept_ids
  }) {
    return (await getMostRecent()).map(formatRecord);
    function getMostRecent() {
      return trx.with("ranked_findings", (qb) => patient_findings.baseQuery(qb, {
        patient_id,
        patient_encounter_id,
        excluding_patient_encounter_id
      }).innerJoin("patient_evaluations", "patient_evaluations.evaluates_record_id", "patient_findings.id").innerJoin("patient_records as evaluation_records", "evaluation_records.id", "patient_evaluations.id").where("evaluation_records.specific_snomed_concept_id", "in", snomed_concept_ids).select(sql`ROW_NUMBER() OVER (PARTITION BY evaluation_records.specific_snomed_concept_id ORDER BY patient_records_aggregated.created_at DESC)`.as("rank")).orderBy("patient_records_aggregated.created_at", "desc")).selectFrom("ranked_findings").where("ranked_findings.rank", "=", 1).selectAll("ranked_findings").select((eb) => [jsonObjectFrom(patient_encounter_employees.baseQuery(trx, {}).where("patient_encounter_employees.id", "=", eb.ref("ranked_findings.patient_encounter_employee_id")).select((eb_employees) => [eb_employees("health_workers.id", "=", health_worker_id).as("is_me")])).$notNull().as("provider")]).execute();
    }
  },
  async measurementsNeededForTriageEncounter(trx, patient_record, active_condition_snomed_codes) {
    assert(completedPersonal(patient_record));
    const requirements_result = await clinical_measurement_requirements.determineMeasurementsForPatient(trx, {
      patient_id: patient_record.id,
      age_days: patient_record.age_days ?? 0,
      sex: patient_record.sex,
      active_condition_snomed_codes,
      pregnancy_status: active_condition_snomed_codes.includes("77386006")
    });
    return requirements_result.measurements;
  }
});
export {
  patient_vitals as p
};
