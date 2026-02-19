export type ParsedIngredient = {
  name: string
  equivalent_to: null | string
  strength: null | {
    value: string
    units: string
  }
}

export type ParsedDoseBase<Ingredient> = {
  value: string
  description: string
  ingredients: Ingredient[]
}

export type ParsedDose = ParsedDoseBase<ParsedIngredient>
export type ParsedDoseWhoseIngredientsAreSnomedConcepts = ParsedDoseBase<ParsedIngredient & { snomed_concept_id: string }>

export type ParsedMedicationBase<Dose> = {
  form: string
  routes: string[]
  doses: Dose[]
  trade_name: string
  registration_no: string
  applicant_name: string
  manufacturers: string
  country: string
}

export type ParsedMedication = ParsedMedicationBase<ParsedDose>

export type ParsedMedicationWhoseIngredientsAreSnomedConcepts = ParsedMedicationBase<ParsedDoseWhoseIngredientsAreSnomedConcepts>

export type ParsedMedicationWithSnomedConceptMedicinalProduct = ParsedMedicationWhoseIngredientsAreSnomedConcepts & { snomed_concept_id: string }

export const unaffiliated_form_to_route: Record<string, string[]> = {
  BALSAM: ['ORAL', 'TOPICAL'],
  CAPSULE: ['ORAL', 'RECTAL', 'VAGINAL'],
  CREAM: ['TOPICAL', 'VAGINAL', 'RECTAL'],
  GEL: ['ORAL', 'TOPICAL'],
  INJECTABLE: ['INJECTION'],
  INHALATION: ['INHALATION'],
  LIQUID: ['INHALATION', 'INJECTION', 'ORAL', 'TOPICAL'],
  LOTION: ['TOPICAL'],
  PELLET: ['ORAL', 'RECTAL', 'VAGINAL'],
  SOLUTION: ['INJECTION', 'ORAL', 'INHALATION', 'TOPICAL'],
  SUSPENSION: ['ORAL', 'INJECTION'],
  TABLET: ['ORAL', 'RECTAL', 'VAGINAL', 'SUBLINGUAL', 'BUCCAL'],
  'TABLET, COATED': ['ORAL', 'RECTAL', 'VAGINAL', 'SUBLINGUAL', 'BUCCAL'],
  VACCINE: ['ORAL', 'INJECTION'],
  WAFER: ['TOPICAL'],
  // SA-specific forms
  AMPOULE: ['INJECTION'],
  DROPS: ['TOPICAL', 'ORAL'],
  LOZENGE: ['ORAL'],
  OINTMENT: ['TOPICAL'],
  PATCH: ['TOPICAL'],
  POWDER: ['ORAL', 'TOPICAL'],
  SACHET: ['ORAL'],
  SPRAY: ['NASAL', 'ORAL', 'TOPICAL'],
  SUPPOSITORY: ['RECTAL', 'VAGINAL'],
  SYRINGE: ['INJECTION'],
  SYRUP: ['ORAL'],
  VIAL: ['INJECTION'],
  // SA tablet variants
  'FILM-COATED TABLET': ['ORAL'],
  'FILM COATED TABLET': ['ORAL'],
  'ACTIVE TABLET': ['ORAL'],
  'EFFERVESCENT TABLET': ['ORAL'],
  'ORODISPERSIBLE TABLET': ['ORAL'],
  'CHEWABLE TABLET': ['ORAL'],
  'CHEW TABLET': ['ORAL'],
  'DISPERSIBLE TABLET': ['ORAL'],
  'UNCOATED TABLET': ['ORAL'],
  'ENTERIC COATED TABLET': ['ORAL'],
  'GASTRO-RESISTANT TABLET': ['ORAL'],
  'PROLONGED RELEASE TABLET': ['ORAL'],
  'SUSTAINED RELEASE  FILM COATED TABLET': ['ORAL'],
  'SUBLINGUAL TABLET': ['SUBLINGUAL'],
  'VAGINAL TABLET': ['VAGINAL'],
  'PINK TABLET': ['ORAL'],
  'BROWN TABLET': ['ORAL'],
  // SA capsule variants
  'HARD CAPSULE': ['ORAL'],
  'SOFTGEL CAPSULE': ['ORAL'],
  'CAPSULE FOR INHALATION': ['INHALATION'],
  'INHALATION CAPSULE': ['INHALATION'],
  'SPRINKLE CAPSULE': ['ORAL'],
  // SA syringe/injection containers
  'PRE-FILLED SYRINGE': ['INJECTION'],
  'PRE-FILLED SYRINGE OR PEN': ['INJECTION'],
  'PENFILL CARTRIDGE': ['INJECTION'],
  CARTRIDGE: ['INJECTION'],
  'SINGLE DOSE VIAL': ['INJECTION'],
  INJECTION: ['INJECTION'],
  INFUSION: ['INJECTION'],
  'INFUSION SOLUTION': ['INJECTION'],
  'INFUSION BAG': ['INJECTION'],
  'STERILE SOLUTION': ['INJECTION'],
  'STERILE EMULSION': ['INJECTION'],
  CONCENTRATE: ['INJECTION'],
  DEPOT: ['INJECTION'],
  BAG: ['INJECTION'],
  'ONE ML INJECTION': ['INJECTION'],
  'OILY SOLUTION': ['INJECTION'],
  // SA inhalation variants
  EMULSION: ['INJECTION', 'TOPICAL'],
  'METERED DOSE': ['INHALATION'],
  'DELIVERED DOSE': ['INHALATION'],
  'METERED ACTUATION': ['INHALATION'],
  ACTUATION: ['INHALATION'],
  'SINGLE ACTUATION': ['INHALATION'],
  'SINGLE INHALATION': ['INHALATION'],
  PUFF: ['INHALATION'],
  'METERED-DOSE': ['INHALATION'],
  'UNIT DOSE': ['INHALATION'],
  BLISTER: ['INHALATION'],
  RESPULE: ['INHALATION'],
  AEROSOL: ['INHALATION', 'TOPICAL'],
  CYLINDER: ['INHALATION'],
  CONTAINER: ['INHALATION'],
  'DOSAGE UNIT': ['INHALATION'],
  // SA nasal/spray variants
  'METERED SPRAY': ['NASAL', 'ORAL', 'TOPICAL'],
  'METERED DOSE SPRAY': ['NASAL', 'ORAL', 'TOPICAL'],
  'SPRAY ACTUATION': ['NASAL', 'ORAL', 'TOPICAL'],
  'SINGLE DOSE NASAL SPRAY': ['NASAL'],
  'NASAL SPRAY DEVICE': ['NASAL'],
  'DROPS OR METERED SPRAY': ['NASAL', 'TOPICAL'],
  'ORAL SPRAY SOLUTION': ['ORAL'],
  'SPRAY SOLUTION': ['TOPICAL'],
  // SA ophthalmic
  'EYE DROPS': ['OPHTHALMIC'],
  'OPHTHALMIC SUSPENSION': ['OPHTHALMIC'],
  'OPHTHALMIC OINTMENT': ['OPHTHALMIC'],
  'OPHTHALMIC SOLUTION': ['OPHTHALMIC'],
  // SA oral forms
  ELIXIR: ['ORAL'],
  GRANULES: ['ORAL'],
  CAPLET: ['ORAL'],
  GUM: ['ORAL'],
  MIXTURE: ['ORAL', 'INJECTION'],
  TEA: ['ORAL'],
  LEAVES: ['ORAL'],
  SALT: ['ORAL'],
  'ML ELIXIR': ['ORAL'],
  // SA topical
  IMPLANT: ['INJECTION'],
  'INTRAVITREAL IMPLANT': ['INJECTION'],
  OIL: ['TOPICAL'],
  PLASTER: ['TOPICAL'],
  FOAM: ['TOPICAL'],
  'CUTANEOUS FOAM': ['TOPICAL'],
  SHAMPOO: ['TOPICAL'],
  'MEDICATED DISC': ['TOPICAL'],
  'MEDICATED DISK': ['TOPICAL'],
  'TRANSDERMAL THERAPEUTIC SYSTEM': ['TOPICAL'],
  DRESSING: ['TOPICAL'],
  SWAB: ['TOPICAL'],
  'SWAB IS IMPREGNATED WITHSOLUTION': ['TOPICAL'],
  STICK: ['TOPICAL'],
  LACQUER: ['TOPICAL'],
  JELLY: ['TOPICAL'],
  JAR: ['TOPICAL'],
  'AQUEOUS GEL': ['TOPICAL'],
  'RECONSTITUTED GEL': ['TOPICAL'],
  'TOPICAL SUSPENSION': ['TOPICAL'],
  GRAM: ['TOPICAL'],
  'GRAM OF CREAM': ['TOPICAL'],
  'GRAM OINTMENT': ['TOPICAL'],
  'GRAM SOLUTION': ['TOPICAL'],
  G: ['TOPICAL'],
  'SQUARE CM PATCH': ['TOPICAL'],
  'NAIL LACUER': ['TOPICAL'],
  TOWLETTE: ['TOPICAL'],
  TOWELETTTE: ['TOPICAL'],
  // SA vaginal
  PESSARY: ['VAGINAL'],
  'VAGINAL RING': ['VAGINAL'],
  'VAGINAL SUPPOSITORY': ['VAGINAL'],
  'VAGINAL CREAM': ['VAGINAL'],
  'VAGINAL GEL': ['VAGINAL'],
  OVULE: ['VAGINAL'],
  TAMPON: ['VAGINAL'],
  SPONGE: ['VAGINAL'],
  'INTRAUTERINE SYSTEM': ['VAGINAL'],
  'IUD SYSTEM': ['VAGINAL'],
  DEVICE: ['VAGINAL'],
  SYSTEM: ['VAGINAL'],
  // SA rectal
  ENEMA: ['RECTAL'],
  'RECONSTITUTED ENEMA': ['RECTAL'],
  // SA suspension/solution variants
  'RECONSTITUTED SUSPENSION': ['ORAL'],
  'VISCOUS SUSPENSION': ['ORAL', 'TOPICAL'],
  // SA container/packaging forms
  BOTTLE: ['ORAL', 'TOPICAL'],
  'BLISTER PACK': ['ORAL'],
  'SINGLE BLISTER PACK': ['INJECTION'],
  PACK: ['ORAL'],
  'COMBI PACK': ['ORAL'],
  COMBIPACK: ['ORAL'],
  'COMBINATION PACK': ['INJECTION'],
  'DUAL-PACK': ['VAGINAL'],
  WALLET: ['ORAL'],
  PACKET: ['ORAL'],
  POUCH: ['ORAL'],
  'POUCH OR SCOOP': ['ORAL'],
  'INDIVIDUALLY WRAPPED POWDER': ['ORAL'],
  ML: ['INJECTION', 'TOPICAL'],
  'ML SOLUTION': ['INJECTION', 'TOPICAL'],
  'ML OF SOLUTION': ['INJECTION', 'TOPICAL'],
  'I ML': ['INJECTION'],
  MILLILITRE: ['INJECTION', 'TOPICAL'],
  // SA edge cases
  STENT: ['INJECTION'],
  PREMIX: ['ORAL'],
  LIQUER: ['ORAL'],
  KIT: ['INJECTION'],
  UNIT: ['INJECTION'],
  'WHEN DILUTED': ['INJECTION'],
  'FENWAL BLOOD-PACK UNID -ADSOL': ['INJECTION'],
}

// These are forms with a clear singular dosage.
// Other forms, like ointments or syrups
export const forms_with_singular_doses = [
  'TABLET',
  'INJECTION',
  'IMPLANT',
  'SUPPOSITORY',
  'INFUSION',
  'CAPSULE',
  'VACCINE',
  'LOZENGE',
  'INHALATION',
  'PELLET',
]

export const unique_snomed_administration_methods = [
  'Administer' as const,
  'Instill' as const,
  'Spray' as const,
  'Inhale' as const,
  'Inject' as const,
  'Gargle' as const,
  'Orodisperse' as const,
  'Chew' as const,
  'Suck' as const,
  'Insufflate' as const,
  'Implantation' as const,
  'Dose form administration method' as const,
  'Apply' as const,
  'Insert' as const,
  'Rinse' as const,
  'Dialysis system' as const,
  'Swallow' as const,
  'Infuse' as const,
  'Rinse or wash' as const,
  'Bathe' as const,
]

export type AdministrationMethod = typeof unique_snomed_administration_methods[number]

export const administration_methods_to_routes: Record<AdministrationMethod, string[]> = {
  'Administer': ['ORAL', 'INJECTION', 'TOPICAL', 'INHALATION', 'NASAL', 'OPHTHALMIC', 'RECTAL', 'VAGINAL'],
  'Instill': ['OPHTHALMIC', 'NASAL', 'ORAL'],
  'Spray': ['NASAL', 'ORAL', 'TOPICAL', 'INHALATION'],
  'Inhale': ['INHALATION'],
  'Inject': ['INJECTION'],
  'Gargle': ['ORAL'],
  'Orodisperse': ['ORAL'],
  'Chew': ['ORAL'],
  'Suck': ['ORAL'],
  'Insufflate': ['INHALATION', 'NASAL'],
  'Implantation': ['INJECTION'],
  'Dose form administration method': ['ORAL', 'INJECTION', 'TOPICAL', 'INHALATION', 'NASAL', 'OPHTHALMIC', 'RECTAL', 'VAGINAL'],
  'Apply': ['TOPICAL', 'VAGINAL', 'RECTAL'],
  'Insert': ['VAGINAL', 'RECTAL'],
  'Rinse': ['ORAL', 'TOPICAL'],
  'Dialysis system': ['INJECTION'],
  'Swallow': ['ORAL'],
  'Infuse': ['INJECTION'],
  'Rinse or wash': ['ORAL', 'TOPICAL'],
  'Bathe': ['TOPICAL'],
}
