import { assert } from "std/assert/assert.ts";
import { z } from "zod";
import * as patient_family from "../../../../../../../db/models/family.ts";
import { FamilyHistoryPage } from "../../../../../../../islands/FamilyHistoryPage.tsx";
import { postHandler } from "../../../../../../../util/postHandler.ts";
import { promiseProps } from "../../../../../../../util/promiseProps.ts";
import { HistoryPage } from "./_middleware.tsx";

// const FamilyRelationInsertSchema = z.object({
//   patient_id: z.string().uuid().optional(),
//   patient_name: z.string(),
//   patient_phone_number: e164_phone_number.optional(),
//   family_relation_gendered: z.string(),
//   next_of_kin: z.boolean().default(false),
// });

const FamilyMemberSchema = z.object({
  relation_gendered: z.string(),
});

export const FamilyHistorySchema = z
  .object({
    done: z.boolean(),
  })
  .or(
    z.object({
      family_history: z.object({
        snomed_concept_id: z.string(), // TODO, change this to the actual validator when we've wired up snomed
        family_members: z.array(FamilyMemberSchema),
      }),
    })
  );

// z.object({
//   family: z
//     .object({
//       under_18: z.boolean().optional(),
//       guardians: z.array(FamilyRelationInsertSchema).default([]),
//       dependents: z.array(FamilyRelationInsertSchema).default([]),
//       other_next_of_kin: FamilyRelationInsertSchema.optional(),
//       religion: z.string().optional(),
//       family_type: z
//         .enum([
//           "2 married parents",
//           "Blended",
//           "Child-headed",
//           "Divorced",
//           "Extended",
//           "Grandparent-led",
//           "Orphan",
//           "Polygamous/Compound",
//           "Single Parent",
//         ])
//         .optional(),
//       marital_status: z
//         .enum([
//           "Co-habiting",
//           "Divorced",
//           "Married",
//           "Never Married",
//           "Separated",
//           "Single",
//           "Widowed",
//         ])
//         .optional(),
//       patient_cohabitation: z
//         .enum([
//           "Father",
//           "Foster Parent",
//           "Grandparent(s)",
//           "Mother",
//           "Orphanage",
//           "Other Relative",
//           "Sibling",
//           "Uncle or Aunt",
//         ])
//         .optional(),
//     })
//     .optional()
//     .default({
//       dependents: [],
//       guardians: [],
//     }),
// });

export const handler = postHandler(
  FamilyHistorySchema,
  async (_req, ctx, form_values) => {
    console.log("form_values", form_values);
    const { completing_assessment } = await promiseProps({
      // completing_assessment: completeAssessment(ctx),
      // upserting_family: patient_family.upsert(
      //   ctx.state.trx,
      //   ctx.state.patient.id,
      //   form_values.family
      // ),
    });
    return new Response("OK");
    // return completing_assessment;
  }
);

export default HistoryPage(async function FamilyPage(ctx) {
  const patient_id = ctx.state.patient.id;
  const family = await patient_family.get(ctx.state.trx, { patient_id });
  assert(ctx.state.patient.age_years != null);
  const age_years = parseInt(ctx.state.patient.age_years, 10);
  assert(typeof age_years === "number" && age_years >= 0);

  return <FamilyHistoryPage />;
});
