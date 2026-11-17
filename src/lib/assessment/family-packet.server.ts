import { familyPacket } from '../service-packet.server';
import type { Answers } from "./questions";

const value = (v: string | string[] | undefined) => Array.isArray(v) ? v.join(", ") : v || "Not given";

export async function buildAssessmentFamilyPacket(answers: Answers, fullName: string): Promise<Uint8Array> {
  return familyPacket(answers, fullName || value(answers.name));
}
