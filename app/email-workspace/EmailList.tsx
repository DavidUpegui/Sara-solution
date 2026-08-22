import type { ClassifiedEmail } from "@/domain/models/EmailClassification";

import { formatDate, getInitials } from "./emailFormatters";

type EmailListProps = {
  emails: ClassifiedEmail[];
  selectedId: number | null;
  query: string;
  categoryFilter: string;
  categories: string[];
  error: string | null;
  isLoading: boolean;
  progress: { processed: number; total: number };
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSelectEmail: (email: ClassifiedEmail) => void;
  onRetry: () => void;
  onResetHistory: () => void;
  isResettingHistory: boolean;
};

export default function EmailList({
  emails,
  selectedId,
  query,
  categoryFilter,
  categories,
  error,
  isLoading,
  progress,
  onQueryChange,
  onSelectEmail,
  onCategoryChange,
  onRetry,
  onResetHistory,
  isResettingHistory,
}: EmailListProps) {
  return (
    <aside className="inbox-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">Bandeja de entrada</span>
          <h2>Conversaciones</h2>
        </div>
        <button
          type="button"
          className="reset-history-button"
          onClick={onResetHistory}
          disabled={isResettingHistory}
          aria-label="Borra la caché de categorización e historial de los correos"
        >
          {isResettingHistory ? "Borrando caché…" : "Borrar caché"}
          <span className="reset-tooltip" role="tooltip">
            Elimina la caché de categorización e historial para volver a
            procesar los correos desde cero.
          </span>
        </button>
      </div>
      <label className="search-box">
        <span aria-hidden="true">/</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Buscar correo"
          aria-label="Buscar correo"
        />
        <kbd>⌘ K</kbd>
      </label>
      <label className="category-filter">
        <span>Proyecto</span>
        <select value={categoryFilter} onChange={(event) => onCategoryChange(event.target.value)} aria-label="Filtrar por proyecto">
          <option value="">Todos los proyectos</option>
          {categories.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
      </label>
      <div className="email-list">
        {error && (
          <div className="inbox-error" role="alert">
            <strong>No se pudo cargar la bandeja</strong>
            <p>{error}</p>
            <button type="button" onClick={onRetry}>Reintentar</button>
          </div>
        )}
        {isLoading && !error && (
          <div className="inbox-loading" role="status" aria-live="polite">
            <span className="loading-orbit" />
            <strong>
              {progress.processed === 0
                ? "Categorizando correos"
                : `Clasificados ${progress.processed} de ${progress.total}`}
            </strong>
            <p>
              {progress.total > progress.processed
                ? `Faltan ${progress.total - progress.processed} correos por procesar.`
                : "Estamos terminando de preparar la bandeja."}
            </p>
          </div>
        )}
        {emails.map((email, index) => (
          <button
            key={email.id}
            className={`email-row ${email.id === selectedId ? "email-row-active" : ""}`}
            onClick={() => onSelectEmail(email)}
          >
            <span className={`avatar avatar-${(index % 4) + 1}`}>
              {getInitials(email.nombre)}
            </span>
            <span className="email-row-content">
              <span className="email-row-top">
                <strong>{email.nombre.split("·")[0].trim()}</strong>
                <time>{formatDate(email.fecha)}</time>
              </span>
              <span className="email-subject">{email.asunto}</span>
              <span className="email-labels">
                <span className="category-badge" style={{ backgroundColor: email.classification.categoryColor }}>
                  {email.classification.category}
                </span>
                <span className="urgency-badge" style={{ borderColor: email.classification.urgencyColor, color: email.classification.urgencyColor }}>
                  {email.classification.urgency}
                </span>
                <span className="risk-badge" style={{ backgroundColor: email.classification.riskColor }}>
                  {email.classification.risk}
                </span>
                <span className="relevance-badge" style={{ borderColor: email.classification.relevanceColor, color: email.classification.relevanceColor }}>
                  {email.classification.relevance}
                </span>
              </span>
              <span className="email-excerpt">{email.cuerpo}</span>
            </span>
            {index < 4 && <span className="unread-dot" />}
          </button>
        ))}
        {!isLoading && !emails.length && !error && (
          <p className="empty-list">No encontramos correos con esa búsqueda.</p>
        )}
      </div>
    </aside>
  );
}
