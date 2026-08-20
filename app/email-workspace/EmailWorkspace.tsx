"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Email } from "@/domain/models/Email";
import DraftWriter from "./DraftWriter";
import EmailDetail from "./EmailDetail";
import EmailList from "./EmailList";
import type { DraftResponse, DraftStatus, EmailData } from "./types";

const fallbackDraft =
  "Cordial saludo,\n\nGracias por escribirnos. Estamos revisando su solicitud con el equipo responsable y le confirmaremos el siguiente paso y la fecha de respuesta una vez validemos la información.\n\nQuedamos atentos.\n\nSara Ruiz\nAsistente de gerencia";

export default function EmailWorkspace() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");

  const selectEmail = useCallback(async (email: Email) => {
    setSelectedId(email.id);
    setDraft("");
    setRequiresApproval(false);
    setApprovalReason("");
    setDraftStatus("loading");
    try {
      const response = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: email.id }),
      });
      if (!response.ok) throw new Error("Draft request failed");
      const data = (await response.json()) as DraftResponse;
      setDraft(data.draft || fallbackDraft);
      setRequiresApproval(data.requiresApproval);
      setApprovalReason(data.reason);
      setDraftStatus("ready");
    } catch {
      setDraft(fallbackDraft);
      setRequiresApproval(false);
      setApprovalReason("");
      setDraftStatus("error");
    }
  }, []);

  useEffect(() => {
    fetch("/correos-ejemplo.json")
      .then((response) => response.json() as Promise<EmailData>)
      .then((data) => {
        setEmails(data.correos);
        if (data.correos[0]) void selectEmail(data.correos[0]);
      })
      .catch(() => setDraftStatus("error"));
  }, [selectEmail]);

  const filteredEmails = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    if (!normalizedQuery) return emails;
    return emails.filter((email) =>
      [email.nombre, email.de, email.asunto, email.cuerpo].some((field) =>
        field.toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [emails, query]);
  const selectedEmail = emails.find((email) => email.id === selectedId) ?? null;

  return (
    <main className="workspace-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <span className="brand-mark">A</span>
          <div>
            <p className="brand-name">Aurora</p>
            <p className="brand-caption">Asistente de gerencia</p>
          </div>
        </div>
        <div className="topbar-status">
          <span className="status-dot" /> Bandeja conectada
        </div>
        <div className="profile-chip">
          <span>SR</span> Sara Ruiz
        </div>
      </header>
      <section className="workspace-heading">
        <div>
          <p className="eyebrow">Jueves, 20 de agosto de 2026</p>
          <h1>Centro de respuestas</h1>
          <p className="heading-copy">
            Revise sus conversaciones y prepare respuestas claras en menos
            tiempo.
          </p>
        </div>
        <div className="heading-metric">
          <strong>{emails.length || "--"}</strong>
          <span>
            correos
            <br />
            en bandeja
          </span>
        </div>
      </section>
      <section className="mail-workspace">
        <EmailList
          emails={filteredEmails}
          totalCount={emails.length}
          selectedId={selectedId}
          query={query}
          onQueryChange={setQuery}
          onSelectEmail={(email) => void selectEmail(email)}
        />
        <EmailDetail email={selectedEmail} />
        <DraftWriter
          status={draftStatus}
          value={draft}
          requiresApproval={requiresApproval}
          approvalReason={approvalReason}
          onChange={setDraft}
        />
      </section>
    </main>
  );
}
