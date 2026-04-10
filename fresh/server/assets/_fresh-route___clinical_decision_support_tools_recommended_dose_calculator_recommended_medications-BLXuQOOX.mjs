import { a, b as s, l, u, e9 as PrescriptionFrequencies, z, c1 as positive_decimal, cL as positive_integer, cH as keys, ea as memoize, bD as patientAgeDetermination, dI as parseRequest, eb as StepsSidebar, L as LogoWithFullText, ec as HealthWorkerContentsWithSidebarAndDrawer } from "../server-entry.mjs";
import "node:async_hooks";
import "node:module";
import "node:events";
import "node:net";
import "node:tls";
import "node:crypto";
import "node:dns";
import "node:util";
const $$_tpl_1$1 = ['<span class="font-medium">', "</span>"];
const $$_tpl_2$1 = ['<span class="font-medium">', "</span>"];
const $$_tpl_3$1 = ['<span class="font-medium">every ', "</span>"];
const $$_tpl_4$1 = ["<span><strong>", "", '</strong><span class="text-gray-500 text-sm ml-1">(', "", "/kg)</span></span>"];
const $$_tpl_5$1 = ["<span><strong>", "", "</strong></span>"];
const $$_tpl_6$1 = ["<span>by ", "", "", "</span>"];
const $$_tpl_7 = ['<span class="italic text-indigo-700">titrate', "", "", "", "", "", "", "</span>"];
const $$_tpl_8 = ["", ""];
const $$_tpl_9 = [" min ", ""];
const $$_tpl_10 = [" max ", ""];
const $$_tpl_11 = [" low ", ""];
const $$_tpl_12 = [" high ", ""];
const $$_tpl_13 = [" ", ""];
const $$_tpl_14 = ['<span class="text-gray-600">over ', "</span>"];
const $$_tpl_15 = ['<span class="text-amber-700 font-medium">slowly</span>'];
const $$_tpl_16 = ['<span class="text-gray-600 italic">— ', "</span>"];
const $$_tpl_17 = ["<span>", "", "", "", "", "", "", "</span>"];
const $$_tpl_18 = ['<span class="mx-1">–</span>'];
const $$_tpl_19 = ["<span>", "", "", "", "", "", "</span>"];
const $$_tpl_20 = ["", " "];
const $$_tpl_21 = ["<span>", "", "", "", "", "</span>"];
const $$_tpl_22 = ["<span ", ">", "</span>"];
const $$_tpl_23 = ['<div class="border border-gray-200 rounded-lg p-4 flex flex-col gap-3"><div class="flex flex-col gap-1"><div class="flex items-center gap-2 flex-wrap"><h3 class="text-base font-semibold text-gray-900">', "</h3>", "", "", '</div><p class="text-sm text-gray-500">', " · ", "", '</p><p class="text-xs text-gray-400">', ". ", "", " — ", '</p></div><div class="flex flex-col gap-2">', '</div><p class="text-xs text-gray-400">Raw: ', " · ", "", "</p></div>"];
const $$_tpl_24 = ['<span class="text-sm text-gray-500">(', ")</span>"];
const $$_tpl_25 = ['<span class="inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">', "</span>"];
const $$_tpl_26 = ["· ", ""];
const $$_tpl_27 = ["<div ", ' class="text-sm text-gray-800 bg-gray-50 rounded px-3 py-2">', "", "</div>"];
const $$_tpl_28 = ['<span class="text-xs uppercase tracking-wide text-gray-400 mr-2">[', "]</span>"];
function formatTimeSpec(spec) {
  const value = Array.isArray(spec.value) ? spec.value.join("–") : spec.value;
  const plural = (Array.isArray(spec.value) ? spec.value[1] : spec.value) === 1 ? "" : "s";
  return `${value} ${spec.units}${plural}`;
}
function FrequencyText({
  frequency
}) {
  if (!frequency) return null;
  if (typeof frequency === "string") {
    const text = PrescriptionFrequencies[frequency];
    return a($$_tpl_1$1, s(text ?? frequency));
  }
  if (Array.isArray(frequency)) {
    const texts = frequency.map((f) => PrescriptionFrequencies[f] ?? f);
    return a($$_tpl_2$1, s(texts.join(" or ")));
  }
  if ("every" in frequency) {
    return a($$_tpl_3$1, s(formatTimeSpec(frequency.every)));
  }
  return null;
}
function DoseValue({
  dose
}) {
  const {
    value,
    units,
    per_kg_display,
    minimum,
    maximum
  } = dose;
  if (value === void 0 && minimum === void 0 && maximum === void 0) return null;
  if (per_kg_display !== void 0) {
    const total = value ?? (minimum !== void 0 && maximum !== void 0 ? `${minimum}–${maximum}` : minimum ?? maximum);
    return a($$_tpl_4$1, s(total), s(units), s(per_kg_display), s(units));
  }
  const base = value ?? (minimum !== void 0 && maximum !== void 0 ? `${minimum}–${maximum}` : minimum ?? maximum);
  if (base === void 0) return null;
  return a($$_tpl_5$1, s(base), s(units));
}
function TitrateRate({
  rate
}) {
  const {
    increment,
    per_time,
    per_size
  } = rate;
  const inc_text = increment === "slow" ? "slowly" : `${increment.value}${increment.units}`;
  const per_text = per_time ? ` per ${formatTimeSpec(per_time)}` : "";
  const size_text = per_size === "kg" ? "/kg" : per_size === "m2" ? "/m²" : "";
  return a($$_tpl_6$1, s(inc_text), s(size_text), s(per_text));
}
function Titrate({
  titrate
}) {
  return a($$_tpl_7, s(titrate.rate && a($$_tpl_8, u(TitrateRate, {
    rate: titrate.rate
  }))), s(titrate.to_effect && " to effect"), s(titrate.if_necessary && " if necessary"), s(titrate.min && a($$_tpl_9, u(Schedule, {
    dose: titrate.min
  }))), s(titrate.max && a($$_tpl_10, u(Schedule, {
    dose: titrate.max
  }))), s(titrate.low && a($$_tpl_11, u(Schedule, {
    dose: titrate.low
  }))), s(titrate.high && a($$_tpl_12, u(Schedule, {
    dose: titrate.high
  }))));
}
function Schedule({
  dose
}) {
  const {
    frequency,
    slowly,
    special_instructions,
    duration,
    titrate
  } = dose;
  const freq_el = frequency ? a($$_tpl_13, u(FrequencyText, {
    frequency
  })) : null;
  const duration_el = duration ? a($$_tpl_14, s(formatTimeSpec(duration))) : null;
  const slowly_el = slowly ? a($$_tpl_15) : null;
  const instructions_el = special_instructions ? a($$_tpl_16, s(special_instructions)) : null;
  if (dose.low?.length || dose.high?.length) {
    const low_dose = dose.low?.[0];
    const high_dose = dose.high?.[0];
    return a($$_tpl_17, s(low_dose && u(Schedule, {
      dose: {
        ...low_dose,
        frequency: void 0
      }
    })), s(low_dose && high_dose && a($$_tpl_18)), s(high_dose && u(Schedule, {
      dose: {
        ...high_dose,
        frequency: void 0
      }
    })), s(freq_el), s(duration_el), s(slowly_el), s(instructions_el));
  }
  if (titrate) {
    return a($$_tpl_19, s(dose.value !== void 0 && a($$_tpl_20, u(DoseValue, {
      dose
    }))), u(Titrate, {
      titrate
    }), s(freq_el), s(duration_el), s(slowly_el), s(instructions_el));
  }
  return a($$_tpl_21, u(DoseValue, {
    dose
  }), s(slowly_el), s(freq_el), s(duration_el), s(instructions_el));
}
function AwareBadge({
  aware
}) {
  if (!aware) return null;
  const colours = {
    Access: "bg-green-100 text-green-800",
    Watch: "bg-yellow-100 text-yellow-800",
    Reserve: "bg-red-100 text-red-800"
  };
  return a($$_tpl_22, l("class", `inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${colours[aware] ?? "bg-gray-100 text-gray-700"}`), s(aware));
}
function RecommendedMedication({
  medicine: med
}) {
  return a($$_tpl_23, s(med.medicine.name), s(med.medicine.alternate_name && a($$_tpl_24, s(med.medicine.alternate_name))), u(AwareBadge, {
    aware: med.aware
  }), s(med.acute_chronic && a($$_tpl_25, s(med.acute_chronic))), s(med.form), s(med.route), s(med.prescriber && a($$_tpl_26, s(med.prescriber))), s(med.chapter_number), s(med.chapter_name), s(med.disorder_number && ` › ${med.disorder_number}`), s(med.disorder), s(med.schedules.map((schedule, i) => a($$_tpl_27, l("key", i), s(schedule.age_classifier && a($$_tpl_28, s(schedule.age_classifier))), u(Schedule, {
    dose: schedule
  })))), s(med.raw_dose), s(med.raw_dose_interval), s(med.raw_duration && ` · ${med.raw_duration}`));
}
async function parseJSON(file_path) {
  const contents = await Deno.readTextFile(file_path);
  return JSON.parse(contents);
}
const PatientCaseSchema = z.object({
  sex: z.enum(["male", "female"]),
  dob: z.string().date(),
  height_cm: positive_decimal,
  weight_kg: positive_decimal,
  conditions: z.string().array().optional().default([])
});
const TimeUnitSchema = z.enum(["second", "minute", "hour", "day", "week", "month", "year"]);
const TimeSpecificationSchema = z.object({
  value: positive_integer.or(z.tuple([positive_integer, positive_integer])),
  units: TimeUnitSchema
});
const PerSizeSchema = z.literal("kg").or(z.literal("m2")).or(z.object({
  kg: positive_decimal
}));
const PrescriptionFrequencyKeySchema = z.enum(keys(PrescriptionFrequencies));
const PrescriptionFrequencySchema = PrescriptionFrequencyKeySchema.or(PrescriptionFrequencyKeySchema.array()).or(z.object({
  every: TimeSpecificationSchema
}));
const MaybeSchema = (schema) => z.union([schema, z.null(), z.undefined()]);
const SimpleParsedDoseSchema = z.object({
  units: z.string().optional(),
  value: z.number().optional(),
  quantity: z.number().optional(),
  ingredient_name: z.string().optional(),
  per_size: PerSizeSchema.optional(),
  per_time: TimeSpecificationSchema.optional(),
  per_dose: z.boolean().optional(),
  frequency: PrescriptionFrequencySchema.optional(),
  special_instructions: z.string().optional(),
  kg_limit_min: z.number().optional(),
  kg_limit_max: z.number().optional(),
  slowly: z.boolean().optional(),
  divided_dose_count: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  per_percent_burn: z.boolean().optional(),
  duration: TimeSpecificationSchema.optional(),
  denominator: z.object({
    value: z.number(),
    units: z.string()
  }).optional(),
  concentration: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  concentration_ratio: z.tuple([z.number(), z.number()]).optional()
});
const BuildingDoseSchema = z.object({
  minimum: z.number().optional(),
  maximum: z.number().optional(),
  units: z.string().optional(),
  value: z.number().optional(),
  quantity: z.number().optional(),
  ingredient_name: z.string().optional(),
  per_size: PerSizeSchema.optional(),
  per_time: TimeSpecificationSchema.optional(),
  per_dose: z.boolean().optional(),
  per_percent_burn: z.boolean().optional(),
  duration: TimeSpecificationSchema.optional(),
  denominator: z.object({
    value: z.number(),
    units: z.string()
  }).optional(),
  concentration: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  concentration_ratio: z.tuple([z.number(), z.number()]).optional(),
  // Recursive Arrays
  low: z.array(SimpleParsedDoseSchema.extend({
    diluents: z.array(SimpleParsedDoseSchema).optional()
  })).optional(),
  high: z.array(SimpleParsedDoseSchema.extend({
    diluents: z.array(SimpleParsedDoseSchema).optional()
  })).optional(),
  // Union Recursive
  total: z.union([z.literal(true), SimpleParsedDoseSchema]).optional(),
  age_classifier: z.enum(["premature baby", "breastfed infant", "child", "adolescent", "infant", "newborn", "adult", "elderly"]).optional(),
  age_range: z.object({
    min: MaybeSchema(z.object({
      value: z.number(),
      units: z.enum(["months", "years"])
    })).optional(),
    max: MaybeSchema(z.object({
      value: z.number(),
      units: z.enum(["months", "years"])
    })).optional()
  }).optional(),
  sex: z.enum(["all", "female", "male"]).optional(),
  plus_minus: z.object({
    value: z.number(),
    units: z.string()
  }).optional(),
  kg_limit_min: z.number().optional(),
  kg_limit_max: z.number().optional(),
  titrate: z.object({
    rate: z.object({
      increment: z.union([z.literal("slow"), z.object({
        value: z.number(),
        units: z.string()
      })]),
      per_time: TimeSpecificationSchema.optional(),
      per_size: PerSizeSchema.optional(),
      per_dose: z.boolean().optional()
    }).optional(),
    duration: TimeSpecificationSchema.optional(),
    min: SimpleParsedDoseSchema.optional(),
    max: SimpleParsedDoseSchema.optional(),
    low: SimpleParsedDoseSchema.optional(),
    high: SimpleParsedDoseSchema.optional(),
    if_necessary: z.boolean().optional(),
    to_effect: z.boolean().optional()
  }).optional(),
  total_dose_count: z.number().optional(),
  divided_dose_count: z.union([z.number(), z.tuple([z.number(), z.number()])]).optional(),
  frequency: z.union([PrescriptionFrequencySchema, z.array(PrescriptionFrequencySchema), z.object({
    every: TimeSpecificationSchema
  })]).optional(),
  special_instructions: z.string().optional(),
  other_schedule: SimpleParsedDoseSchema.optional(),
  multipliers: z.array(z.union([SimpleParsedDoseSchema, z.string()])).optional(),
  equation: z.string().optional(),
  alternate_specification: SimpleParsedDoseSchema.optional(),
  for_condition: z.string().optional(),
  within: z.object({
    time: TimeSpecificationSchema.optional(),
    event: z.string().optional()
  }).optional(),
  slowly: z.boolean().optional(),
  series: z.union([z.object({
    dose_count: z.number(),
    starting_at: TimeSpecificationSchema.optional(),
    time_apart: TimeSpecificationSchema.optional()
  }), z.object({
    doses: z.array(TimeSpecificationSchema)
  })]).optional(),
  time_apart: TimeSpecificationSchema.optional(),
  after: z.object({
    time: TimeSpecificationSchema.optional(),
    event: z.string().optional()
  }).optional(),
  before: z.object({
    time: TimeSpecificationSchema.optional(),
    event: z.string().optional()
  }).optional(),
  as_required: z.boolean().optional()
});
const ParsedDoseSchema = BuildingDoseSchema.extend({
  diluents: z.array(BuildingDoseSchema).optional(),
  // Intersections/Extends within Arrays
  active_ingredients: z.array(BuildingDoseSchema.and(z.object({
    ingredient_name: z.string()
  }))).optional(),
  min: z.array(BuildingDoseSchema).optional(),
  max: z.array(BuildingDoseSchema).optional(),
  recommended_average_dose: BuildingDoseSchema.optional(),
  equivalency: BuildingDoseSchema.optional()
});
const Icd10Codes = z.object({
  type: z.literal("codes"),
  codes: z.string().array()
});
const IngredientSchema = z.object({
  name: z.string(),
  alternate_name: z.string().optional(),
  dosage: z.object({
    value: z.number(),
    units: z.string()
  }).optional()
});
const MedicineSchema = z.object({
  "atc": z.string(),
  "form": z.string(),
  "route": z.string(),
  "aware": z.enum(["Watch", "Access", "Reserve"]).nullable(),
  "acute_chronic": z.enum(["Acute", "Chronic"]).nullable(),
  "prescriber": z.string().nullable().nullable(),
  "icd10_indications": Icd10Codes.or(z.object({
    type: z.literal("and"),
    indications: Icd10Codes.array()
  })),
  "medicine": z.object({
    name: z.string(),
    alternate_name: z.string().optional(),
    ingredients: z.array(IngredientSchema)
  }),
  "raw_dose": z.string(),
  "raw_dose_interval": z.string(),
  "raw_duration": z.string().nullable(),
  "publication": z.string(),
  "chapter_name": z.string(),
  "chapter_number": z.string(),
  "adult_children": z.string(),
  "section_number": z.string(),
  "disorder_number": z.string().nullable(),
  "disorder": z.string(),
  schedules: ParsedDoseSchema.array(),
  max: ParsedDoseSchema.nullish()
});
function resolvePerKg(per_size) {
  if (per_size === "kg") return 1;
  if (per_size === "m2") return null;
  if (per_size && typeof per_size === "object" && "kg" in per_size) return per_size.kg;
  return null;
}
function applyWeight(dose, weight_kg) {
  const kg_factor = resolvePerKg(dose.per_size);
  const result = {
    ...dose
  };
  if (kg_factor !== null) {
    const {
      value,
      minimum,
      maximum
    } = dose;
    if (value !== void 0) {
      result.per_kg_display = value;
      result.value = +(value * weight_kg * kg_factor).toFixed(2);
    } else if (minimum !== void 0 || maximum !== void 0) {
      result.per_kg_display = minimum !== void 0 && maximum !== void 0 ? `${minimum}–${maximum}` : String(minimum ?? maximum);
      if (minimum !== void 0) result.minimum = +(minimum * weight_kg * kg_factor).toFixed(2);
      if (maximum !== void 0) result.maximum = +(maximum * weight_kg * kg_factor).toFixed(2);
    }
    result.per_size = void 0;
  }
  if (result.low) result.low = result.low.map((d) => applyWeight(d, weight_kg));
  if (result.high) result.high = result.high.map((d) => applyWeight(d, weight_kg));
  if (result.min) result.min = result.min.map((d) => applyWeight(d, weight_kg));
  if (result.max) result.max = result.max.map((d) => applyWeight(d, weight_kg));
  if (result.titrate) {
    const t = result.titrate;
    result.titrate = {
      ...t,
      min: t.min ? applyWeight(t.min, weight_kg) : void 0,
      max: t.max ? applyWeight(t.max, weight_kg) : void 0,
      low: t.low ? applyWeight(t.low, weight_kg) : void 0,
      high: t.high ? applyWeight(t.high, weight_kg) : void 0
    };
  }
  return result;
}
const getAllParsedMedications = memoize(async () => {
  const json = await parseJSON("./backend/recommended_doses/parsed/recommended_doses.json");
  return MedicineSchema.array().parse(json);
});
function extractConditionCodes(conditions) {
  if (!conditions) return [];
  const items = Array.isArray(conditions) ? conditions : Object.values(conditions);
  return items.flatMap((item) => {
    if (typeof item === "string") return [item];
    if (item && typeof item === "object" && "id" in item && typeof item.id === "string") {
      return [item.id];
    }
    return [];
  });
}
function codeMatches(indicator_code, patient_code) {
  if (indicator_code.endsWith("*")) {
    return patient_code.startsWith(indicator_code.slice(0, -1));
  }
  return patient_code.startsWith(indicator_code);
}
function indicationsMatch(indications, patient_codes) {
  if (indications.type === "codes") {
    if (indications.codes.length === 0) return false;
    return indications.codes.some((code) => patient_codes.some((pc) => codeMatches(code, pc)));
  }
  return indications.indications.every((group) => group.codes.some((code) => patient_codes.some((pc) => codeMatches(code, pc))));
}
function getAgeInYears(dob) {
  const birth_date = new Date(dob);
  const today = /* @__PURE__ */ new Date();
  const diff_in_ms = today.getTime() - birth_date.getTime();
  const age_in_years = diff_in_ms / (1e3 * 60 * 60 * 24 * 365.25);
  return Math.max(0, age_in_years);
}
function scheduleMatchesAge(schedule, patient_is_adult) {
  if (!schedule.age_classifier) return true;
  const adult_classifiers = /* @__PURE__ */ new Set(["adult", "elderly"]);
  const child_classifiers = /* @__PURE__ */ new Set(["child", "adolescent", "infant", "newborn", "premature baby", "breastfed infant"]);
  if (patient_is_adult === true) return adult_classifiers.has(schedule.age_classifier);
  if (patient_is_adult === false) return child_classifiers.has(schedule.age_classifier);
  return true;
}
function findMatchingMedicines(medicines, query) {
  const codes = extractConditionCodes(query.conditions);
  if (!codes.length) return [];
  const age_determination = patientAgeDetermination({
    age_years: getAgeInYears(query.dob),
    most_recent_height: {
      cm: String(query.height_cm)
    }
  });
  const patient_is_adult = age_determination === "adult";
  return medicines.filter((m) => indicationsMatch(m.icd10_indications, codes)).map((m) => {
    if (patient_is_adult === void 0) return m;
    const filtered_schedules = m.schedules.filter((s2) => scheduleMatchesAge(s2, patient_is_adult));
    if (!filtered_schedules.length) return m;
    return {
      ...m,
      schedules: filtered_schedules
    };
  });
}
function applyPatientCase(medicine, patient_case) {
  return {
    ...medicine,
    patient_case,
    schedules: medicine.schedules.map((s2) => applyWeight(s2, Number(patient_case.weight_kg)))
  };
}
const recommended_doses = {
  async getRecommendedDosesWithPatientCaseApplied(patient_case) {
    const medicines = await getAllParsedMedications();
    const matching_medicines = findMatchingMedicines(medicines, patient_case);
    return matching_medicines.map((medicine) => applyPatientCase(medicine, patient_case));
  }
};
const $$_tpl_1 = ['<div class="flex flex-col gap-6 py-6  px-4"><section class="flex flex-col gap-2"><h2 class="text-lg font-semibold text-gray-900">Patient Details</h2><dl class="flex flex-col gap-1"><div class="flex gap-4"><dt class="w-32 text-sm font-medium text-gray-500">Date of Birth</dt><dd class="text-sm text-gray-900">', '</dd></div><div class="flex gap-4"><dt class="w-32 text-sm font-medium text-gray-500">Sex</dt><dd class="text-sm text-gray-900">', '</dd></div><div class="flex gap-4"><dt class="w-32 text-sm font-medium text-gray-500">Height (cm)</dt><dd class="text-sm text-gray-900">', '</dd></div><div class="flex gap-4"><dt class="w-32 text-sm font-medium text-gray-500">Weight (kg)</dt><dd class="text-sm text-gray-900">', '</dd></div></dl></section><section class="flex flex-col gap-2"><h2 class="text-lg font-semibold text-gray-900">Conditions</h2>', '</section><section class="flex flex-col gap-2"><h2 class="text-lg font-semibold text-gray-900">Recommended Medications', "</h2>", "</section></div>"];
const $$_tpl_2 = ['<ul class="flex flex-col gap-1 list-disc list-inside"></ul>'];
const $$_tpl_3 = ['<p class="text-sm text-gray-500">No conditions specified.</p>'];
const $$_tpl_4 = ['<span class="ml-2 text-sm font-normal text-gray-500">(', ")</span>"];
const $$_tpl_5 = ['<div class="flex flex-col gap-4">', "</div>"];
const $$_tpl_6 = ['<p class="text-sm text-gray-500">', "</p>"];
async function RecommendedMedications(ctx) {
  const patient_case = await parseRequest(ctx.req, PatientCaseSchema.parse);
  const matching_medicines = await recommended_doses.getRecommendedDosesWithPatientCaseApplied(patient_case);
  return u(HealthWorkerContentsWithSidebarAndDrawer, {
    title: "Recommended Dose Calculator",
    url: ctx.url,
    sidebar: u(StepsSidebar, {
      top: {
        href: "/clinical_decision_support_tools",
        child: u(LogoWithFullText, {
          variant: "indigo",
          className: "w-full"
        })
      },
      url: ctx.url,
      route: ctx.route,
      params: ctx.params,
      nav_links: [{
        step: "Create patient case",
        route: "/clinical_decision_support_tools/recommended_dose_calculator/create_patient_case"
      }, {
        step: "Recommended medications",
        route: "/clinical_decision_support_tools/recommended_dose_calculator/recommended_medications"
      }],
      steps_completed: ["Create patient case"]
    }),
    children: a($$_tpl_1, s(patient_case.dob), s(patient_case.sex), s(String(patient_case.height_cm)), s(String(patient_case.weight_kg)), s((patient_case.conditions?.length || 0) > 0 ? a($$_tpl_2) : a($$_tpl_3)), s(matching_medicines.length > 0 && a($$_tpl_4, s(matching_medicines.length))), s(matching_medicines.length > 0 ? a($$_tpl_5, s(matching_medicines.map((med, i) => u(RecommendedMedication, {
      medicine: med
    }, i)))) : a($$_tpl_6, s(!patient_case.conditions?.length ? "No conditions specified." : "No recommended medications found for the specified conditions."))))
  });
}
const routeCss = null;
const css = routeCss;
const config = void 0;
const handler = void 0;
const handlers = void 0;
const _freshRoute___clinical_decision_support_tools_recommended_dose_calculator_recommended_medications = RecommendedMedications;
export {
  config,
  css,
  _freshRoute___clinical_decision_support_tools_recommended_dose_calculator_recommended_medications as default,
  handler,
  handlers
};
