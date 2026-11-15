import { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLang } from '@/context/LanguageContext';
import { READINESS_CHECKS, homeEquity } from '@/lib/readiness-checks';
import { HomePoints } from '@/components/HomePoints';
import { withLang } from '@/lib/outbound-lang';

const binary = [[0,1,2],[],[1,2],[0,5,7],[3]];
const numbers = [[],[],[3,4,5,6],[2,3,4,8,9],[]];
export default function ReadinessChecks() {
 const { lang } = useLang();
 const t = READINESS_CHECKS[lang];
 const [active, setActive] = useState<number | null>(null);
 const [answers, setAnswers] = useState<Record<string,string>>({});
 const [done,setDone] = useState(false);
 const value = (i:number) => answers[`${active}-${i}`] ?? '';
 const amount = (i:number) => value(i).trim() ? Number(value(i)) : NaN;
 const money = (n:number) => new Intl.NumberFormat(lang === 'es' ? 'es-US' : 'en-US',{style:'currency',currency:'USD'}).format(n);
 const choose = (i:number) => {setActive(i);setDone(false);};
 const next = () => {
  if(active===null) return [];
  const r=t.results[active];
  if(active===0) return [r[0],...(value(0)==='no'?[]:[r[1]]),...(value(1)==='no'?[]:[r[2]]),...(value(2)==='no'?[]:[r[3]]),r[4]];
  if(active===3) return [r[0],...(value(0)==='no'?[]:[r[1],r[2]]),...(value(7)==='no'?[]:[r[3],r[4]])];
  return r;
 };
 const moveTotal = [4,5,6].map(amount);
 const equity=homeEquity(amount(8),amount(9));
 return <section className="home-band home-preparedness" id="readiness-checks"><div className="home-container">
  <h2>{t.heading}</h2><HomePoints items={t.intro}/>
  <div className="home-script-grid">{t.titles.map((title,i)=><article key={title}><h3>{title}</h3><HomePoints items={t.points[i]}/><Button asChild={i===1} variant="outline" onClick={i===1?undefined:()=>choose(i)}>{i===1?<a href="#readiness-screener">{t.open}<ArrowRight/></a>:<>{t.open}<ArrowRight/></>}</Button></article>)}</div>
  {active!==null && <div className="legal-screening-panel" id="readiness-check-panel">
   <h3>{t.titles[active]}</h3><p>{t.note}</p>
   {!done?<form className="space-y-5" onSubmit={e=>{e.preventDefault();setDone(true);}}>
    {t.questions[active].map((question,i)=>{
     if(active===3 && ((i>0 && i<7 && value(0)==='no')||(i>7 && value(7)==='no')))return null;
     return binary[active].includes(i)?<fieldset key={question}><legend>{question}</legend><div className="flex flex-wrap gap-5 py-3">{['yes','no','unknown'].map((v,j)=><label key={v} className="flex items-center gap-2"><input required type="radio" name={`check-${active}-${i}`} checked={value(i)===v} onChange={()=>setAnswers(a=>({...a,[`${active}-${i}`]:v}))}/>{[t.yes,t.no,t.unknown][j]}</label>)}</div></fieldset>:<label className="block space-y-2" key={question}><span>{question}</span><Input type={active===4?'date':numbers[active].includes(i)?'number':'text'} min={numbers[active].includes(i)?0:undefined} step={numbers[active].includes(i)?'any':undefined} maxLength={160} value={value(i)} onChange={e=>setAnswers(a=>({...a,[`${active}-${i}`]:e.target.value}))}/></label>;
    })}<Button type="submit">{t.review}<ArrowRight/></Button>
   </form>:<div aria-live="polite"><HomePoints items={next()}/>
    {active===2 && <p>{moveTotal.every(n=>Number.isFinite(n)&&n>=0)?`${t.total}: ${money(moveTotal.reduce((a,b)=>a+b,0))}`:t.missing}</p>}
    {active===3 && value(0)==='yes' && Number.isFinite(amount(3)) && Number.isFinite(amount(4)) && <p>{t.profit}: {money(amount(3)-amount(4))}</p>}
    {active===3 && value(7)==='yes' && equity!==null && <p>{t.equity}: {money(equity)}</p>}
    {active===0 && <Button asChild><a href={`/intake?lang=${lang}`}>{t.packet}<ArrowRight/></a></Button>}
    {active===3 && <div className="flex flex-wrap gap-4">{value(0)!=='no'&&<Button asChild variant="outline"><a href={withLang('https://savemybusiness.com',lang)} target="_blank" rel="noopener noreferrer">{t.business}<ArrowRight/></a></Button>}{value(7)!=='no'&&<Button asChild variant="outline"><a href={withLang('https://savemyhometrust.com/trust',lang)} target="_blank" rel="noopener noreferrer">{t.home}<ArrowRight/></a></Button>}</div>}
    <Button variant="outline" className="mt-5" onClick={()=>{setDone(false);setAnswers({});}}><RotateCcw/>{t.reset}</Button>
   </div>}
  </div>}
 </div></section>;
}
