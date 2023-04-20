import { ColumnType, Generated } from "kysely";

export type Maybe<T> = T | null | undefined;

export type Falsy = false | 0 | "" | null | undefined;

export type Done<T> = (err?: any, result?: T) => void;

export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T;

export type SqlRow<T> = {
  id: Generated<number>;
  created_at: ColumnType<Date, undefined, never>;
  updated_at: ColumnType<Date, undefined, never>;
} & T;

// export type InsertSqlRow<SqlRow<T>> = Omit<
//   T,
//   "id" | "created_at" | "updated_at"
// >;

export type ReturnedSqlRow<T> = {
  id: number;
  created_at: Date;
  updated_at: Date;
} & T;

export type Gender = "male" | "female" | "other";

export type ConversationState =
  | "not_onboarded:welcome"
  | "not_onboarded:make_appointment:enter_name"
  | "not_onboarded:make_appointment:enter_gender"
  | "not_onboarded:make_appointment:enter_date_of_birth"
  | "not_onboarded:make_appointment:enter_national_id_number"
  | "onboarded:make_appointment:enter_appointment_reason"
  | "onboarded:make_appointment:confirm_details"
  | "onboarded:make_appointment:first_scheduling_option"
  | "onboarded:make_appointment:other_scheduling_options"
  | "onboarded:appointment_scheduled"
  | "not_onboarded:submit_medical_updates:check_onboarding"
  | "not_onboarded:services:check_onboarding"
  | "other_end_of_demo";

export type Patient = {
  conversation_state: Maybe<ConversationState>;
} & PatientDemographicInfo;

export type PatientDemographicInfo = {
  phone_number: string;
  name: Maybe<string>;
  gender: Maybe<Gender>;
  date_of_birth: Maybe<string>;
  national_id_number: Maybe<string>;
};

export type AppointmentOfferedTime = {
  appointment_id: number;
  doctor_id: number;
  // doctor_name: string;
  start: string;
  patient_declined: boolean;
  scheduled_gcal_event_id: string;
};

export type UnhandledPatientMessage = {
  message_id: number;
  patient_id: number;
  whatsapp_id: string;
  body: string;
  phone_number: string;
  name: Maybe<string>;
  gender: Maybe<Gender>;
  date_of_birth: Maybe<string>;
  national_id_number: Maybe<string>;
  conversation_state: Maybe<ConversationState>;
  scheduling_appointment_id?: number;
  scheduling_appointment_reason?: Maybe<string>;
  appointment_offered_times: [null] | ReturnedSqlRow<
    AppointmentOfferedTime & { doctor_name: string }
  >[];
  created_at: Date;
  updated_at: Date;
};

// TODO; typecheck that onEnter return gets passed to prompt or eliminate this whole concept
export type ConversationStateHandlerType<T> = T & {
  prompt: string | ((patientMessage: UnhandledPatientMessage) => string);
  onEnter?: (
    patientMessage: UnhandledPatientMessage,
    next: DetermineNextPatientStateReturn,
  ) => Promise<UnhandledPatientMessage>;
};

export type ConversationStateHandlerReturn = {
  nextState: ConversationState;
  patientUpdates?: Partial<PatientDemographicInfo>;
  appointmentUpdates?: Partial<Appointment>;
};

export type ConversationStateHandlerOnResponse =
  | ConversationState
  | ((
    patientMessage: UnhandledPatientMessage,
  ) => ConversationStateHandlerReturn);

export type ConversationStateHandlerSelectOption = {
  option: string;
  display: string;
  aliases?: string[];
  onResponse: ConversationStateHandlerOnResponse;
};

export type ConversationStateHandlerSelect = ConversationStateHandlerType<{
  type: "select";
  options: ConversationStateHandlerSelectOption[];
}>;

export type ConversationStateHandlerString = ConversationStateHandlerType<{
  type: "string";
  validation?: (value: string) => boolean;
  onResponse: ConversationStateHandlerOnResponse;
}>;

export type ConversationStateHandlerDate = ConversationStateHandlerType<{
  type: "date";
  onResponse: ConversationStateHandlerOnResponse;
}>;

export type ConversationStateHandler =
  | ConversationStateHandlerSelect
  | ConversationStateHandlerString
  | ConversationStateHandlerDate
  | ConversationStateHandlerType<{ type: "end_of_demo" }>;

export type Appointment = {
  patient_id: number;
  reason: Maybe<string>;
};

export type DetermineNextPatientStateValidReturn = {
  nextPatient?: Patient & { id: number };
  nextAppointment?: Appointment & { id: number };
};

export type DetermineNextPatientStateReturn =
  | "invalid_response"
  | DetermineNextPatientStateValidReturn;

export type IncomingWhatAppMessage = {
  object: "whatsapp_business_account";
  entry: [
    {
      id: string;
      changes: [
        {
          value: {
            messaging_product: "whatsapp";
            metadata: {
              display_phone_number: string;
              phone_number_id: string;
            };
            contacts?: ReadonlyArray<{
              profile: {
                name: string;
              };
              wa_id: string;
            }>;
            statuses?: ReadonlyArray<{
              id: string;
              status: "delivered";
              timestamp: string; // '1673944826'
              recipient_id: string; // '12032535603'
              conversation: {
                id: string;
                origin: {
                  type: "business_initiated";
                };
              };
              pricing: {
                billable: true;
                pricing_model: "CBP";
                category: "business_initiated";
              };
            }>;
            messages?: ReadonlyArray<{
              from: string; // phone number
              id: string;
              timestamp: string; // '1673943918'
              text: {
                body: string;
              };
              type: "text";
            }>;
          };
          field: "messages";
        },
      ];
    },
  ];
};

export type etag = string;
export type date = string;
export type datetime = string;
export type integer = number;

export type GoogleTokens = {
  access_token: string;
  refresh_token: string;
};

export type GCalEvent = {
  "kind": "calendar#event";
  "etag": etag;
  "id": string;
  "status": string;
  "htmlLink": string;
  "created": datetime;
  "updated": datetime;
  "summary": string;
  "description": string;
  "location": string;
  "colorId": string;
  "creator": {
    "id": string;
    "email": string;
    "displayName": string;
    "self": boolean;
  };
  "organizer": {
    "id": string;
    "email": string;
    "displayName": string;
    "self": boolean;
  };
  "start": {
    "date": date;
    "dateTime": datetime; // "2016-02-03T19:30:00-05:00"
    "timeZone": string;
  };
  "end": {
    "date": date;
    "dateTime": datetime; // "2016-02-03T20:30:00-05:00"
    "timeZone": string;
  };
  "endTimeUnspecified": boolean;
  "recurrence": [
    string,
  ];
  "recurringEventId": string;
  "originalStartTime": {
    "date": date;
    "dateTime": datetime;
    "timeZone": string;
  };
  "transparency": string;
  "visibility": string;
  "iCalUID": string;
  "sequence": integer;
  "attendees": [
    {
      "id": string;
      "email": string;
      "displayName": string;
      "organizer": boolean;
      "self": boolean;
      "resource": boolean;
      "optional": boolean;
      "responseStatus": "needsAction" | "declined" | "tentative" | "accepted";
      "comment": string;
      "additionalGuests": integer;
    },
  ];
  "attendeesOmitted": boolean;
  "extendedProperties": any;
  "hangoutLink": string;
  "conferenceData": {
    "createRequest": {
      "requestId": string;
      "conferenceSolutionKey": {
        "type": string;
      };
      "status": {
        "statusCode": string;
      };
    };
    "entryPoints": [
      {
        "entryPointType": string;
        "uri": string;
        "label": string;
        "pin": string;
        "accessCode": string;
        "meetingCode": string;
        "passcode": string;
        "password": string;
      },
    ];
    "conferenceSolution": {
      "key": {
        "type": string;
      };
      "name": string;
      "iconUri": string;
    };
    "conferenceId": string;
    "signature": string;
    "notes": string;
  };
  "gadget": {
    "type": string;
    "title": string;
    "link": string;
    "iconLink": string;
    "width": integer;
    "height": integer;
    "display": string;
    "preferences": any;
  };
  "anyoneCanAddSelf": boolean;
  "guestsCanInviteOthers": boolean;
  "guestsCanModify": boolean;
  "guestsCanSeeOtherGuests": boolean;
  "privateCopy": boolean;
  "locked": boolean;
  "reminders": {
    "useDefault": boolean;
    "overrides": [
      {
        "method": string;
        "minutes": integer;
      },
    ];
  };
  "source": {
    "url": string;
    "title": string;
  };
  "attachments": [
    {
      "fileUrl": string;
      "title": string;
      "mimeType": string;
      "iconLink": string;
      "fileId": string;
    },
  ];
  "eventType": string;
};

export type GCalEventsResponse = {
  kind: "calendar#events";
  etag: string;
  summary: string; // user's email address
  updated: string; // "2023-03-07T23:01:55.798Z"
  timeZone: string; // "America/New_York"
  accessRole: string; // "owner"
  defaultReminders: {
    method: "email" | "popup" | "sms" | "alert";
    minutes: number;
  }[];
  nextPageToken: string;
  items: GCalEvent[];
};

export type GCalCalendarListEntry = {
  "kind": "calendar#calendarListEntry";
  "etag": etag;
  "id": string;
  "summary": string;
  "description": string;
  "location": string;
  "timeZone": string;
  "summaryOverride": string;
  "colorId": string;
  "backgroundColor": string;
  "foregroundColor": string;
  "hidden": boolean;
  "selected": boolean;
  "accessRole": string;
  "defaultReminders": [
    {
      "method": string;
      "minutes": integer;
    },
  ];
  "notificationSettings": {
    "notifications": [
      {
        "type": string;
        "method": string;
      },
    ];
  };
  "primary": boolean;
  "deleted": boolean;
  "conferenceProperties": {
    "allowedConferenceSolutionTypes": [
      string,
    ];
  };
};

export type GCalCalendarList = {
  kind: "calendar#calendarList";
  etag: string;
  nextSyncToken: string;
  items: GCalCalendarListEntry[];
};

export type GCalFreeBusy = {
  kind: "calendar#freeBusy";
  timeMin: string;
  timeMax: string;
  calendars: {
    [calendarId: string]: {
      "busy": { start: string; end: string }[];
    };
  };
};

export type GoogleProfile = {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
};

export type Doctor = {
  name: string;
  email: string;
  gcal_appointments_calendar_id: string;
  gcal_availability_calendar_id: string;
};

export type DoctorGoogleToken = GoogleTokens & {
  doctor_id: number;
  expires_at: Date;
};

export type DoctorWithGoogleTokens = ReturnedSqlRow<Doctor & GoogleTokens>;

export type DoctorWithPossibleGoogleTokens = ReturnedSqlRow<
  Doctor & {
    access_token: Maybe<string>;
    refresh_token: Maybe<string>;
  }
>;

export type Availability = {
  start: string;
  end: string;
}[];

export type TimeRange = {
  timeMin: Date;
  timeMax: Date;
};

export type DoctorAvailability = {
  doctor: DoctorWithGoogleTokens;
  availability: Availability;
};

export type ScheduledAppointment = {
  appointment_offered_time_id: number;
  gcal_event_id: string;
};

export type FullScheduledAppointment = {
  id: number;
  reason: string;
};

export type WhatsappMessageReceived = {
  patient_id: number;
  whatsapp_id: string;
  body: string;
  started_responding_at: Maybe<ColumnType<Date>>;
  conversation_state: ConversationState | "initial_message";
};

export type WhatsappMessageSent = {
  patient_id: number;
  whatsapp_id: string;
  body: string;
  responding_to_id: number;
  read_status: string;
};

export type Time = {
  hour:
    | 1
    | 2
    | 3
    | 4
    | 5
    | 6
    | 7
    | 8
    | 9
    | 10
    | 11
    | 12;
  minute: 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55;
  amPm: "am" | "pm";
};

export type TimeWindow = {
  start: Time;
  end: Time;
};

export type AvailabilityJSON = {
  Sunday: TimeWindow[];
  Monday: TimeWindow[];
  Tuesday: TimeWindow[];
  Wednesday: TimeWindow[];
  Thursday: TimeWindow[];
  Friday: TimeWindow[];
  Saturday: TimeWindow[];
};

export type DayOfWeek = keyof AvailabilityJSON;
