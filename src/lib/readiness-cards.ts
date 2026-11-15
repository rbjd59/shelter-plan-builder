import type { Lang } from '@/context/LanguageContext';

/** Homepage card order: family, legal, home, business, deadlines. `check` points to the READINESS_CHECKS form; `part` limits check 3 to home or business questions. */
export const READINESS_CARD_ORDER = [
 { check: 0 }, { check: 1 }, { check: 3, part: 'home' }, { check: 3, part: 'business' }, { check: 4 },
] as const;

export const READINESS_CARDS: Record<Lang, { intro: string; titles: string[]; points: string[][] }> = {
 en: {
  intro: 'Answer each check below. Your answers help build your best plan.',
  titles: ['1. If You Are Detained, What Papers Does Your Family Need?', '2. Know Your Legal Status. What Can a Lawyer Really Do for You?', '3. What Is Your American Dream Worth Today?', '4. Do You Have a Business?', '5. Act Today. Check Your Deadlines.'],
  points: [
   ['Find out what papers your family needs if you are detained.', 'Start the check below.'],
   ['Know your legal status.', 'Learn what a lawyer can and cannot really do for you.', 'Take the free check below.'],
   ['If you own a home, it has value. Let’s find out how much.', 'The value in your home may help you:', 'Move your family.', 'Pay for a move or for a lawyer.', 'Keep paying for your home until it is sold or rented.', 'Support you while you live in another country.', 'Start the check below.'],
   ['Do you have a handyman route? A pool route? A lawn route?', 'Do you have customers who come back again and again? That is a business.', 'You may never have been told this, but you can protect it.', 'You can own a business even if you are deported.', 'You can run it from another country, hire someone to run it, or sell it.', 'Let’s find out what to do with your business. Start the check below.'],
   ['Do not miss a hearing, filing date or ICE appointment.', 'Start the check below.'],
  ],
 },
 es: {
  intro: 'Conteste cada revisión. Sus respuestas ayudan a crear su mejor plan.',
  titles: ['1. Si lo detienen, ¿qué papeles necesita su familia?', '2. Conozca su estatus legal. ¿Qué puede hacer de verdad un abogado por usted?', '3. ¿Cuánto vale hoy su Sueño Americano?', '4. ¿Tiene un negocio?', '5. Actúe hoy. Revise sus fechas.'],
  points: [
   ['Sepa qué papeles necesita su familia si lo detienen.', 'Empiece la revisión.'],
   ['Conozca su estatus legal.', 'Sepa lo que un abogado puede y no puede hacer por usted.', 'Haga la revisión gratis.'],
   ['Si tiene una casa, tiene valor. Veamos cuánto.', 'El valor de su casa puede ayudarle a:', 'Mudar a su familia.', 'Pagar la mudanza o un abogado.', 'Seguir pagando la casa hasta venderla o rentarla.', 'Mantenerse mientras vive en otro país.', 'Empiece la revisión.'],
   ['¿Tiene una ruta de handyman? ¿De piscinas? ¿De jardinería?', '¿Tiene clientes que vuelven una y otra vez? Eso es un negocio.', 'Quizás nadie se lo dijo, pero lo puede proteger.', 'Puede ser dueño de un negocio aunque lo deporten.', 'Puede manejarlo desde otro país, contratar a alguien o venderlo.', 'Veamos qué hacer con su negocio. Empiece la revisión.'],
   ['No falte a una audiencia, fecha de entrega o cita con ICE.', 'Empiece la revisión.'],
  ],
 },
 ht: {
  intro: 'Reponn chak ti tès anba a. Repons ou ede fè pi bon plan pou ou.',
  titles: ['1. Si yo arete ou, ki papye fanmi ou bezwen?', '2. Konnen estati legal ou. Kisa yon avoka ka fè vre pou ou?', '3. Konbyen Rèv Ameriken ou vo jodi a?', '4. Èske ou gen yon biznis?', '5. Aji jodi a. Tcheke dat ou yo.'],
  points: [
   ['Konnen ki papye fanmi ou bezwen si yo arete ou.', 'Kòmanse ti tès la.'],
   ['Konnen estati legal ou.', 'Aprann sa yon avoka ka fè ak sa li pa ka fè pou ou.', 'Fè ti tès gratis la.'],
   ['Si ou gen yon kay, li gen valè. Ann wè konbyen.', 'Valè kay ou ka ede ou:', 'Deplase fanmi ou.', 'Peye pou deplase oswa pou yon avoka.', 'Kontinye peye kay la jiskaske li vann oswa lwe.', 'Viv pandan ou nan yon lòt peyi.', 'Kòmanse ti tès la.'],
   ['Ou gen yon wout handyman? Pisin? Gazon?', 'Ou gen kliyan ki tounen plizyè fwa? Sa se yon biznis.', 'Petèt pèsonn pa janm di ou sa, men ou ka pwoteje li.', 'Ou ka posede yon biznis menm si yo depòte ou.', 'Ou ka jere li nan yon lòt peyi, peye yon moun jere li, oswa vann li.', 'Ann wè kisa pou fè ak biznis ou. Kòmanse ti tès la.'],
   ['Pa rate yon odyans, yon dat depo oswa yon randevou ICE.', 'Kòmanse ti tès la.'],
  ],
 },
};
