"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ClassifiedEmail } from "@/domain/models/EmailClassification";
import DraftWriter from "./DraftWriter";
import EmailDetail from "./EmailDetail";
import EmailList from "./EmailList";
import type {
  DraftResponse,
  DraftStatus,
  EmailClassificationStreamEvent,
} from "./types";

const fallbackDraft =
  "Cordial saludo,\n\nGracias por escribirnos. Estamos revisando su solicitud con el equipo responsable y le confirmaremos el siguiente paso y la fecha de respuesta una vez validemos la información.\n\nQuedamos atentos.\n\nSara Ruiz\nAsistente de gerencia";

export default function EmailWorkspace() {
  const [emails, setEmails] = useState<ClassifiedEmail[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [inboxError, setInboxError] = useState<string | null>(null);
  const [isInboxLoading, setIsInboxLoading] = useState(true);
  const [inboxProgress, setInboxProgress] = useState({ processed: 0, total: 0 });
  const [draft, setDraft] = useState("");
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [isResettingHistory, setIsResettingHistory] = useState(false);

  const selectEmail = useCallback((email: ClassifiedEmail) => {
    setSelectedId(email.id);
    setDraft("");
    setRequiresApproval(false);
    setApprovalReason("");
    setIsBlocked(false);
    setDraftStatus("idle");
  }, []);

  const generateDraft = useCallback(async () => {
    if (selectedId === null) return;

    setDraft("");
    setRequiresApproval(false);
    setApprovalReason("");
    setIsBlocked(false);
    setDraftStatus("loading");

    try {
      const response = await fetch("/api/emails/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailId: selectedId }),
      });

      if (!response.ok) throw new Error("Draft request failed");

      const data = (await response.json()) as DraftResponse;
      if (data.blocked) {
        setIsBlocked(true);
        setApprovalReason(data.reason);
        setDraftStatus("ready");
        return;
      }
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
    setEmails([]);
    setSelectedId(null);
    setInboxProgress({ processed: 0, total: 0 });
    setIsInboxLoading(true);

    try {
      const response = await fetch("/api/emails");
      if (!response.ok) throw new Error("El servicio de clasificación devolvió un error.");

      if (!response.body) throw new Error("El servicio no devolvió un flujo de clasificación.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const processLine = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line) as EmailClassificationStreamEvent;
        if (event.type === "email") {
          setEmails((current) => [...current, event.email]);
          setSelectedId((current) => current ?? event.email.id);
          setInboxProgress({ processed: event.processed, total: event.total });
        } else if (event.type === "progress" || event.type === "complete") {
          setInboxProgress({ processed: event.processed, total: event.total });
        } else if (event.type === "error") {
          setInboxError(event.message);
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        lines.forEach(processLine);
        if (done) break;
      }
      processLine(buffer);
    } catch {
      setInboxError("Revise el log del servidor para conocer la causa técnica y vuelva a intentarlo.");
    } finally {
      setIsInboxLoading(false);
    }
  }, []);

  const resetHistory = useCallback(async () => {
    if (!window.confirm("¿Borrar el historial y volver a categorizar los correos?")) return;

    setIsResettingHistory(true);
    try {
      const response = await fetch("/api/emails/history", { method: "DELETE" });
      if (!response.ok) throw new Error("History reset failed");
      await loadEmails();
    } catch {
      setInboxError("No fue posible borrar el historial. Vuelva a intentarlo.");
    } finally {
      setIsResettingHistory(false);
    }
  }, [loadEmails]);

  useEffect(() => {
    const load = () => void loadEmails();
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [loadEmails]);

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
  const displayedEmails = isInboxLoading ? emails : sortedEmails;
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
          emails={displayedEmails}
          selectedId={selectedId}
          query={query}
          categoryFilter={categoryFilter}
          categories={categories}
          error={inboxError}
          isLoading={isInboxLoading}
          progress={inboxProgress}
          onQueryChange={setQuery}
          onCategoryChange={setCategoryFilter}
          onSelectEmail={selectEmail}
          onRetry={() => void loadEmails()}
          onResetHistory={() => void resetHistory()}
          isResettingHistory={isResettingHistory}
        />
        <EmailDetail email={selectedEmail} />
        <DraftWriter
          status={draftStatus}
          value={draft}
          requiresApproval={requiresApproval}
          approvalReason={approvalReason}
          selectedId={selectedId}
          isBlocked={isBlocked}
          onGenerateDraft={() => void generateDraft()}
          onChange={setDraft}
        />
      </section>
    </main>
  );
}
