
UPDATE public.app_clients
SET email = 'juan.perez+demo@detenciondefensa.test',
    phone_e164 = '+13055550199',
    place_of_birth = 'San Salvador, El Salvador',
    country_of_origin = 'El Salvador',
    has_asset_protection = true,
    has_pet_rescue = true
WHERE invite_token = 'DEMO0001';

INSERT INTO public.intake_submissions (stripe_session_id, language, email, paid, answers)
VALUES (
  'demo_session_DEMO0001',
  'en',
  'juan.perez+demo@detenciondefensa.test',
  true,
  jsonb_build_object(
    'full_name', 'Juan Carlos Perez',
    'other_names_used', 'Juan C. Perez; J. Perez',
    'dob', '1988-04-12',
    'a_number', 'A123-456-789',
    'country_of_citizenship', 'El Salvador',
    'place_of_birth', 'San Salvador, El Salvador',
    'contact_phone', '+13055550199',
    'contact_email', 'juan.perez+demo@detenciondefensa.test',
    'mail_current_location', '1450 NW 12th Ave, Miami, FL 33136',
    'facility_address', 'Krome Service Processing Center, 18201 SW 12th St, Miami, FL 33194',
    'facility_name', 'Krome Service Processing Center',
    'date_taken_into_custody', '2026-06-10',
    'detainer_date', '2026-06-10',
    'prior_immigration_proceedings', 'Petitioner entered the United States in 2014 and has resided continuously in Miami-Dade County since. Petitioner has a U.S. citizen spouse and two U.S. citizen children. Petitioner has no criminal convictions. Petitioner was detained by ICE on June 10, 2026 during a routine check-in and has been held without an individualized bond hearing.',
    'ground_one', 'Continued detention without an individualized bond hearing violates the Due Process Clause of the Fifth Amendment.',
    'ground_two', 'Petitioner is not subject to mandatory detention under 8 U.S.C. § 1226(c) and is neither a flight risk nor a danger to the community.',
    'relief_requested', 'Petitioner respectfully requests that this Court issue a writ of habeas corpus and order Petitioner''s immediate release, or in the alternative, an individualized bond hearing before an immigration judge at which the government bears the burden of justifying continued detention.',
    'emergency_contact_name', 'Maria Perez',
    'emergency_contact_phone', '+13055550101',
    'emergency_contact_email', 'maria.perez+demo@detenciondefensa.test',
    'emergency_contact_relation', 'Spouse',
    'emergency_contact_2_name', 'Carlos Perez',
    'emergency_contact_2_phone', '+13055550102',
    'emergency_contact_2_email', 'carlos.perez+demo@detenciondefensa.test',
    'emergency_contact_2_relation', 'Brother',
    'addon_asset_protection', true,
    'addon_pet_rescue', true,
    'monthly_income', '2400',
    'monthly_expenses', '2100',
    'cash_on_hand', '350',
    'bank_balance', '1200',
    'dependents', '2',
    'employer', 'Sunshine Landscaping LLC',
    'occupation', 'Landscaper'
  )
)
ON CONFLICT (stripe_session_id) DO UPDATE SET answers = EXCLUDED.answers, paid = true, email = EXCLUDED.email;

UPDATE public.app_clients SET intake_session_id = 'demo_session_DEMO0001' WHERE invite_token = 'DEMO0001';
