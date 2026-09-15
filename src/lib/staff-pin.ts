/**
 * One staff unlock for every board.
 *
 * The PIN is remembered in three places because any one of them can be
 * unavailable: session storage, local storage, and a first-party cookie.
 * Inside embedded previews and some privacy modes both storages throw, which
 * is what made the boards ask for the PIN a second time.
 */
export const STAFF_PIN = "5688";
const KEY = "dd_pin_ok";
const COOKIE_MAX_AGE = 60 * 60 * 12; // 12 hours

/** Saves the unlock everywhere it can. Returns true if anything stuck. */
export function rememberStaffPin(pin: string): boolean {
  let ok = false;
  try {
    sessionStorage.setItem(KEY, pin);
    ok = true;
  } catch { /* ignore */ }
  try {
    localStorage.setItem(KEY, pin);
    ok = true;
  } catch { /* ignore */ }
  try {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${KEY}=${encodeURIComponent(pin)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    ok = ok || readCookie() === pin;
  } catch { /* ignore */ }
  return ok;
}

function readCookie(): string | null {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${KEY}=([^;]*)`));
    return match?.[1] ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

/** Reads a previously saved unlock from wherever it survived. */
export function readStaffPin(): string | null {
  try {
    const fromSession = sessionStorage.getItem(KEY);
    if (fromSession) return fromSession;
  } catch { /* ignore */ }
  try {
    const fromLocal = localStorage.getItem(KEY);
    if (fromLocal) return fromLocal;
  } catch { /* ignore */ }
  return readCookie();
}
