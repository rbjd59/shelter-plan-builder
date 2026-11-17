# Homepage audio-quality checkpoint — November 17, 2026

Scope: audio only. No homepage layout, section order, position, script, visual, or original media changes.

## Recovered production diagnosis

| Video | Language | Original pieces | Original provider/model/voice | Finding |
|---|---|---:|---|---|
| Process Overview | EN | 13 | OpenAI via Lovable, gpt-4o-mini-tts, verse | Separate section takes, shortened pauses, 1.05× speed, no crossfades; 1.2–1.6 s section gaps. |
| Process Overview | ES | 13 | Same, verse | Same join pattern, 1.08× speed. |
| Process Overview | HT | 13 | Same, verse | Same join pattern, 1.10× speed. |
| Save My Home | EN | Unknown | Owner-uploaded; provenance unavailable | No demonstrated chunking defect; original preserved. |
| Save My Home | ES | Unknown | Owner-uploaded; provenance unavailable | No demonstrated chunking defect; original preserved. |
| Save My Home | HT | Unknown | Owner-uploaded; provenance unavailable | No demonstrated chunking defect; original preserved. |
| Business | EN | 32 | OpenAI via Lovable, gpt-4o-mini-tts, onyx | Hard trimming; fixed 0.45 s sentence gaps, roughly 1.7 s scene gaps; volume resets. |
| Business | ES | 32 | Same, onyx | Quiet word tails/breaths trimmed most aggressively; same gaps. |
| Business | HT | 32 | Same, onyx | Same hard joins and pacing resets. |

These original-generation findings were recovered from the original production agents. Measurement and transcription are not human listening.

## Active versions and fresh verification

- Business EN/ES/HT v2 were uploaded and selected before suspension, saved in commit 089b557a. This continuation did not regenerate or overwrite them.
- Business EN: one source generation, original OpenAI onyx.
- Business ES: one source generation, ElevenLabs multilingual v2, César Augusto, hAUJJty85xYTBnGyEWzw; Venezuelan voice selected in the earlier library review.
- Business HT: one source generation, ElevenLabs multilingual v2, Wesly Professional Voice, PEjMkBhSB6492eADs4Ew; genuine Haitian Creole library voice, not French.
- All three Business v2 files fully decoded, had bit-identical compressed video streams to v1, and completed unmuted Chromium playback (2× playback used to exercise the entire stream). Durations: EN 148.542 s, ES 183.583 s, HT 184.542 s.
- No silence intervals of at least 1 s below −45 dBFS were detected in the final Business mixes. Background music can mask silence: this is not proof of perfect spoken delivery.
- Save My Home EN/ES/HT originals fully decoded again; no regeneration or reference changes.

## Process Overview: deliberately NOT switched

- The temporary v3 candidates from before suspension were lost. The exact manifest was recovered from the original production agent.
- ES and HT complete takes were recovered from ElevenLabs history without new generation. ES history FkvyG1rdGCkfXjZOyIHg, HT history lcBtCqeLbGCspMUyUv6D. Settings: stability 0.55, similarity 0.75, style 0.15, speaker boost; ES speed 1.03, HT speed 1.0.
- The lost English source was regenerated once with the existing OpenAI verse voice and the unchanged complete script.
- The three raw continuous narrations are now CDN assets with committed pointers; they are NOT active homepage media.
- Rebuilt scene-aligned candidates retained identical video streams and decoded, but introduced approximately 1–7 s scene pauses. The English fit also required uniform tempo processing. These candidates failed the requested no-dead-air quality goal and were rejected; they were not uploaded or selected.
- Active Process Overview remains v2 in all three languages (13 original source takes each). The source-generation count of a recovered take is not the same as a seam-free final edit.

## Remaining work

Process Overview still needs an audio edit that preserves existing burned-in caption timing without introducing long silent gaps, clipping words, or degrading pacing. No authority to change visuals/captions/scripts was assumed. Before Thursday, a human should listen to Business EN/ES/HT start to finish, with Venezuelan Spanish and Haitian Creole speakers checking accent and pronunciation. Process Overview originals still carry the diagnosed join risk.

Tests after recovery: intake PDF tests 2/2; full suite 135/135 across 23 files. No live publication was performed.