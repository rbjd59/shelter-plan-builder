import { CarFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Lang } from "@/context/LanguageContext";
import { VEHICLE_HOME_COPY, VEHICLE_PROGRAM_COPY } from "@/lib/vehicle-program-content";
import VehicleProgramVideo from "./VehicleProgramVideo";

export default function VehicleHomeCard({ lang }: { lang: Lang }) {
  const c = VEHICLE_HOME_COPY[lang];
  return (
    <section id="vehicle-program" className="vehicle-home-card-section" aria-labelledby="vehicle-home-title">
      <div className="vehicle-home-card-copy"><p className="vehicle-eyebrow"><CarFront aria-hidden="true" />{VEHICLE_PROGRAM_COPY[lang].heroTitle}</p><h2 id="vehicle-home-title">{c.title}</h2><p>{c.body}</p><Button asChild size="lg"><a href={`/no-pierdas-tu-carro?lang=${lang}`}>{c.link}</a></Button><p className="vehicle-referral-disclosure">{VEHICLE_PROGRAM_COPY[lang].disclosure}</p></div>
      <VehicleProgramVideo key={lang} lang={lang} compact />
    </section>
  );
}
