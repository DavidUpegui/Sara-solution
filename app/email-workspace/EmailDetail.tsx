import type { ClassifiedEmail } from "@/domain/models/EmailClassification";

import { formatDate, formatTime, getInitials } from "./emailFormatters";

type EmailDetailProps = { email: ClassifiedEmail | null };

export default function EmailDetail({ email }: EmailDetailProps) {
  if (!email)
    return (
      <article className="message-panel">
        <div className="panel-placeholder">Cargando conversaciones...</div>
      </article>
    );
  return (
    <article className="message-panel">
      <div className="message-toolbar">
        <span className="label-pill">Entrada</span>
        <span className="toolbar-actions">... &nbsp; ⋮</span>
      </div>
      <div className="message-heading">
        <h2>{email.asunto}</h2>
        <p>
          Recibido el {formatDate(email.fecha)} a las {formatTime(email.fecha)}
        </p>
      </div>
      <div className="detail-labels">
        <span className="category-badge" style={{ backgroundColor: email.classification.categoryColor }}>
          {email.classification.category}
        </span>
        <span className="urgency-badge" style={{ borderColor: email.classification.urgencyColor, color: email.classification.urgencyColor }}>
          Urgencia {email.classification.urgency}
        </span>
        <span className="risk-badge" style={{ backgroundColor: email.classification.riskColor }}>
          Riesgo: {email.classification.risk}
        </span>
        <span className="relevance-badge" style={{ borderColor: email.classification.relevanceColor, color: email.classification.relevanceColor }}>
          {email.classification.relevance}
        </span>
      </div>
      <div className="sender-line">
        <span className="avatar avatar-large avatar-2">
          {getInitials(email.nombre)}
        </span>
        <div>
          <strong>{email.nombre}</strong>
          <p>{email.de}</p>
        </div>
        <button className="quiet-action">Responder</button>
      </div>
      <div className="message-body">
        {email.cuerpo.split(". ").map((sentence, index) => (
          <p key={`${email.id}-${index}`}>
            {sentence}
            {sentence.endsWith(".") ? "" : "."}
          </p>
        ))}
      </div>
      <div className="classification-reason">
        <strong>Razón de clasificación</strong>
        <p>{email.classification.reason}</p>
      </div>
      <div className="message-footer">
        <span>Este correo fue seleccionado para revisión</span>
        <span className="footer-line" />
      </div>
    </article>
  );
}
