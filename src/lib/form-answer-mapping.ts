/** Apply canonical attorney fields to legacy PDF keys after all edits merge. */
export function mapFormAnswers(input: Record<string, unknown>): Record<string, unknown> {
  const answers = { ...input };
  const aliases: Record<string, string[]> = {
    full_name: ["client_full_name", "full_legal_name", "mail_inmate_name"],
    arrest_date: ["date_taken_into_custody", "date_of_custody", "detention_start_date"],
    federal_id: ["booking_number"],
    district_court: ["filing_district", "federal_district"],
    family_ties: ["community_ties", "family_in_us", "us_relatives"],
    facility_name: ["mail_current_location"],
    facility_address: ["mail_facility_address"],
    warden_name: ["respondent_name"],
  };
  for (const [canonical, keys] of Object.entries(aliases)) {
    if (Object.hasOwn(input, canonical) && input[canonical] != null) {
      for (const key of keys) answers[key] = input[canonical];
    }
  }
  return answers;
}