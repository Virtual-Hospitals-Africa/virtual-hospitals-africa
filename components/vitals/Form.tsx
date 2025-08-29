import { HiddenInput } from "../../components/library/HiddenInput.tsx";
import { TextInput } from "../../islands/form/Inputs.tsx";
import { LocalTime } from "../../islands/LocalTime.tsx";
import {
  Maybe,
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from "../../types.ts";
import capitalize from "../../util/capitalize.ts";
import { Label } from "../library/Label.tsx";

function VitalInput({
  vital,
  most_recent_patient_finding,
}: {
  vital: VitalMeasurementFormInputDefition;
  most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>;
}) {
  const name = `findings.${vital.finding_id}`;

  return (
    <div className="flex justify-between w-full mb-1">
      <div>
        <Label label={capitalize(vital.label)} />
        {most_recent_patient_finding && (
          <div className="flex text-gray-500">
            <a href="#" className="text-blue-500">
              {most_recent_patient_finding.value_display}
            </a>
            &nbsp;
            <LocalTime timestamp={most_recent_patient_finding.created_at} />
          </div>
        )}
      </div>
      <div className="min-w-30 max-w-30">
        <TextInput
          inputmode="numeric"
          required={vital.required}
          name={`${name}.value`}
          label={null}
          value={null}
          className="col-start-6 justify-end"
          min={0}
          suffix={vital.units}
        />
        {/* <CheckboxInput
          name={`${name}.is_flagged`}
          label={null}
          checked={on.value}
          className='hidden'
        /> */}
        <HiddenInput
          name={`${name}.snomed_concept_id`}
          value={vital.snomed_concept_id}
        />
        <HiddenInput name={`${name}.units`} value={vital.units} />
      </div>
      {/* <HiddenInput
        name={`${name}.is_flagged`}
        value={on.value ? true : false}
      /> */}
    </div>
  );
}

export function VitalsForm({
  vital_measurements_for_this_encounter,
  most_recent_patient_vitals,
}: {
  vital_measurements_for_this_encounter: VitalMeasurementFormInputDefition[];
  most_recent_patient_vitals: MostRecentVitalMeasurement[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {vital_measurements_for_this_encounter.map((vital) => (
        <VitalInput
          vital={vital}
          most_recent_patient_finding={most_recent_patient_vitals.find(
            (patient_vital) =>
              patient_vital.snomed_concept_id === vital.snomed_concept_id
          )}
        />
      ))}
    </div>
  );
}
