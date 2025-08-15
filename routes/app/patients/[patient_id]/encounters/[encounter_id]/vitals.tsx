import { z } from "zod";
import * as patient_measurements from "../../../../../../db/models/patient_measurements.ts";
import { VitalsForm } from "../../../../../../islands/vitals/Form.tsx";
import {
  LoggedInHealthWorkerHandler,
  MeasurementsUpsert,
} from "../../../../../../types.ts";
import { getRequiredUUIDParam } from "../../../../../../util/getParam.ts";
import { parseRequest } from "../../../../../../util/parseForm.ts";
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from "./_middleware.tsx";

const VitalUpsertSchema = z.object({
  measurement_name: z.string(),
  value: z.number().positive().optional(),
  is_flagged: z.boolean().optional().default(false),
});

const VitalsMeasurementsSchema = z.object({
  measurements: z
    .array(VitalUpsertSchema)
    .transform((measurements) => {
      const measurements_with_values: MeasurementsUpsert[] = [];
      for (const { value, is_flagged, measurement_name } of measurements) {
        if (value) {
          measurements_with_values.push({
            value,
            measurement_name,
            is_flagged,
          });
        }
      }
      return measurements_with_values;
    })
    .optional()
    .default([]),
});

export const handler: LoggedInHealthWorkerHandler<EncounterContext> = {
  async POST(req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx);

    const { measurements } = await parseRequest(
      ctx.state.trx,
      req,
      VitalsMeasurementsSchema.parse
    );

    const patient_id = getRequiredUUIDParam(ctx, "patient_id");

    await patient_measurements.upsertVitals(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      input_measurements: measurements,
    });

    return completing_step;
  },
};

export async function VitalsPage(ctx: EncounterContext) {
  const vitals = await patient_measurements.getEncounterVitals(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  });

  return (
    <VitalsForm
      cards={[
        {
          title: "* Required",
          sections: [
            [
              {
                label: "Height",
                name: "height",
                required: true,
                measurements: [
                  {
                    name: "height",
                    units: "cm",
                  },
                ],
              },
              {
                label: "Weight",
                name: "weight",
                required: true,
                measurements: [
                  {
                    name: "weight",
                    units: "kg",
                  },
                ],
              },
            ],
            [
              {
                label: "Blood Pressure",
                name: "blood_pressure",
                required: true,
                measurements: [
                  {
                    name: "blood_pressure_diastolic",
                    units: "mmHg",
                  },
                  {
                    name: "blood_pressure_systolic",
                    units: "mmHg",
                  },
                ],
              },
            ],
          ],
        },
        // {
        //   title: "Optional",
        //   measurements: optionalVitals,
        // },
      ]}
      patient_vitals={vitals}
    />
  );
}

export default EncounterPage(VitalsPage);



// export type Unit = "mm" | "cm" | "%" | "BPM" | "mg/DL" | "kg" | "°C" | "mmHg";

// export type Measurement = {
//   type: "single" | "multiple";
//   name: string;
//   unit: Unit;
//   isRequired?: boolean;
//   previousMeasurement?: {
//     value: number;
//     date: Date;
//   };
//   ranges?: Measurement[]; // Only if type == 'multiple'
// };
