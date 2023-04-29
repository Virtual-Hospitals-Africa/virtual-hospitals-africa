import { TrxOrDb, UnhandledPatientMessage } from "../types.ts";

// This should remove the scheduled appointment from the database and from google calendar
export function cancelAppointment(
  _trx: TrxOrDb,
  _patientMessage: UnhandledPatientMessage,
): Promise<UnhandledPatientMessage> {
  throw new Error("TODO: implement cancelAppointment. The ");
}
