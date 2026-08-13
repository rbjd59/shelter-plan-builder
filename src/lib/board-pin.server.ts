const BOARD_PIN = "5688";

/** Shared PIN gate for the company and attorney boards. */
export function assertBoardPin(pin: string) {
  if (pin !== BOARD_PIN) throw new Error("Invalid PIN");
}
