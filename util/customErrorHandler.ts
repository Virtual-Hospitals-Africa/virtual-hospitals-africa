import { CustomError } from '../types.ts'

export default function customErrorMessage(
  message: string,
  errorType: boolean,
): CustomError {
  return {
    errorKnown: errorType,
    message: message,
  }
}
