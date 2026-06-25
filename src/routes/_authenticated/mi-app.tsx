import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/mi-app")({
  head: () => ({ meta: [{ title: "Mi App — Configura todo aquí" }] }),
  component: MiAppPage,
});

type ClientRow = {
  id: string;
  invite_token: string;
  full_name: string | null;
  email: string | null;
  phone_e164: string | null;
  language: string;
  place_of_birth: string | null;
  country_of_origin: string | null;
  cancel_pin_hash: string | null;
  setup_completed_at: string | null;
  has_pet_rescue: boolean;
};

type Contact = {
  id?: string;
  name: string;
  phone_e164: string | null;
  email: string | null;
  relationship: string | null;
  priority: number;
  notify_on_sos: boolean;
};

type DocRow = {
  id?: string;
  title: string;
  content: string;
  document_type: string;
  send_on_alert: boolean;
};

type PetRow = {
  id?: string;
  pet_type: string | null;
  pet_name: string | null;
  pet_location: string | null;
  access_instructions: string | null;
  who_to_notify: string | null;
  no_kill_shelter_preferred: boolean;
  no_kill_shelter_address: string | null;
  notes: string | null;
};


const wrap: React.CSSProperties = { minHeight: "100vh", background: "#0b1220", color: "#f6efe1", fontFamily: "Inter Tight, system-ui, sans-serif" };
const card: React.CSSProperties = { background: "#1a2436", borderRadius: 12, padding: 20, marginBottom: 20 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 15, borderRadius: 6, border: "1px solid #2a3650", background: "#0b1220", color: "#f6efe1", boxSizing: "border-box" };
const btn: React.CSSProperties = { padding: "10px 16px", fontSize: 14, fontWeight: 600, borderRadius: 6, border: "none", background: "#e8a04a", color: "#0b1220", cursor: "pointer" };
const btnGhost: React.CSSProperties = { ...btn, background: "transparent", color: "#e8a04a", border: "1px solid #e8a04a" };
const label: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#cfc8b8", marginBottom: 6, marginTop: 12 };

function MiAppPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [needsCode, setNeedsCode] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeErr, setCodeErr] = useState("");
  const [client, setClient] = useState<ClientRow | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [pet, setPet] = useState<PetRow>({ pet_type: "", pet_name: "", pet_location: "", access_instructions: "", who_to_notify: "", no_kill_shelter_preferred: true, no_kill_shelter_address: "", notes: "" });
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [savedFlash, setSavedFlash] = useState("");

  const flash = (msg: string) => {
    setSavedFlash(msg);
    setTimeout(() => setSavedFlash(""), 2200);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      navigate({ to: "/configurar" });
      return;
    }
    const userEmail = userData.user.email || "";
    // Claim any unclaimed records matching email
    await supabase.rpc("claim_app_client_by_email", { _user_id: userData.user.id, _email: userEmail });

    const { data: myClient } = await supabase
      .from("app_clients")
      .select("*")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!myClient) {
      setNeedsCode(true);
      setLoading(false);
      return;
    }
    setClient(myClient as ClientRow);
    setNeedsCode(false);

    const [{ data: contactsData }, { data: docsData }, { data: petsData }] = await Promise.all([
      supabase.from("client_contacts").select("*").eq("client_id", myClient.id).order("priority"),
      supabase.from("client_documents").select("*").eq("client_id", myClient.id).order("loaded_at"),
      supabase.from("client_pet_rescue").select("*").eq("client_id", myClient.id).limit(1).maybeSingle(),
    ]);
    setContacts((contactsData as Contact[]) || []);
    setDocs((docsData as DocRow[]) || []);
    if (petsData) setPet(petsData as PetRow);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  const claimByCode = async () => {
    setCodeErr("");
    const norm = codeInput.trim().toUpperCase();
    if (!/^[A-Z0-9]{8}$/.test(norm)) {
      setCodeErr("El código debe ser 8 letras/números.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { error } = await supabase.rpc("claim_app_client_by_code", { _user_id: userData.user.id, _token: norm });
    if (error) {
      setCodeErr(error.message === "invalid_token" ? "Código no encontrado." : error.message);
      return;
    }
    await loadAll();
  };

  // Save client profile fields
  const saveProfileField = async (field: keyof ClientRow, value: string) => {
    if (!client) return;
    setClient({ ...client, [field]: value });
    await supabase.from("app_clients").update({ [field]: value } as never).eq("id", client.id);
    flash("Guardado / Saved ✓");
  };


  // Contacts
  const addContact = () => {
    setContacts([...contacts, { name: "", phone_e164: "", email: "", relationship: "emergency", priority: contacts.length + 1, notify_on_sos: true }]);
  };
  const updateContact = (idx: number, patch: Partial<Contact>) => {
    setContacts(contacts.map((c, i) => i === idx ? { ...c, ...patch } : c));
  };
  const saveContact = async (idx: number) => {
    if (!client) return;
    const c = contacts[idx];
    if (!c.name.trim()) return;
    if (c.id) {
      await supabase.from("client_contacts").update({
        name: c.name, phone_e164: c.phone_e164, email: c.email,
        relationship: c.relationship, priority: c.priority, notify_on_sos: c.notify_on_sos,
      }).eq("id", c.id);
    } else {
      const { data } = await supabase.from("client_contacts").insert({
        client_id: client.id, name: c.name, phone_e164: c.phone_e164, email: c.email,
        relationship: c.relationship, priority: c.priority, notify_on_sos: c.notify_on_sos,
      }).select("id").single();
      if (data) updateContact(idx, { id: data.id });
    }
    flash("Contacto guardado ✓");
  };
  const deleteContact = async (idx: number) => {
    const c = contacts[idx];
    if (c.id) await supabase.from("client_contacts").delete().eq("id", c.id);
    setContacts(contacts.filter((_, i) => i !== idx));
  };

  // Documents
  const toggleDoc = async (idx: number, checked: boolean) => {
    const d = docs[idx];
    setDocs(docs.map((dd, i) => i === idx ? { ...dd, send_on_alert: checked } : dd));
    if (d.id) await supabase.from("client_documents").update({ send_on_alert: checked }).eq("id", d.id);
  };
  const updateDocContent = (idx: number, content: string) => {
    setDocs(docs.map((dd, i) => i === idx ? { ...dd, content } : dd));
  };
  const saveDocContent = async (idx: number) => {
    const d = docs[idx];
    if (d.id) {
      await supabase.from("client_documents").update({ content: d.content }).eq("id", d.id);
      flash("Documento guardado ✓");
    }
  };

  // Pet
  const savePet = async () => {
    if (!client) return;
    const payload = {
      pet_type: pet.pet_type, pet_name: pet.pet_name, pet_location: pet.pet_location,
      access_instructions: pet.access_instructions, who_to_notify: pet.who_to_notify,
      no_kill_shelter_preferred: pet.no_kill_shelter_preferred,
      no_kill_shelter_address: pet.no_kill_shelter_address, notes: pet.notes,
    };
    if (pet.id) {
      await supabase.from("client_pet_rescue").update(payload).eq("id", pet.id);
    } else {
      const { data } = await supabase.from("client_pet_rescue").insert({
        client_id: client.id, ...payload,
      }).select("id").single();
      if (data) setPet({ ...pet, id: data.id });
      await supabase.from("app_clients").update({ has_pet_rescue: true }).eq("id", client.id);
    }
    flash("Plan de mascotas guardado ✓");
  };


  // PIN
  const [pinErr, setPinErr] = useState("");
  const savePin = async () => {
    setPinErr("");
    if (!client) return;
    if (!/^[0-9]{4}$/.test(pin)) { setPinErr("El PIN debe ser de 4 dígitos."); return; }
    if (pin !== pin2) { setPinErr("Los PINs no coinciden."); return; }
    const { error } = await supabase.rpc("set_sos_cancel_pin", { _client_id: client.id, _pin: pin });
    if (error) { setPinErr(error.message); return; }
    setPin(""); setPin2("");
    setClient({ ...client, cancel_pin_hash: "set", setup_completed_at: new Date().toISOString() });
    flash("PIN guardado ✓");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/configurar" });
  };

  if (loading) {
    return <div style={wrap}><div style={{ padding: 40, textAlign: "center" }}>Cargando…</div></div>;
  }

  if (needsCode) {
    return (
      <div style={wrap}>
        <main style={{ maxWidth: 560, margin: "0 auto", padding: "48px 24px" }}>
          <h1 style={{ fontSize: 28, fontFamily: "Fraunces, serif", marginBottom: 12 }}>Conecte su código de activación</h1>
          <p style={{ color: "#cfc8b8", fontSize: 15, marginBottom: 20, lineHeight: 1.5 }}>
            Su correo no tiene una app registrada todavía. Si ya tiene un código de activación (8 letras/números), póngalo aquí.
            Si no tiene uno, <Link to="/get-app" style={{ color: "#e8a04a" }}>solicítelo aquí</Link>.
          </p>
          <input
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
            placeholder="ABCD1234"
            maxLength={8}
            style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: 4, fontSize: 22, textAlign: "center", marginBottom: 12 }}
          />
          {codeErr && <p style={{ color: "#ff8080", fontSize: 13, marginBottom: 12 }}>{codeErr}</p>}
          <button onClick={claimByCode} style={{ ...btn, width: "100%" }}>Conectar / Connect</button>
          <button onClick={signOut} style={{ ...btnGhost, width: "100%", marginTop: 12 }}>Cerrar sesión</button>
        </main>
      </div>
    );
  }

  if (!client) return null;

  const stepDone = {
    profile: !!(client.full_name && client.phone_e164),
    contacts: contacts.length > 0,
    docs: docs.some(d => d.send_on_alert),
    pet: !!pet.id,
    pin: !!client.cancel_pin_hash,
  };

  return (
    <div style={wrap}>
      <header style={{ padding: "16px 24px", borderBottom: "1px solid #1a2436", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to="/" style={{ color: "#e8a04a", textDecoration: "none", fontSize: 14 }}>← Inicio</Link>
        <button onClick={signOut} style={{ ...btnGhost, padding: "6px 12px", fontSize: 13 }}>Cerrar sesión</button>
      </header>

      {savedFlash && (
        <div style={{ position: "fixed", top: 20, right: 20, background: "#059669", color: "white", padding: "10px 16px", borderRadius: 6, zIndex: 100, fontSize: 14 }}>
          {savedFlash}
        </div>
      )}

      <main style={{ maxWidth: 880, margin: "0 auto", padding: "24px 20px" }}>
        <h1 style={{ fontSize: 32, fontFamily: "Fraunces, serif", marginBottom: 4 }}>Mi App</h1>
        <p style={{ color: "#a8a59a", fontSize: 14, marginBottom: 4 }}>Código de activación: <strong style={{ color: "#e8a04a", fontFamily: "monospace", fontSize: 16 }}>{client.invite_token}</strong></p>
        <p style={{ color: "#cfc8b8", fontSize: 14, marginBottom: 24 }}>
          Cuando instale la app y entre este código, todo lo que llene aquí aparecerá automáticamente.
        </p>

        {/* Progress strip */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {[
            ["1. Sus datos", stepDone.profile],
            ["2. Contactos", stepDone.contacts],
            ["3. Documentos", stepDone.docs],
            ["4. Mascotas", stepDone.pet],
            ["5. PIN", stepDone.pin],
          ].map(([label, done], i) => (
            <div key={i} style={{
              padding: "6px 12px", borderRadius: 999, fontSize: 13,
              background: done ? "#065f46" : "#2a3650",
              color: done ? "#d1fae5" : "#cfc8b8",
            }}>
              {done ? "✓ " : ""}{label as string}
            </div>
          ))}
        </div>

        {/* 1. Profile */}
        <section style={card}>
          <h2 style={{ fontSize: 20, fontFamily: "Fraunces, serif", marginBottom: 4 }}>1. Sus datos / Your info</h2>
          <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 12 }}>Esta información identifica a la persona en peligro.</p>
          <label style={label}>Nombre completo / Full name</label>
          <input style={inputStyle} defaultValue={client.full_name || ""} onBlur={(e) => saveProfileField("full_name", e.target.value)} />
          <label style={label}>Teléfono (con código de país) / Phone</label>
          <input style={inputStyle} defaultValue={client.phone_e164 || ""} onBlur={(e) => saveProfileField("phone_e164", e.target.value)} placeholder="+15551234567" />
          <label style={label}>Lugar de nacimiento / Place of birth</label>
          <input style={inputStyle} defaultValue={client.place_of_birth || ""} onBlur={(e) => saveProfileField("place_of_birth", e.target.value)} />
          <label style={label}>País de origen / Country of origin</label>
          <input style={inputStyle} defaultValue={client.country_of_origin || ""} onBlur={(e) => saveProfileField("country_of_origin", e.target.value)} />
        </section>

        {/* 2. Contacts */}
        <section style={card}>
          <h2 style={{ fontSize: 20, fontFamily: "Fraunces, serif", marginBottom: 4 }}>2. Contactos de emergencia</h2>
          <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 16 }}>
            Estas personas recibirán un correo y un mensaje cuando active la alerta. <strong>Agregue al menos 2.</strong>
          </p>
          {contacts.map((c, i) => (
            <div key={i} style={{ border: "1px solid #2a3650", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input style={inputStyle} placeholder="Nombre / Name" value={c.name} onChange={(e) => updateContact(i, { name: e.target.value })} onBlur={() => saveContact(i)} />
                <input style={inputStyle} placeholder="Relación / Relationship" value={c.relationship || ""} onChange={(e) => updateContact(i, { relationship: e.target.value })} onBlur={() => saveContact(i)} />
                <input style={inputStyle} placeholder="Teléfono / Phone (+1...)" value={c.phone_e164 || ""} onChange={(e) => updateContact(i, { phone_e164: e.target.value })} onBlur={() => saveContact(i)} />
                <input style={inputStyle} placeholder="Email" type="email" value={c.email || ""} onChange={(e) => updateContact(i, { email: e.target.value })} onBlur={() => saveContact(i)} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                <label style={{ fontSize: 13, color: "#cfc8b8" }}>
                  <input type="checkbox" checked={c.notify_on_sos} onChange={(e) => { updateContact(i, { notify_on_sos: e.target.checked }); setTimeout(() => saveContact(i), 0); }} /> Avisar en emergencia
                </label>
                <button onClick={() => deleteContact(i)} style={{ ...btnGhost, padding: "4px 10px", fontSize: 12, color: "#ff8080", borderColor: "#ff8080" }}>Eliminar</button>
              </div>
            </div>
          ))}
          <button onClick={addContact} style={btn}>+ Agregar contacto</button>
        </section>

        {/* 3. Documents */}
        <section style={card}>
          <h2 style={{ fontSize: 20, fontFamily: "Fraunces, serif", marginBottom: 4 }}>3. Documentos legales</h2>
          <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 16 }}>
            Marque los documentos que sus contactos recibirán por correo cuando active la alerta.
          </p>
          {docs.length === 0 && <p style={{ color: "#a8a59a", fontSize: 14 }}>Sus documentos aparecerán aquí después de configurar su cuenta.</p>}
          {docs.map((d, i) => (
            <div key={d.id || i} style={{ border: "1px solid #2a3650", borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                <input type="checkbox" checked={d.send_on_alert} onChange={(e) => toggleDoc(i, e.target.checked)} />
                {d.title}
              </label>
              {d.send_on_alert && (
                <details style={{ marginTop: 8 }}>
                  <summary style={{ cursor: "pointer", fontSize: 13, color: "#e8a04a" }}>Ver / editar contenido</summary>
                  <textarea
                    style={{ ...inputStyle, marginTop: 8, minHeight: 200, fontFamily: "monospace", fontSize: 13 }}
                    value={d.content}
                    onChange={(e) => updateDocContent(i, e.target.value)}
                    onBlur={() => saveDocContent(i)}
                  />
                </details>
              )}
            </div>
          ))}
        </section>

        {/* 4. Pet */}
        <section style={card}>
          <h2 style={{ fontSize: 20, fontFamily: "Fraunces, serif", marginBottom: 4 }}>4. Plan de rescate de mascotas</h2>
          <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 12 }}>Si tiene mascota, quién la cuidará si usted no puede.</p>
          <label style={label}>Tipo de mascota (perro, gato…)</label>
          <input style={inputStyle} value={pet.pet_type || ""} onChange={(e) => setPet({ ...pet, pet_type: e.target.value })} />
          <label style={label}>Nombre de la mascota</label>
          <input style={inputStyle} value={pet.pet_name || ""} onChange={(e) => setPet({ ...pet, pet_name: e.target.value })} />
          <label style={label}>Dónde está la mascota (dirección)</label>
          <input style={inputStyle} value={pet.pet_location || ""} onChange={(e) => setPet({ ...pet, pet_location: e.target.value })} />
          <label style={label}>Instrucciones de acceso (llave, código…)</label>
          <input style={inputStyle} value={pet.access_instructions || ""} onChange={(e) => setPet({ ...pet, access_instructions: e.target.value })} />
          <label style={label}>A quién avisar (cuidador o familiar)</label>
          <input style={inputStyle} value={pet.who_to_notify || ""} onChange={(e) => setPet({ ...pet, who_to_notify: e.target.value })} />
          <label style={{ ...label, display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={pet.no_kill_shelter_preferred} onChange={(e) => setPet({ ...pet, no_kill_shelter_preferred: e.target.checked })} />
            Preferir refugio "no-kill" si nadie puede cuidar
          </label>
          <input style={inputStyle} placeholder="Dirección del refugio preferido" value={pet.no_kill_shelter_address || ""} onChange={(e) => setPet({ ...pet, no_kill_shelter_address: e.target.value })} />

          <label style={label}>Notas (alergias, comida, medicinas)</label>
          <textarea style={{ ...inputStyle, minHeight: 80 }} value={pet.notes || ""} onChange={(e) => setPet({ ...pet, notes: e.target.value })} />
          <div style={{ marginTop: 12 }}>
            <button onClick={savePet} style={btn}>Guardar plan</button>
          </div>
        </section>

        {/* 5. PIN */}
        <section style={card}>
          <h2 style={{ fontSize: 20, fontFamily: "Fraunces, serif", marginBottom: 4 }}>5. PIN de cancelación</h2>
          <p style={{ fontSize: 13, color: "#a8a59a", marginBottom: 12, lineHeight: 1.5 }}>
            Un PIN de 4 dígitos para detener una alerta si se activó por accidente.
            <strong> Sin el PIN, la alerta sigue avisando a sus contactos.</strong> Memorice este número.
          </p>
          {client.cancel_pin_hash && (
            <div style={{ background: "#065f46", color: "#d1fae5", padding: 10, borderRadius: 6, fontSize: 14, marginBottom: 12 }}>
              ✓ PIN configurado. Puede cambiarlo a continuación.
            </div>
          )}
          <label style={label}>Nuevo PIN (4 dígitos)</label>
          <input style={inputStyle} type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))} />
          <label style={label}>Confirme el PIN</label>
          <input style={inputStyle} type="password" inputMode="numeric" maxLength={4} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ""))} />
          {pinErr && <p style={{ color: "#ff8080", fontSize: 13, marginTop: 8 }}>{pinErr}</p>}
          <div style={{ marginTop: 12 }}>
            <button onClick={savePin} style={btn}>Guardar PIN</button>
          </div>
        </section>

        <div style={{ marginTop: 32, padding: 20, background: "#1a2436", borderRadius: 12, textAlign: "center" }}>
          <p style={{ color: "#cfc8b8", fontSize: 15, marginBottom: 8 }}>
            ¿Ya tiene la app instalada? Use el código <strong style={{ color: "#e8a04a", fontFamily: "monospace" }}>{client.invite_token}</strong> para activarla.
          </p>
          <Link to="/get-app" style={{ color: "#e8a04a", fontSize: 14 }}>Descargar la app →</Link>
        </div>
      </main>
    </div>
  );
}
