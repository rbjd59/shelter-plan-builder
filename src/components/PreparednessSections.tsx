import { useLang } from "@/context/LanguageContext";
import { PREPAREDNESS_COPY } from "@/lib/preparedness-content";

export function PreparednessVideos() {
  const { lang } = useLang();
  const t = PREPAREDNESS_COPY[lang];
  return <section className="home-band home-preparedness" id="how-it-works-video"><div className="home-container">
    <h2>{t.videoHeading}</h2>
    <div className="home-script-grid">{t.videos.map((video, i) => <article key={video.title} id={i === 0 ? "how-app-works" : undefined}>
      <span className="home-readiness-eyebrow">0{i + 1}</span><h3>{video.title}</h3>
      <details><summary>{t.scriptLabel}</summary><p>{video.script}</p></details>
    </article>)}</div>
  </div></section>;
}

export function PreparednessDisclosures() {
  const { lang } = useLang();
  const t = PREPAREDNESS_COPY[lang];
  return <section className="home-band home-preparedness" id="signing-alternatives"><div className="home-container">
    <h2>{t.identityHeading}</h2><p>{t.federal}</p><p>{t.witnesses}</p><p>{t.passport}</p>
    <div className="home-preparedness-sources"><a href="https://uscode.house.gov/view.xhtml?req=granuleid:USC-prelim-title28-section1746&num=0&edition=prelim" target="_blank" rel="noopener noreferrer">28 U.S.C. § 1746</a><a href="https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0100-0199/0117/Sections/0117.05.html" target="_blank" rel="noopener noreferrer">Fla. Stat. § 117.05</a><a href="https://www.floridabar.org/public/consumer/pamphlet/poa/" target="_blank" rel="noopener noreferrer">Florida Power of Attorney</a><a href="https://www.floridanotaryonline.com/" target="_blank" rel="noopener noreferrer">Florida · Remote Online Notarization</a></div>
    <h2>{t.commercialHeading}</h2><p>{t.commercial}</p>
  </div></section>;
}