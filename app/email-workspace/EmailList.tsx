import type { Email } from "@/domain/models/Email";

import { formatDate, getInitials } from "./emailFormatters";

type EmailListProps = {
  emails: Email[];
  totalCount: number;
  selectedId: number | null;
  query: string;
  onQueryChange: (query: string) => void;
  onSelectEmail: (email: Email) => void;
};

export default function EmailList({
  emails,
  totalCount,
  selectedId,
  query,
  onQueryChange,
  onSelectEmail,
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
      <div className="inbox-tabs">
        <button className="tab-active">
          Todos <span>{totalCount}</span>
        </button>
        <button>
          No leídos <span>8</span>
        </button>
      </div>
      <div className="email-list">
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
              <span className="email-excerpt">{email.cuerpo}</span>
            </span>
            {index < 4 && <span className="unread-dot" />}
          </button>
        ))}
        {!emails.length && (
          <p className="empty-list">No encontramos correos con esa búsqueda.</p>
        )}
      </div>
    </aside>
  );
}
