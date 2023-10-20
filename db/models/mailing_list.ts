import { MailingListRecipient, TrxOrDb } from '../../types.ts'

export function add(
  trx: TrxOrDb,
  recipient: MailingListRecipient,
) {
  return trx
    .insertInto('mailing_list')
    .values(recipient)
    .execute()
}
