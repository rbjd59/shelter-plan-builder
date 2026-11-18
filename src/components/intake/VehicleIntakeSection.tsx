import type { Dispatch, SetStateAction } from "react";
import { VEHICLE_FIELD_COPY } from "@/lib/vehicle-rescue";
import type { Lang } from "@/context/LanguageContext";

type Answers = Record<string, string | boolean>;
type Props = { lang: Lang; answers: Answers; setAnswers: Dispatch<SetStateAction<Answers>> };

export default function VehicleIntakeSection({ lang, answers, setAnswers }: Props) {
  const c = VEHICLE_FIELD_COPY[lang];
  const checked = answers.has_vehicle === true;
  const set = (key: string, value: string | boolean) => setAnswers((current) => ({ ...current, [key]: value }));
  const value = (key: string) => typeof answers[key] === "string" ? String(answers[key]) : "";
  const input = (key: string, label: string, options?: { required?: boolean; maxLength?: number; pattern?: string; placeholder?: string; inputMode?: "text" | "numeric" }) => (
    <label className="block text-sm font-semibold">{label}
      <input name={key} required={checked && options?.required !== false} maxLength={options?.maxLength ?? 160} pattern={options?.pattern} placeholder={options?.placeholder} inputMode={options?.inputMode}
        value={value(key)} onChange={(event) => set(key, event.target.value)} className="intake-stage-input mt-2" />
    </label>
  );
  const select = (key: string, label: string, choices: [string, string][]) => (
    <label className="block text-sm font-semibold">{label}
      <select name={key} value={value(key)} onChange={(event) => set(key, event.target.value)} className="intake-stage-input mt-2">
        {choices.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
    </label>
  );
  return <section id="vehicle-intake" style={{ marginBottom: 32, background: "#1a2436", padding: 24, borderRadius: 6, borderLeft: "4px solid #e8a04a" }}>
    <label className="flex items-start gap-3 text-base font-bold">
      <input name="has_vehicle" type="checkbox" className="mt-1 h-5 w-5 shrink-0" checked={checked} onChange={(event) => set("has_vehicle", event.target.checked)} />
      <span>{c.checkbox}</span>
    </label>
    {checked && <div className="mt-6">
      <h2 className="text-xl font-bold">{c.title}</h2>
      <p className="mb-5 mt-2 text-sm leading-relaxed text-[#cfc8b8]">{c.intro}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {input("vehicle_year", c.year, { maxLength: 4, pattern: "(19|20)[0-9]{2}", inputMode: "numeric", placeholder: "2020" })}
        {input("vehicle_make", c.make, { maxLength: 80 })}
        {input("vehicle_model", c.model, { maxLength: 80 })}
        {input("vehicle_vin", c.vin, { maxLength: 17, pattern: "[A-HJ-NPR-Z0-9a-hj-npr-z0-9]{17}" })}
        {input("vehicle_plate", c.plate, { maxLength: 20 })}
        {input("vehicle_plate_state", c.plateState, { maxLength: 2, pattern: "[A-Za-z]{2}", placeholder: "FL" })}
      </div>
      <div className="mt-4 grid gap-4">
        <label className="block text-sm font-semibold">{c.titleOwners}
          <textarea name="vehicle_title_owners" required rows={3} maxLength={1000} value={value("vehicle_title_owners")} onChange={(event) => set("vehicle_title_owners", event.target.value)} className="intake-stage-input mt-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {select("vehicle_title_connector", c.titleConnector, [["and", c.and], ["or", c.or]])}
          {select("vehicle_title_holder", c.titleHolder, [["owner", c.owner], ["lender", c.lender], ["lost", c.lost]])}
          {input("vehicle_lienholder", c.lienholder, { required: false })}
          {input("vehicle_insurance", c.insurance, { required: false })}
        </div>
        <label className="block text-sm font-semibold">{c.keysTitleLocation}
          <textarea name="vehicle_keys_title_location" required rows={2} maxLength={1000} value={value("vehicle_keys_title_location")} onChange={(event) => set("vehicle_keys_title_location", event.target.value)} className="intake-stage-input mt-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("vehicle_contact_name", c.contactName)}
          {input("vehicle_contact_relationship", c.contactRelationship)}
          {input("vehicle_contact_phone", c.contactPhone, { maxLength: 40 })}
          {select("vehicle_proceeds", c.proceeds, [["designated_contact", c.designated_contact], ["facility", c.facility], ["law_firm", c.law_firm], ["split", c.split]])}
        </div>
        <label className="block text-sm font-semibold">{c.proceedsDetails}
          <textarea name="vehicle_proceeds_details" required={value("vehicle_proceeds") === "split"} rows={2} maxLength={1000} value={value("vehicle_proceeds_details")} onChange={(event) => set("vehicle_proceeds_details", event.target.value)} className="intake-stage-input mt-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          {select("vehicle_agent_type", c.agentType, [["family", c.family], ["law_firm", c.lawFirmAgent]])}
          {value("vehicle_agent_type") !== "law_firm" && input("vehicle_agent_name", c.agentName)}
        </div>
      </div>
    </div>}
  </section>;
}
