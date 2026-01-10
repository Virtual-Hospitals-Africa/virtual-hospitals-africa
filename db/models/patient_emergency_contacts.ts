import { TrxOrDb } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { EmergencyContactRelationship } from '../../shared/family.ts'

export type PatientEmergencyContact = {
  id: string
  patient_id: string
  name: string
  relationship: EmergencyContactRelationship
  phone_number: string
  contact_order: number
  created_at: Date
  updated_at: Date
}

export type RenderedPatientEmergencyContact = {
  id: string
  name: string
  relationship: EmergencyContactRelationship
  phone_number: string
  contact_order: number
}

export const patient_emergency_contacts = {
  getByPatientId(
    trx: TrxOrDb,
    { patient_id }: { patient_id: string },
  ): Promise<RenderedPatientEmergencyContact[]> {
    return trx
      .selectFrom('patient_emergency_contacts')
      .select([
        'id',
        'name',
        'relationship',
        'phone_number',
        'contact_order',
      ])
      .where('patient_id', '=', patient_id)
      .orderBy('contact_order', 'asc')
      .orderBy('created_at', 'asc')
      .execute()
  },
  getPrimaryContact(
    trx: TrxOrDb,
    { patient_id }: { patient_id: string },
  ): Promise<RenderedPatientEmergencyContact | undefined> {
    return trx
      .selectFrom('patient_emergency_contacts')
      .select([
        'id',
        'name',
        'relationship',
        'phone_number',
        'contact_order',
      ])
      .where('patient_id', '=', patient_id)
      .where('contact_order', '=', 0)
      .executeTakeFirst()
  },
  async addContact(
    trx: TrxOrDb,
    {
      patient_id,
      name,
      relationship,
      phone_number,
      contact_order = 0,
    }: {
      patient_id: string
      name: string
      relationship: EmergencyContactRelationship
      phone_number: string
      contact_order?: number
    },
  ) {
    assertOr400(
      phone_number.length > 0,
      'Phone number is required',
    )

    assertOr400(
      name.trim().length > 0,
      'Contact name is required',
    )

    if (contact_order !== undefined) {
      await trx
        .updateTable('patient_emergency_contacts')
        .where('patient_id', '=', patient_id)
        .where('contact_order', '=', contact_order)
        .set({ contact_order: contact_order + 1 })
        .execute()
    }

    return trx
      .insertInto('patient_emergency_contacts')
      .values({
        patient_id,
        name: name.trim(),
        relationship,
        phone_number,
        contact_order,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  },
  async updateContact(
    trx: TrxOrDb,
    {
      id,
      patient_id,
      name,
      relationship,
      phone_number,
      contact_order,
    }: {
      id: string
      patient_id: string
      name?: string
      relationship?: EmergencyContactRelationship
      phone_number?: string
      contact_order?: number
    },
  ) {
    if (contact_order !== undefined) {
      await trx
        .updateTable('patient_emergency_contacts')
        .where('patient_id', '=', patient_id)
        .where('id', '!=', id)
        .where('contact_order', '=', contact_order)
        .set({ contact_order: contact_order + 1 })
        .execute()
    }

    const updates: Partial<PatientEmergencyContact> = {}
    if (name !== undefined) updates.name = name.trim()
    if (relationship !== undefined) updates.relationship = relationship
    if (phone_number !== undefined) updates.phone_number = phone_number
    if (contact_order !== undefined) updates.contact_order = contact_order

    assertOr400(
      Object.keys(updates).length > 0,
      'No fields to update',
    )

    return trx
      .updateTable('patient_emergency_contacts')
      .where('id', '=', id)
      .where('patient_id', '=', patient_id)
      .set(updates)
      .returningAll()
      .executeTakeFirstOrThrow()
  },
  removeContact(
    trx: TrxOrDb,
    {
      id,
      patient_id,
    }: {
      id: string
      patient_id: string
    },
  ) {
    return trx
      .deleteFrom('patient_emergency_contacts')
      .where('id', '=', id)
      .where('patient_id', '=', patient_id)
      .executeTakeFirstOrThrow()
  },
  async setContacts(
    trx: TrxOrDb,
    {
      patient_id,
      contacts,
    }: {
      patient_id: string
      contacts: Array<{
        name: string
        relationship: EmergencyContactRelationship
        phone_number: string
        contact_order?: number
      }>
    },
  ) {
    assertOr400(
      contacts.length > 0,
      'At least one emergency contact is required',
    )

    await trx
      .deleteFrom('patient_emergency_contacts')
      .where('patient_id', '=', patient_id)
      .execute()

    return trx
      .insertInto('patient_emergency_contacts')
      .values(
        contacts.map((contact) => ({
          patient_id,
          name: contact.name.trim(),
          relationship: contact.relationship,
          phone_number: contact.phone_number,
          contact_order: contact.contact_order ?? 0,
        })),
      )
      .returningAll()
      .execute()
  },
}
