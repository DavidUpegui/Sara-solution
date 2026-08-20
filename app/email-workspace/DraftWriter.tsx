import type { DraftStatus } from "./types";

type DraftWriterProps = {
  status: DraftStatus;
  value: string;
  requiresApproval: boolean;
  approvalReason: string;
  onChange: (value: string) => void;
};

export default function DraftWriter({
  status,
  value,
  requiresApproval,
  approvalReason,
  onChange,
}: DraftWriterProps) {
  return (
    <aside className="draft-panel">
      <div className="draft-heading">
        <div>
          <span className="panel-kicker">Asistente de Sara</span>
          <h2>Borrador de respuesta</h2>
        </div>
        <span className="sparkle">✦</span>
      </div>
      {status === "loading" && (
        <div className="draft-loading">
          <span className="loading-orbit" />
          <strong>Redactando respuesta</strong>
          <p>Analizando el contexto del correo y las reglas de Aurora...</p>
        </div>
      )}
      {status === "idle" && (
        <div className="draft-loading">
          <span className="draft-icon">✎</span>
          <strong>Seleccione un correo</strong>
          <p>El borrador aparecerá aquí para que pueda revisarlo.</p>
        </div>
      )}
      {(status === "ready" || status === "error") && (
        <>
          {status === "ready" && requiresApproval && approvalReason && (
            <div className="draft-notice">
              Requiere aprobación de Sara: {approvalReason}
            </div>
          )}
          <div
            className={
              status === "error"
                ? "draft-notice"
                : "draft-notice draft-notice-hidden"
            }
          >
            No se pudo conectar con el asistente. Mostramos una plantilla
            editable.
          </div>
          <textarea
            className="draft-editor"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-label="Borrador de respuesta"
          />
          <div className="draft-meta">
            <span>✦ Generado por Aurora AI</span>
            <span>Editable</span>
          </div>
          <div className="draft-actions">
            <button className="secondary-button">Descartar</button>
            <button className="primary-button">
              Revisar y enviar <span>→</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
