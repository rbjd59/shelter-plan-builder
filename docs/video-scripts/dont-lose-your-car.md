# Don't Lose Your Car / No Pierdas Tu Carro / Pa Pèdi Machin Ou

Status: approved by owner for build 2026-11-17; Spanish and Kreyòl need native-speaker review.

Production: match the existing site videos with realistic illustrative scenes, dark navy overlays, warm amber accents, opening titles, lower captions and one clear male narrator. No music. All scenes and people are illustrative. Generate one visual sequence and use language-matched narration, opening titles and captions in English, Spanish and Haitian Kreyòl. The program documents remain in final attorney review.

## English narration (~60s)

A traffic stop. Detention. And your car is towed. Every day it sits in the tow yard, storage fees go up. After a few weeks, the yard can sell it, and your family may get nothing. Don't Lose Your Car lets you plan ahead. When you make your free DetencionDefensa plan, check 'I have a vehicle' and sign your authorizations now. If something happens, a licensed partner dealer can pick up your car quickly, so the fees stop growing. You get a written offer, based on wholesale auction value, and you decide. If the numbers don't leave money for you, we tell you, and we don't pick it up. The money goes straight to the person you choose. Your car. Your money. Your family. Plan today at DetencionDefensa.com.

## Spanish narration

Una parada de tráfico. Detención. Y su carro va a la grúa. Cada día que pasa en el lote, suben los cargos de almacenaje. En pocas semanas, el lote puede venderlo, y su familia puede quedarse sin nada. No Pierdas Tu Carro le permite planificar. Cuando haga su plan gratis de DetencionDefensa, marque 'Tengo un vehículo' y firme sus autorizaciones ahora. Si algo pasa, un concesionario autorizado puede recoger su carro rápido, para que los cargos dejen de subir. Usted recibe una oferta por escrito, basada en el valor de subasta, y usted decide. Si no queda dinero para usted, se lo decimos y no lo recogemos. El dinero va directo a la persona que usted elija. Su carro. Su dinero. Su familia. Planifique hoy en ListoAhora.org.

## Haitian Kreyòl narration

Yon kontwòl lapolis sou wout la. Detansyon. Epi yo remòke machin ou. Chak jou li rete nan lakou remòkaj la, frè depo yo monte. Apre kèk semèn, lakou a ka vann li, epi fanmi ou ka pa jwenn anyen. Pa Pèdi Machin Ou pèmèt ou planifye davans. Lè w ap fè plan gratis DetencionDefensa ou, make 'Mwen gen yon machin' epi siyen otorizasyon ou yo kounye a. Si yon bagay rive, yon konsesyonè patnè ki gen lisans ka al pran machin ou vit, pou frè yo sispann monte. Ou resevwa yon òf alekri, ki baze sou valè lavant ozanchè, epi se ou ki deside. Si kalkil la pa kite lajan pou ou, nou di ou sa, epi nou pa al pran machin nan. Lajan an ale dirèkteman bay moun ou chwazi a. Machin ou. Lajan ou. Fanmi ou. Planifye jodi a sou PareKounya.org.

## Opening titles

- EN: Don't Lose Your Car — Your car. Your money. Your family.
- ES: No Pierdas Tu Carro — Su carro. Su dinero. Su familia.
- HT: Pa Pèdi Machin Ou — Machin ou. Lajan ou. Fanmi ou.

## Required closing small text

EN: The partner dealer pays DetencionDefensa a referral fee. No sale or price is guaranteed. Documents prepared under attorney supervision.

ES: El concesionario asociado paga a DetencionDefensa una tarifa de referencia. No se garantiza ninguna venta ni precio. Documentos preparados bajo supervisión de un abogado.

HT: Konsesyonè patnè a peye DetencionDefensa yon frè referans. Okenn vant oswa pri pa garanti. Dokiman yo prepare anba sipèvizyon yon avoka.

Below that text, show the firm name and Miami location from `FIRM` in `src/lib/firm-info.ts`: Sorrentino Law Firm, PLLC · Miami, FL.

## Scene plan

1. Night traffic-stop lights reflected in a mirror; no arrest spectacle.
2. Tow-yard fence and a calendar showing time passing; no fear-based ICE imagery.
3. Family signing with an advisor.
4. Dealer tow truck loading a car.
5. Phone showing a price report and condition photos.
6. Family member receiving payment directly.

## Production safeguards

- Do not add a dollar referral-fee amount, a daily storage price, a best-price comparison or a tow-yard safety statement.
- Do not collect or mention immigration status in dealer lead forms.
- Keep the video click-to-play on the homepage so it does not create simultaneous audio with other videos.
- Spanish uses the existing Venezuelan male voice when available; Haitian Kreyòl uses the existing genuine Haitian Kreyòl male voice when available.
- If a narration track cannot be generated, publish that language with synchronized captions only and record the limitation here.

## Production record

- Generated six silent illustrative scenes with Omni and assembled them with FFmpeg; the source CDN pointers remain under `src/assets/videos/dont-lose-your-car-scene-*.mp4.asset.json`.
- Generated continuous male narration through ElevenLabs: English Adam (`pNInz6obpgDQGcFmaJgB`), Venezuelan Spanish César Augusto (`hAUJJty85xYTBnGyEWzw`), and Haitian Kreyòl Wesly (`PEjMkBhSB6492eADs4Ew`).
- Final durations: English 64.0 seconds, Spanish 64.0 seconds, Haitian Kreyòl 67.7 seconds. Each includes its full narration, synchronized burned-in captions, localized opening title, and a 9.5-second closing disclosure card. No music track was added.
- Final CDN pointers: `src/assets/videos/dont-lose-your-car-en.mp4.asset.json`, `dont-lose-your-car-es.mp4.asset.json`, and `dont-lose-your-car-ht.mp4.asset.json`.
- All three languages have audible narration; no captions-only fallback was needed. Spanish and Kreyòl still require the native-speaker review stated above.
