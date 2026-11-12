export type IntakeSignupAnswers = Record<string, string | boolean>;

// Only non-secret intake fields may travel with account registration.
export function signupDetails(answers: IntakeSignupAnswers): IntakeSignupAnswers {
  const keys = ["full_name", "client_email", "client_mobile", "referral_church", "referral_pastor", "signup_assisted_by", "heard_about_app", "intake_terms_accepted", "intake_terms_accepted_at"];
  return Object.fromEntries(keys.filter((key) => answers[key] !== undefined).map((key) => [key, answers[key]]));
}

export function canStartQuestionnaire(answers: IntakeSignupAnswers, signedIn: boolean): boolean {
  return signedIn && answers.intake_terms_accepted === true &&
    typeof answers.full_name === "string" && !!answers.full_name.trim() &&
    typeof answers.client_email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(answers.client_email) &&
    typeof answers.client_mobile === "string" && !!answers.client_mobile.trim();
}