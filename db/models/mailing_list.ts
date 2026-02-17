import { MailingListRecipient, TrxOrDbOrQueryCreator } from '../../types.ts'

export const mailing_list = {
  add(
    trx: TrxOrDbOrQueryCreator,
    recipient: MailingListRecipient,
  ) {
    return trx
      .insertInto('mailing_list')
      .values(recipient)
      .execute()
  },
}
