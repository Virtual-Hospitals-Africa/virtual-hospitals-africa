const regulator_emails = [
  'william.t.weiss@gmail.com',
  'zorachen84613@gmail.com',
  'mike.huang.mikank@gmail.com',
  '812046661lm@gmail.com',
]

export function isInvited(email: string): Promise<boolean> {
  return Promise.resolve(regulator_emails.includes(email))
}
