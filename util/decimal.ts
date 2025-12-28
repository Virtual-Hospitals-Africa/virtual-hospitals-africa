// Roundabout way to get typescript to recognize that Decimal is a class
import { Decimal as DecimalClass } from 'decimal'
import { defineDecimal } from './decimal-definition.ts'

export const Decimal: typeof DecimalClass =
  defineDecimal() as unknown as typeof DecimalClass
export type Decimal = DecimalClass
