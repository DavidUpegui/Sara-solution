import type { ClassifiedEmail } from "@/domain/models/EmailClassification";

import { formatDate, getInitials } from "./emailFormatters";

type EmailListProps = {
  emails: ClassifiedEmail[];
  totalCount: number;
  selectedId: number | null;
  query: string;
  categoryFilter: string;
  categories: string[];
  error: string | null;
  isLoading: boolean;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  onSelectEmail: (email: ClassifiedEmail) => void;
  onRetry: () => void;
};

export default function EmailList({
  emails,
  totalCount,
  selectedId,
  query,
  categoryFilter,
  categories,
  error,
  isLoading,
  onQueryChange,
  onSelectEmail,
  onCategoryChange,
  onRetry,
}: EmailListProps) {
  return (
    <aside className="inbox-panel">
      <div className="panel-heading">
        <div>
          <span className="panel-kicker">Bandeja de entrada</span>
          <h2>Conversaciones</h2>
        </div>
        <span className="count-badge">{emails.length}</span>
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
      <div className="inbox-tabs">
        <button className="tab-active">
          Todos <span>{totalCount}</span>
        </button>
        <button>
          No leídos <span>8</span>
        </button>
      </div>
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
            <strong>Categorizando correos</strong>
            <p>Estamos clasificando la bandeja para mostrarte los mensajes ordenados.</p>
          </div>
        )}
        {!isLoading && emails.map((email, index) => (
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
