/**
 * Augments DB with pharmacy tables that exist at runtime (from migrations)
 * but may not be present in the generated db.d.ts.
 * Reference this file so the pharmacy models type-check.
 */
declare module '../db.d.ts' {
  export interface DB {
    pharmacies: {
      id: string
      name: string
      licence_number: string
      licensee: string
      address: string | null
      town: string | null
      country: string
      expiry_date: Date
      pharmacies_types: string
      created_at: unknown
      updated_at: unknown
    }
    pharmacy_employment: {
      id: string
      pharmacist_id: string
      pharmacy_id: string
      organization_id: string
      is_supervisor: boolean
      created_at: unknown
      updated_at: unknown
    }
  }
}
