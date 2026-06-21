# Intake v2 — Question Spec for Bond/Memorandum Generation

> **Status:** Draft for review. No code changes yet.
> **Goal:** Capture enough structured facts for AI to draft a defensible Memorandum of Law and Motion for Bond, while staying answerable at a **3rd–4th grade Spanish reading level**.
> **Voice:** *Tú* (informal), short sentences (≤12 words), one idea per question. Every factual recall question offers **Sí / No / No recuerdo**.
> **UX:** 6 short steps, autosave every field, progress bar, optional 🔊 audio playback per question (ElevenLabs, already in secrets).

---

## Field-type legend

| Type | Notes |
|------|-------|
| `text` | Single-line. |
| `textarea` | Multi-line. Always include a plain-language placeholder example. |
| `radio` | One choice. Always include "No recuerdo" / "I don't remember" / "Mwen pa sonje" when factual. |
| `checkbox_multi` | Multi-select. |
| `yesno` | Sí / No / No recuerdo. |
| `date_loose` | Year + month dropdowns. Never require day; people don't remember. |
| `number` | Plain integer. |
| `repeater` | Add-another rows (e.g. arrests). Show "+ Agregar otro" button. |

---

## Step 1 — Quién eres (Identity) *[mostly already collected]*

Existing fields kept: `full_name`, `other_names_used`, `a_number`, `dob`, `place_of_birth`, `country_of_origin`, `country_of_citizenship`. **No changes** to this step except:

- Add `preferred_language` radio: Español / English / Kreyòl Ayisyen.
- Add `reading_help` yesno: *"¿Alguien te está ayudando a llenar esto?"* — used internally to flag attorney review priority.

---

## Step 2 — Cómo entraste a Estados Unidos (Entry & Immigration History)

This is the legally heaviest section. Drives § 235 vs § 236(a) vs § 241(a) analysis and the "prior parole / no material change" argument.

### 2.1 — First entry

| Key | EN | ES | HT | Type |
|-----|----|----|----|------|
| `first_entry_year` | What year did you first come to the U.S.? | ¿En qué año viniste a Estados Unidos por primera vez? | Ki ane ou te vin Etazini pou premye fwa? | `date_loose` (year only) |
| `entries_count` | How many times have you come to the U.S. in your life? | ¿Cuántas veces has venido a Estados Unidos en tu vida? | Konbyen fwa ou vin Etazini nan lavi ou? | `radio` (1 / 2 / 3 / más de 3 / No recuerdo) |

### 2.2 — Most recent entry

| Key | EN | ES | HT | Type |
|-----|----|----|----|------|
| `last_entry_year` | What year was the last time you entered the U.S.? | ¿En qué año entraste por última vez a Estados Unidos? | Ki ane dènye fwa ou te antre Etazini? | `date_loose` |
| `last_entry_how` | How did you enter that last time? Choose one. | ¿Cómo entraste esa última vez? Escoge uno. | Kijan ou te antre dènye fwa a? Chwazi youn. | `radio` |

`last_entry_how` options (plain language, no statute words):

| Value | EN | ES | HT |
|-------|----|----|----|
| `port_asylum` | I went to a border crossing and asked for asylum | Fui a un puerto de entrada y pedí asilo | Mwen te ale nan yon pòs fwontyè e mwen te mande azil |
| `caught_at_border` | I crossed the border and immigration caught me right away | Crucé la frontera y la migra me agarró enseguida | Mwen te travèse fwontyè a e imigrasyon te kenbe m touswit |
| `crossed_not_caught` | I crossed the border and no one stopped me | Crucé la frontera y nadie me detuvo | Mwen te travèse fwontyè a e pèsòn pa t kenbe m |
| `visa_overstay` | I came with a visa and stayed longer than allowed | Vine con visa y me quedé más tiempo del permitido | Mwen te vini ak yon viza e mwen te rete pi long |
| `parole_program` | I came with a permission program (parole, CBP One, humanitarian) | Vine con un programa de permiso (parole, CBP One, humanitario) | Mwen te vini ak yon pwogram pèmisyon (parole, CBP One) |
| `dont_remember` | I don't remember | No recuerdo | Mwen pa sonje |

| Key | EN | ES | HT | Type |
|-----|----|----|----|------|
| `last_entry_papers` | When you entered, did immigration give you any papers? | Cuando entraste, ¿la migra te dio papeles? | Lè ou te antre, èske imigrasyon te ba ou papye? | `yesno` |
| `last_entry_papers_kept` | If yes, do you still have those papers somewhere? | Si sí, ¿todavía tienes esos papeles en algún lugar? | Si wi, èske ou toujou gen papye sa yo yon kote? | `yesno` (conditional on prior = Sí) |

### 2.3 — Prior contact with ICE / immigration *(THE PAROLE QUESTION)*

| Key | EN | ES | HT | Type |
|-----|----|----|----|------|
| `prior_ice_contact` | Before this time, had immigration ever stopped you or arrested you? | Antes de esta vez, ¿la migra alguna vez te paró o te arrestó? | Anvan fwa sa a, èske imigrasyon te janm kanpe ou oswa arete ou? | `yesno` |

If `prior_ice_contact = Sí`, show this **repeater** (one row per prior incident):

| Key | EN | ES | HT | Type |
|-----|----|----|----|------|
| `prior_year` | What year was that? | ¿En qué año fue? | Ki ane sa te ye? | `date_loose` |
| `prior_what_happened` | What happened that time? Choose one. | ¿Qué pasó esa vez? Escoge uno. | Kisa ki te pase fwa sa a? Chwazi youn. | `radio` ↓ |
| `prior_complied` | After that, did you go to all your appointments and court dates? | Después de eso, ¿fuiste a todas tus citas y a la corte? | Apre sa, èske ou te ale nan tout randevou ou yo ak tribinal la? | `radio` (Sí, a todas / Falté a algunas / No tenía citas / No recuerdo) |

`prior_what_happened` options (this is the critical legal flag):

| Value | ES (canonical) |
|-------|----------------|
| `released_same_day` | Me dejaron salir el mismo día |
| `paroled_with_appt` | Me dejaron salir y me dieron cita para después *(← parole/OR — bond memo gold)* |
| `posted_bond` | Pagué fianza y me dejaron salir |
| `ankle_monitor` | Me pusieron grillete (tobillera) y me dejaron salir |
| `check_ins` | Me dijeron que tenía que ir a reportarme cada cierto tiempo |
| `held_then_released` | Me tuvieron detenido y después me soltaron |
| `deported` | Me deportaron |
| `voluntary_departure` | Me regresé yo mismo a mi país (salida voluntaria) |
| `dont_remember` | No recuerdo |

### 2.4 — Prior immigration applications

> *"¿Alguna vez has pedido alguno de estos? Marca todos los que aplican."*

`prior_applications` checkbox_multi:

| Value | ES |
|-------|----|
| `asylum` | Asilo |
| `tps` | TPS (Estatus de Protección Temporal) |
| `u_visa` | Visa U (víctima de crimen) |
| `vawa` | VAWA (víctima de violencia familiar) |
| `t_visa` | Visa T (víctima de trata) |
| `daca` | DACA |
| `parole` | Parole humanitario |
| `withholding_cat` | Retención de remoción o protección contra tortura |
| `green_card_family` | Residencia por familia |
| `green_card_work` | Residencia por trabajo |
| `cancellation` | Cancelación de remoción |
| `none` | Ninguna |
| `dont_know` | No sé / No recuerdo |

For each checked item, ask: *"¿Cuándo lo pediste?"* (`date_loose`) and *"¿Qué pasó? — Aprobado / Negado / Todavía esperando / No sé"*.

### 2.5 — Prior removal proceedings

| Key | ES | Type |
|-----|----|------|
| `prior_court_case` | ¿Alguna vez has tenido un caso de corte de inmigración? | `yesno` |
| `prior_court_outcome` | Si sí, ¿qué pasó? | `radio`: Sigue abierto / Lo cerraron / El juez me ordenó deportación / Me dieron papeles / No recuerdo |
| `prior_court_attorney` | ¿Tuviste abogado en ese caso? | `yesno` |
| `prior_court_missed` | ¿Alguna vez faltaste a una cita de corte? | `yesno` *(critical — pre-empts gov't "in absentia" argument)* |
| `prior_court_missed_why` | Si sí, ¿por qué faltaste? Cuenta en pocas palabras. | `textarea` (placeholder: *"Ejemplo: nunca me llegó la carta, estaba enfermo, no tenía cómo llegar"*) |

### 2.6 — Trips out of the U.S.

| Key | ES | Type |
|-----|----|------|
| `left_us_after_entry` | Después de entrar, ¿has salido de Estados Unidos alguna vez? | `yesno` |
| `left_us_when` | Si sí, ¿cuándo y por qué? | `textarea` *(flags reinstatement-of-removal risk)* |

---

## Step 3 — Tu familia (Family Ties — Guerra factor #1)

| Key | ES | Type |
|-----|----|------|
| `lives_with_count` | ¿Cuántas personas viven contigo en tu casa? | `number` |
| `household_members` | Escribe los nombres y edades. Una persona por línea. | `textarea` (placeholder: *"María, 8 años, mi hija — Juan, 35, mi esposo"*) |
| `spouse_status` | ¿Tienes esposa o esposo? | `radio`: Sí, casados por la ley / Sí, vivimos juntos / No |
| `spouse_immigration` | Si sí, ¿qué papeles tiene tu esposa o esposo? | `radio`: Ciudadano americano / Residente (green card) / Tiene un caso pendiente / No tiene papeles / No sé |
| `us_citizen_kids` | ¿Tienes hijos que nacieron en Estados Unidos? | `yesno` |
| `us_citizen_kids_count` | ¿Cuántos? | `number` |
| `us_citizen_kids_ages` | ¿Qué edades tienen? | `text` (placeholder: *"3, 7, 12"*) |
| `caregiver_role` | ¿Hay alguien en tu casa enfermo o con discapacidad que tú cuidas? | `yesno` |
| `caregiver_detail` | Si sí, cuenta en pocas palabras. | `textarea` |
| `years_at_address` | ¿Cuántos meses llevas viviendo en tu dirección de ahora? | `number` (months — easier than "since when") |
| `years_in_us_city` | ¿En qué ciudad de Estados Unidos has vivido más tiempo? | `text` |
| `years_in_us_city_months` | ¿Cuántos meses llevas viviendo en esa ciudad? | `number` |

---

## Step 4 — Tu comunidad (Community Ties)

| Key | ES | Type |
|-----|----|------|
| `attends_worship` | ¿Vas a una iglesia, templo o mezquita? | `yesno` |
| `worship_name` | ¿Cuál? Escribe el nombre y la ciudad. | `text` |
| `worship_years` | ¿Cuántos meses llevas yendo? | `number` |
| `kids_in_school` | ¿Tus hijos van a la escuela aquí? | `yesno` |
| `school_name` | Nombre de la escuela | `text` |
| `community_volunteer` | ¿Ayudas en algo de tu comunidad? (Por ejemplo: la iglesia, la escuela, vecinos enfermos) | `textarea` |
| `sponsor_available` | ¿Hay alguien dispuesto a firmar tu fianza si el juez te la pone? | `yesno` |
| `sponsor_name` | Nombre del que firmaría | `text` |
| `sponsor_relation` | ¿Qué es tuyo? | `text` |
| `sponsor_status` | ¿Qué papeles tiene esa persona? | `radio`: Ciudadano / Residente / Otro / No sé |

---

## Step 5 — Tu trabajo (Employment & Work History)

| Key | ES | Type |
|-----|----|------|
| `work_status` | ¿Estás trabajando ahora? | `radio`: Sí, con contrato / Sí, por mi cuenta / Sí, pero sin papel / No estoy trabajando |
| `work_type` | ¿Qué tipo de trabajo haces? | `text` (placeholder: *"Ejemplos: construcción, limpieza, restaurante, manejar camión, cuidar niños, agricultura"*) |
| `work_months_current` | ¿Cuántos meses llevas en tu trabajo de ahora? | `number` |
| `work_employer_name` | Nombre del jefe o de la compañía | `text` |
| `work_same_field_years` | ¿Cuántos años llevas haciendo este tipo de trabajo? | `number` |
| `taxes_filed` | ¿Alguna vez has pagado impuestos (taxes) aquí? | `yesno` |
| `itin_or_ssn` | ¿Tienes número de impuestos (ITIN) o Seguro Social? | `radio`: ITIN / Seguro Social / Los dos / Ninguno / No sé |
| `prior_work_history` | ¿Antes trabajaste en otro lado? Cuenta brevemente. | `textarea` (placeholder: *"Ejemplo: trabajé 3 años en construcción en Houston, después 2 años en un restaurante en Miami"*) |

---

## Step 6 — Problemas con la policía (Arrest & Conviction History)

> Top of section (Spanish): ***"Vamos a hacer estas preguntas con cuidado. Es muy importante decir la verdad — el juez va a ver todo en tu récord. Si no estás seguro, escoge 'No recuerdo'. No hay respuestas malas."***

We split arrest from conviction. Most clients don't know the difference; the form does the work.

| Key | ES | Type |
|-----|----|------|
| `ever_arrested_us` | ¿Alguna vez la policía te ha arrestado en Estados Unidos? (Aunque el caso lo hayan cerrado) | `yesno` |
| `arrest_count_us` | ¿Cuántas veces? | `radio`: 1 / 2 / 3 / Más de 3 / No recuerdo |

If `ever_arrested_us = Sí`, **repeater** per arrest:

| Key | ES | Type |
|-----|----|------|
| `arrest_year` | ¿En qué año? | `date_loose` |
| `arrest_city` | ¿En qué ciudad y estado? | `text` |
| `arrest_about` | ¿De qué fue? Escoge uno. | `radio`: Manejar / Pelea / Drogas / Familia (violencia doméstica) / Robo / Tránsito (tickets) / Otro / No recuerdo |
| `arrest_outcome` | ¿Qué pasó al final? | `radio`: El juez me declaró culpable / El caso se cerró / Pagué multa / Hice clases o servicio / Todavía abierto / No recuerdo |
| `arrest_jail_time` | ¿Te tocó tiempo en la cárcel por ese caso? | `radio`: No / Menos de 1 año / Más de 1 año / No recuerdo |

| Key | ES | Type |
|-----|----|------|
| `ever_arrested_other_country` | ¿Alguna vez te han arrestado fuera de Estados Unidos? | `yesno` |
| `arrest_other_detail` | Si sí, cuenta brevemente. | `textarea` |
| `current_probation_parole` | ¿Estás ahora en probación o en libertad condicional? | `yesno` |
| `restraining_order` | ¿Hay una orden de protección contra ti? (Una persona pidió al juez que no te acerques) | `yesno` |
| `gang_allegation` | ¿Alguna vez la policía o la migra te ha dicho que estás en una pandilla? | `yesno` *(critical — gov't will allege; better we know first)* |
| `gang_allegation_response` | Si sí, ¿es verdad? Cuenta en pocas palabras. | `textarea` |

---

## Step 7 — Tu salud y seguridad (Health & Vulnerability)

Independent grounds for release under *Fraihat v. ICE* and feeds asylum/CAT seed.

| Key | ES | Type |
|-----|----|------|
| `daily_medicine` | ¿Tomas medicina todos los días? | `yesno` |
| `daily_medicine_what` | Si sí, ¿para qué? | `text` (placeholder: *"Ejemplo: para la presión, para la diabetes, para los nervios"*) |
| `serious_conditions` | ¿Tienes alguna de estas enfermedades? Marca las que aplican. | `checkbox_multi` |
| `pregnant_breastfeeding` | ¿Estás embarazada o dando pecho? | `radio`: Sí embarazada / Sí dando pecho / No / No aplica |
| `crime_victim_us` | ¿Alguna vez has sido víctima de un crimen en Estados Unidos? (Te robaron, te golpearon, abuso, etc.) | `yesno` |
| `crime_victim_reported` | ¿Hablaste con la policía sobre eso? | `yesno` *(U-visa eligibility)* |
| `afraid_to_return` | ¿Tienes miedo de regresar a tu país? | `yesno` |
| `afraid_why` | Si sí, ¿por qué? Cuenta en pocas palabras. | `textarea` (placeholder: *"Ejemplo: pandillas me amenazaron, el gobierno me persigue, por mi religión, por ser LGBT, violencia en mi familia"*) |

`serious_conditions` options: Diabetes / Presión alta / Corazón / Pulmones (asma, EPOC) / Cáncer / VIH / Salud mental (depresión, ansiedad) / Discapacidad física / Ninguna / Prefiero no decir.

---

## Trust-building UI elements (apply everywhere)

1. **Section header banner**: *"Cada respuesta ayuda al abogado a sacarte. Si no sabes, escoge 'No recuerdo'. No hay respuestas malas."*
2. **🔊 audio button** next to every question, plays ElevenLabs TTS in the chosen language.
3. **Autosave indicator** ("Guardado ✓") on every field blur — persists to `intake_submissions` immediately.
4. **Progress bar** at top: "Paso 3 de 7".
5. **Resume link**: emailed/SMSed magic link so they can leave and come back.
6. **Reading-level CI check**: before merge, every ES string passes Fernández-Huerta ≥80. Add `scripts/check-reading-level.ts` to test pipeline.
7. **Native-speaker review gate**: Spanish copy reviewed by a bilingual paralegal before launch (sign-off recorded in this doc).

---

## How this maps to the AI memo

When the Memorandum of Law prompt runs, it gets a structured JSON of these fields and a strict instruction: *"Only assert facts from the JSON. If a field is empty or 'No recuerdo', write `[CLIENT DID NOT RECALL]` and do not infer."*

Specific prompt branches:

- If `prior_what_happened ∈ {paroled_with_appt, posted_bond, ankle_monitor, check_ins}` **AND** `prior_complied = "Sí, a todas"` → memo includes the **"no material change in circumstances"** argument with *Diop* / *Demore* / district-court citations.
- If `prior_court_missed = Sí` and `prior_court_missed_why` is non-empty → memo includes a **§ 240(b)(5)(C) rescission-style explanation** and an exceptional-circumstances argument; if empty, memo omits the topic instead of guessing.
- If `us_citizen_kids = Sí` AND `caregiver_role = Sí` → memo leads Statement of Facts with U.S.-citizen-child + caregiver hardship under *Matter of Andazola* / *Recinas*.
- If `work_same_field_years ≥ 3` AND `taxes_filed = Sí` → memo includes employment stability + tax compliance as flight-risk rebuttal.
- If `gang_allegation = Sí` AND `gang_allegation_response` is non-empty → memo pre-empts with the client's explanation; never silently ignores.
- If `afraid_to_return = Sí` → motion adds a one-paragraph fear-of-return preview (not a full asylum brief) and flags the case for separate I-589 workflow.

---

## Open questions for review

1. **Step 6 placement** — should arrest history be optional (skippable) for first pass? Pro: completion rate. Con: gov't will surface it anyway, better we have it.
2. **Audio playback** — ship at v2 launch, or v2.1? It's ~1 day of work but adds real value for low-literacy users.
3. **Native-speaker reviewer** — do you have a paralegal already, or should we budget for that?
4. **Step 2.4 (prior applications)** — keep the full 12-option list, or trim to the top 5 most common (asylum, TPS, parole, green card, none)?
5. **Kreyòl Ayisyen translations above are draft** — same native-speaker review needed before launch.

---

*End of spec. Mark up directly in this file with comments / inline edits and ping me to revise.*
