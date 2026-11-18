import { mkdir, writeFile } from "node:fs/promises";
import { dealerParticipationAgreementPdf, vehicleRescuePacket } from "../src/lib/vehicle-packet.server";

const directory = new URL("../public/forms/vehicle/", import.meta.url);
await mkdir(directory, { recursive: true });
const sample = await vehicleRescuePacket({ language: "en" });
const dealer = await dealerParticipationAgreementPdf();
await writeFile(new URL("vehicle-rescue-packet-sample.pdf", directory), sample);
await writeFile(new URL("dealer-participation-agreement.pdf", directory), dealer);
console.log(`Sample packet: ${sample.length} bytes; dealer agreement: ${dealer.length} bytes`);
