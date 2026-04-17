export type MailingListEntrypoint =
  | 'mailing_list_signup'
  | 'general_inquiry'
  | 'book_a_demo'
  | 'book_an_intro_call'
  | 'request_investor_deck'

export type MailingListRecipient = {
  name: string
  email: string
  entrypoint: MailingListEntrypoint
  interest?: string | undefined
  message?: string | undefined
  support?: string | undefined
}
