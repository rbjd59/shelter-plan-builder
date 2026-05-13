import { PDFDocument } from "pdf-lib";
import fs from "fs";
const txt = fs.readFileSync("/dev-server/src/assets/forms/AO242.pdf.b64.ts","utf8");
const b64 = txt.match(/"([A-Za-z0-9+/=]{100,})"/)[1];
const doc = await PDFDocument.load(Buffer.from(b64,"base64"));
const form = doc.getForm();
for (const f of form.getFields()) {
  const t = f.constructor.name;
  let extra = "";
  if (t === "PDFDropdown") extra = " OPTS=" + JSON.stringify(f.getOptions()).slice(0,500);
  if (t === "PDFCheckBox") {
    const widgets = f.acroField.getWidgets();
    const allOpts = [];
    for (const w of widgets) {
      const ap = w.dict.lookup({ name: "AP" });
      // hacky
    }
  }
  console.log(t, "|", f.getName(), extra);
}
