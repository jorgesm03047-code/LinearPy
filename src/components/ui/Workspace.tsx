import React, { useEffect, useRef, useState } from 'react';
import { Latex } from '../math/Latex';
import { Rational } from '../../core/rational';

export function ModuleHeading({
  chapter,
  title,
  children,
}: {
  chapter: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="module-heading">
      <div className="eyebrow">
        {chapter} <span>/</span> Cuaderno de trabajo
      </div>
      <h1>{title}</h1>
      <p>{children}</p>
    </div>
  );
}
export function Tabs<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (value: T) => void;
  items: { id: T; label: string }[];
}) {
  return (
    <nav className="workspace-tabs" aria-label="Operaciones del capítulo">
      {items.map((item) => (
        <button
          type="button"
          key={item.id}
          aria-pressed={value === item.id}
          className={value === item.id ? 'active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  );
}
export function Result({
  label = 'Resultado',
  math,
  children,
}: {
  label?: string;
  math?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="result-panel">
      <div className="result-label">
        <span className="status-dot" />
        {label}
      </div>
      {math && <Latex math={math} block />}
      {children}
    </section>
  );
}
export function EmptyResult() {
  return (
    <div className="empty-result" role="status">
      <span className="empty-symbol">[ ? ]</span>
      <h2>Completa los datos</h2>
      <p>
        Escribe un entero, decimal o fracción en cada campo para obtener el resultado y su
        procedimiento.
      </p>
    </div>
  );
}
export function Note({
  children,
  warning = false,
}: {
  children: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <p
      className={`workspace-note${warning ? ' warning' : ''}`}
      role={warning ? 'status' : undefined}
    >
      {children}
    </p>
  );
}
export function VectorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <fieldset className="vector-input">
      <legend>{label}</legend>
      <div>
        {value.map((v, i) => (
          <label key={i}>
            <span>{['x', 'y', 'z'][i]}</span>
            <input
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              maxLength={32}
              aria-invalid={!Rational.parse(v)}
              value={v}
              onChange={(e) => onChange(value.map((c, j) => (j === i ? e.target.value : c)))}
              aria-label={`${label}, componente ${['x', 'y', 'z'][i]}`}
            />
          </label>
        ))}
      </div>
      {value.some((v) => !Rational.parse(v)) && (
        <p className="field-error" role="status">
          Completa cada componente con un entero, decimal o fracción.
        </p>
      )}
    </fieldset>
  );
}

export function Workbench({ children }: { children: React.ReactNode }) {
  const [view, setView] = useState<'editor' | 'result'>('editor');
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportMessage, setExportMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const downloadRef = useRef('');
  useEffect(
    () => () => {
      if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
    },
    [],
  );
  const root = useRef<HTMLDivElement>(null);
  const exportPdf = async () => {
    if (!root.current || exporting) return;
    setExporting(true);
    setExportProgress(0);
    setExportMessage('');
    setDownloadUrl('');
    if (downloadRef.current) URL.revokeObjectURL(downloadRef.current);
    downloadRef.current = '';
    try {
      const { exportExercisePdf } = await import('../export/exportPdf');
      const file = await exportExercisePdf(root.current, setExportProgress);
      if (!root.current) return;
      const url = URL.createObjectURL(file.blob);
      downloadRef.current = url;
      setDownloadUrl(url);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      document.body.append(link);
      link.click();
      link.remove();
      setExportMessage('PDF preparado. Revisa tus descargas o usa el enlace para abrirlo.');
    } catch (error) {
      setExportMessage(
        error instanceof Error && error.message.startsWith('Completa')
          ? error.message
          : 'No pudimos generar el PDF. Intenta de nuevo con un ejercicio más pequeño.',
      );
    } finally {
      setExporting(false);
    }
  };
  const switchView = (next: 'editor' | 'result') => {
    setView(next);
    root.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  };
  return (
    <div className="workbench-shell" data-view={view} ref={root}>
      <div className="exercise-export">
        <span>Guarda los datos, el resultado y todos los pasos.</span>
        <button type="button" className="btn btn-outline" disabled={exporting} onClick={exportPdf}>
          {exporting ? `Preparando PDF… ${exportProgress}%` : 'Descargar PDF'}
        </button>
      </div>
      {exportMessage && (
        <p className="export-message" role="status">
          {exportMessage}{' '}
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noreferrer">
              Abrir PDF
            </a>
          )}
        </p>
      )}
      <div className="mobile-view-controls" role="group" aria-label="Vista del ejercicio">
        <button type="button" aria-pressed={view === 'editor'} onClick={() => switchView('editor')}>
          Datos del ejercicio
        </button>
        <button type="button" aria-pressed={view === 'result'} onClick={() => switchView('result')}>
          Resultado y pasos
        </button>
      </div>
      <div className="workbench">{children}</div>
      <button
        type="button"
        className="btn btn-primary mobile-result-action"
        onClick={() => switchView(view === 'editor' ? 'result' : 'editor')}
      >
        {view === 'editor' ? 'Ver resultado y procedimiento →' : '← Volver a los datos'}
      </button>
    </div>
  );
}
