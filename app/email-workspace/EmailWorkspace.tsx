"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassifiedEmail } from "@/domain/models/EmailClassification";
import DraftWriter from "./DraftWriter";
import EmailDetail from "./EmailDetail";
import EmailList from "./EmailList";
import type { DraftResponse, DraftStatus, EmailData } from "./types";

const fallbackDraft =
  "Cordial saludo,\n\nGracias por escribirnos. Estamos revisando su solicitud con el equipo responsable y le confirmaremos el siguiente paso y la fecha de respuesta una vez validemos la información.\n\nQuedamos atentos.\n\nSara Ruiz\nAsistente de gerencia";

export default function EmailWorkspace() {
  const [emails, setEmails] = useState<ClassifiedEmail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [isInboxLoading, setIsInboxLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");

  const selectEmail = useCallback((email: ClassifiedEmail) => {
    setSelectedId(email.id);
    setDraft("");
    setRequiresApproval(false);
    setApprovalReason("");
    setDraftStatus("idle");
  }, []);

  const generateDraft = useCallback(async () => {
    if (selectedId === null) return;

    setDraft("");
    setRequiresApproval(false);
    setApprovalReason("");
    setDraftStatus("loading");

    try {
      const response = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: selectedId }),
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
  }, [selectedId]);

  const loadEmails = useCallback(async () => {
    setInboxError(null);
    setIsInboxLoading(true);

    try {
      const response = await fetch("/api/emails");
      if (!response.ok) throw new Error("El servicio de clasificación devolvió un error.");

      const data = (await response.json()) as EmailData;
      setEmails(data.emails);
      if (data.emails[0]) setSelectedId(data.emails[0].id);
    } catch {
      setInboxError("Revise el log del servidor para conocer la causa técnica y vuelva a intentarlo.");
    } finally {
      setIsInboxLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/emails")
      .then((response) => {
        if (!response.ok) throw new Error("El servicio de clasificación devolvió un error.");
        return response.json() as Promise<EmailData>;
      })
      .then((data) => {
        setInboxError(null);
        setEmails(data.emails);
        if (data.emails[0]) setSelectedId(data.emails[0].id);
      })
      .catch(() => {
        setInboxError("Revise el log del servidor para conocer la causa técnica y vuelva a intentarlo.");
      })
      .finally(() => {
        setIsInboxLoading(false);
      });
  }, [selectEmail]);

  const filteredEmails = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    return emails.filter((email) => {
      const matchesQuery = !normalizedQuery || [email.nombre, email.de, email.asunto, email.cuerpo, email.classification.category, email.classification.urgency].some((field) => field.toLowerCase().includes(normalizedQuery));
      const matchesCategory = !categoryFilter || email.classification.category === categoryFilter;
      return matchesQuery && matchesCategory;
    });
  }, [categoryFilter, emails, query]);
  const sortedEmails = useMemo(
    () => [...filteredEmails].sort((left, right) => left.classification.urgencyRank - right.classification.urgencyRank || new Date(left.fecha).getTime() - new Date(right.fecha).getTime()),
    [filteredEmails],
  );
  const selectedEmail = emails.find((email) => email.id === selectedId) ?? null;
  const categories = useMemo(
    () => [...new Set(emails.map((email) => email.classification.category))].sort(),
    [emails],
  );

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
          emails={sortedEmails}
          totalCount={emails.length}
          selectedId={selectedId}
          query={query}
          categoryFilter={categoryFilter}
          categories={categories}
          error={inboxError}
          isLoading={isInboxLoading}
          onQueryChange={setQuery}
          onCategoryChange={setCategoryFilter}
          onSelectEmail={selectEmail}
          onRetry={() => void loadEmails()}
        />
        <EmailDetail email={selectedEmail} />
        <DraftWriter
          status={draftStatus}
          value={draft}
          requiresApproval={requiresApproval}
          approvalReason={approvalReason}
          selectedId={selectedId}
          onGenerateDraft={() => void generateDraft()}
          onChange={setDraft}
        />
      </section>
    </main>
  );
}
