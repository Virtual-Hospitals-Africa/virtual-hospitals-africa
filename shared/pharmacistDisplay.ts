import { RenderedPharmacist } from '../types.ts'

export function pharmacistDisplay(pharmacist: RenderedPharmacist) {
  return {
    display_name: pharmacist.name,
    description: 'Pharmacist',
    avatar_url: null,
  }
}
