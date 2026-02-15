import { TrxOrDb } from '../../types.ts'

type PharmacyEmploymentInsert = {
  pharmacist_id: string
  pharmacy_id: string
  is_supervisor: boolean
}

export const pharmacy_employment = {
  async insert(trx: TrxOrDb, data: PharmacyEmploymentInsert[]) {
    await (trx as { insertInto: (t: string) => { values: (v: unknown) => { execute: () => Promise<unknown> } } }).insertInto('pharmacy_employment').values(data)
      .execute()
  },
  async remove(
    trx: TrxOrDb,
    pharmacistId: string,
    pharmacyId: string,
  ) {
    await (trx as {
      deleteFrom: (
        t: string,
      ) => { where: (col: string, op: string, val: string) => { where: (col: string, op: string, val: string) => { execute: () => Promise<unknown> } } }
    }).deleteFrom('pharmacy_employment').where('pharmacist_id', '=', pharmacistId).where('pharmacy_id', '=', pharmacyId).execute()
  },
  async updateIsSupervisor(
    trx: TrxOrDb,
    pharmacistId: string,
    pharmacyId: string,
    isSupervisor: boolean,
  ) {
    await (trx as {
      updateTable: (
        t: string,
      ) => {
        set: (
          s: object,
        ) => { where: (col: string, op: string, val: string) => { where: (col: string, op: string, val: string) => { execute: () => Promise<unknown> } } }
      }
    }).updateTable('pharmacy_employment').set({ is_supervisor: isSupervisor }).where('pharmacist_id', '=', pharmacistId).where('pharmacy_id', '=', pharmacyId)
      .execute()
  },
}
