export function getCountryCode(country: string): string {
  switch (country) {
    case 'za':
      return '+27'
    case 'zw':
      return '+263'
    default:
      return
  }
}
