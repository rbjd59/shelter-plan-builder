/**
 * The fields that feed every generated form. Shared by the attorney's editable
 * page and the server-side completeness check so both agree on what matters.
 */
export interface FormField {
  key: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  type?: "text" | "date";
}

export interface FormFieldGroup {
  title: string;
  note?: string;
  fields: FormField[];
}

export const FORM_FIELD_GROUPS: FormFieldGroup[] = [
  {
    title: "The person",
    note: "Pre-filled from their intake answers.",
    fields: [
      { key: "full_name", label: "Full legal name", required: true },
      { key: "a_number", label: "A-number", required: true },
      { key: "date_of_birth", label: "Date of birth", type: "date" },
      { key: "place_of_birth", label: "Place of birth" },
      { key: "country_of_origin", label: "Country of origin" },
      { key: "client_email", label: "Email" },
      { key: "language", label: "Language" },
    ],
  },
  {
    title: "Where they are held",
    note: "Entered after we locate them. Required before the packet can be mailed.",
    fields: [
      { key: "facility_name", label: "Facility", required: true },
      { key: "facility_address", label: "Mailing address", required: true, multiline: true },
      { key: "warden_name", label: "Warden / officer in charge", required: true },
      { key: "arrest_date", label: "Date of arrest", type: "date" },
      { key: "federal_id", label: "Federal / booking ID" },
    ],
  },
  {
    title: "Case details",
    fields: [
      { key: "district_court", label: "District court" },
      { key: "immigration_status", label: "Immigration status" },
      { key: "years_in_us", label: "Years in the United States" },
      { key: "criminal_history", label: "Criminal history", multiline: true },
      { key: "family_ties", label: "Family ties in the United States", multiline: true },
      { key: "medical_conditions", label: "Medical conditions", multiline: true },
      { key: "fear_of_return", label: "Fear of return", multiline: true },
      { key: "locate_notes", label: "Notes from the locate desk", multiline: true },
    ],
  },
];

export const ALL_FORM_FIELDS: FormField[] = FORM_FIELD_GROUPS.flatMap((g) => g.fields);

export const REQUIRED_FORM_FIELDS = ALL_FORM_FIELDS.filter((f) => f.required).map((f) => f.key);
