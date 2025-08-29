import { HiddenInput } from "../../components/library/HiddenInput.tsx";
import { TextInput } from "../../islands/form/Inputs.tsx";
import {
  Maybe,
  MostRecentVitalMeasurement,
  VitalMeasurementFormInputDefition,
} from "../../types.ts";
import capitalize from "../../util/capitalize.ts";

function VitalInput({
  vital,
  most_recent_patient_finding,
}: {
  vital: VitalMeasurementFormInputDefition;
  most_recent_patient_finding: Maybe<MostRecentVitalMeasurement>;
}) {
  const name = `findings.${vital.finding_id}`;
  console.log(most_recent_patient_finding);
  // const on = useSignal(vitals.is_flagged || false)
  // const [vitalsValue, setVitalsValue] = useState(vitals.value)

  // const vital_description = computed(() => {
  //   return measurement
  // })

  // TODO use this
  // most_recent_patient_finding?.value_display

  return (
    <div className="flex justify-between w-full">
      <div className="flex flex-row gap-2">
        {/* <VitalsFlag
          on={on.value}
          toggle={toggle}
          description={vital_description.value}
        /> */}
        {/* <div className='align-middle'>
        </div> */}
        <span class="flex items-center">
          {capitalize(vital.label)}
          {vital.required && <sup>*</sup>}
        </span>
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
