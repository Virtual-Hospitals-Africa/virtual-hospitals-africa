import { MailingListRecipient, TrxOrDb } from '../../types.ts'

export const mailing_list = {
  add(
    trx: TrxOrDb,
    recipient: MailingListRecipient,
  ) {
    return trx
      .insertInto('mailing_list')
      .values(recipient)
      .execute()
  },
}
