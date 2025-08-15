import Card from "../../components/library/Card.tsx";
import SectionHeader from "../../components/library/typography/SectionHeader.tsx";
import { VitalX } from "../../types.ts";
import { UnitInput } from "../form/Inputs.tsx";

const patientObservations = [
  { id: "1", code: "asdf", value: 60, serverityLevel: 0, note: null },
  { id: "2", code: "qwer", value: 55, serverityLevel: 0, note: null },
  { id: "3", code: "zxcv", value: 80, serverityLevel: 0, note: "Great job!" },
];

const vitalsForm = [
  { code: "asdf", is_required: false },
  { code: "qwer", is_required: true },
];

const codeDictionary = {
  asdf: { display: "Standing Height", unit: "cm" },
  qewr: { display: "Standing Weight", unit: "kg" },
  zxcv: { display: "Sitting Heartrate", unit: "BPM" },
};

vitalsForm.map((vital) => (
  <div>
    <label>{codeDictionary[vital].display}</label>
    <input
      placeholder={
        patientObservations.findOne((o) => o.code === vital) +
        codeDictionary[vital].unit
      }
    ></input>
  </div>
));

export type VitalCard = {
  title: string;
  sections: MeasurementX[][];
};

export type MeasurementX = {
  label: string;
  name: string;
  required: boolean;
  measurements: Array<{ name: string; units: string }>;
};

export function VitalsForm({
  cards,
  patient_vitals,
}: {
  cards: VitalCard[];
  patient_vitals: VitalX[];
}) {
  return (
    <div className="flex flex-col gap-1">
      {cards.map((card) => (
        <Card className="flex flex-col gap-1" orientation="vertical">
          <SectionHeader>{card.title}</SectionHeader>
          {card.sections.map((section) =>
            section.map((measurement_row) => {
              return (
                // Measurement Row
                <div>
                  {measurement_row.label}
                  {/* Last Known */}
                  {/* Intersperse with a slash */}

                  {measurement_row.measurements.map((measurement) => {
                    const patient_vital = patient_vitals.find(
                      (vital) => vital.vital === measurement.name
                    );

                    return (
                      <UnitInput
                        required={measurement_row.required}
                        name={`${measurement.name}.value`}
                        label={null}
                        value={patient_measurement?.value}
                        className="col-start-6 justify-end"
                        min={0}
                        units={measurement.units}
                      />
                    );
                  })}

                  {/* <CheckboxInput
                    name={`${measurement_row.name}.is_flagged`}
                    value={measurement_row.is_flagged}
                  /> */}

                  {/* Flag */}
                </div>
              );
            })
          )}
        </Card>
      ))}
    </div>
  );
}

// type NormalVitalInput = Exclude<keyof typeof VitalsIcons, "blood_pressure">;

// const required_inputs: NormalVitalInput[] = [];

// const all_inputs: NormalVitalInput[] = [
//   "height",
//   "weight",
//   "temperature",
//   "blood_oxygen_saturation",
//   "blood_glucose",
//   "pulse",
//   "respiratory_rate",
//   "blood_pressure_systolic",
//   "blood_pressure_diastolic",
// ];

// function VitalInput({
//   required,
//   label,
//   units,
//   name,
//   value,
//   is_flagged,
//   last_known,
// }: {
//   required?: boolean;
//   label: string;
//   units: string;
//   name: string;
//   value?: number;
//   is_flagged?: boolean;
//   last_known?: LastKnown;
// }) {
//   return (
//     <div className="flex justify-between w-full">
//       <div className="flex flex-row gap-2">
//         <span class="flex items-center">
//           {label}
//           {required && <sup>*</sup>}
//         </span>
//       </div>
//       <div className="min-w-30 max-w-30">
//         <UnitInput
//           required={required}
//           name={`${name}.value`}
//           label={null}
//           value={value}
//           className="col-start-6 justify-end"
//           min={0}
//           units={units}
//         />
//         {/* <VitalsFlag
//           on={on.value}
//           toggle={toggle}
//           description={vital_description.value}
//         /> */}
//         {/* <HiddenInput name={`${name}.measurement_name`} value={measurement} /> */}
//       </div>
//       {/* <CheckboxInput
//         name={`${name}.is_flagged`}
//         label={null}
//         checked={on.value}
//         className="hidden"
//       /> */}
//       {/* <HiddenInput
//         name={`${name}.is_flagged`}
//         value={on.value ? true : false}
//       /> */}
//     </div>
//   );
// }
