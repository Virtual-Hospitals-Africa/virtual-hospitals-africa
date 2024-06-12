const regulator_emails = [
  'will@morehumaninternet.org',
  'mike.huang.mikank@gmail.com',
]

export function isInvited(email: string): Promise<boolean> {
  return Promise.resolve(regulator_emails.includes(email))
}
