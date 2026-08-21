import type { DraftStatus } from "./types";

type DraftWriterProps = {
  status: DraftStatus;
  value: string;
  requiresApproval: boolean;
  approvalReason: string;
  selectedId: number | null;
  onGenerateDraft: () => void;
  onChange: (value: string) => void;
};

export default function DraftWriter({
  status,
  value,
  requiresApproval,
  approvalReason,
  selectedId,
  onGenerateDraft,
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
          <strong>
            {selectedId === null ? "Seleccione un correo" : "Correo seleccionado"}
          </strong>
          <p>
            {selectedId === null
              ? "El borrador aparecerá aquí para que pueda revisarlo."
              : "Genere un borrador con IA cuando esté listo para revisar la respuesta."}
          </p>
          {selectedId !== null && (
            <button
              type="button"
              className="primary-button draft-generate-button"
              onClick={onGenerateDraft}
            >
              Generar borrador con IA
            </button>
          )}
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
            <button
              type="button"
              className="secondary-button"
              onClick={onGenerateDraft}
            >
              Generar borrador con IA
            </button>
          </div>
          <div className="draft-actions">
            <button type="button" className="secondary-button">Descartar</button>
            <button type="button" className="primary-button">
              Revisar y enviar <span>→</span>
            </button>
          </div>
        </>
      )}
    </aside>
  );
}
