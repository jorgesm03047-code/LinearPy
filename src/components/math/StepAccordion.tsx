import React, { useEffect, useState } from 'react';
import type { Step } from '../../core/types';
import { Latex } from './Latex';
function InlineMath({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\$[^$]+\$)/g)
        .map((part, i) =>
          part.startsWith('$') && part.endsWith('$') ? (
            <Latex key={i} math={part.slice(1, -1)} />
          ) : (
            <React.Fragment key={i}>{part}</React.Fragment>
          ),
        )}
    </>
  );
}
function StepItem({
  step,
  index,
  expanded,
}: {
  step: Step;
  index: number;
  expanded: boolean | null;
}) {
  const [open, setOpen] = useState(index === 0 || step.tone === 'result');
  useEffect(() => {
    if (expanded !== null) setOpen(expanded);
  }, [expanded]);
  return (
    <details
      className={`step-item ${step.tone ?? ''}`}
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
        <span>
          <InlineMath text={step.title} />
        </span>
        <span className="step-toggle" aria-hidden="true">
          +
        </span>
      </summary>
      {open && (
        <div className="step-body">
          {step.detail && (
            <p>
              <InlineMath text={step.detail} />
            </p>
          )}
          {step.math?.map((expr, i) => (
            <Latex key={i} math={expr} block />
          ))}
        </div>
      )}
    </details>
  );
}
export function StepAccordion({
  steps,
  title = 'Cómo llegamos al resultado',
}: {
  steps: Step[];
  title?: string;
}) {
  const [expanded, setExpanded] = useState<boolean | null>(null);
  if (!steps.length) return null;
  return (
    <section className="procedure">
      <div className="procedure-heading">
        <h2>{title}</h2>
        <button
          type="button"
          className="text-button"
          onClick={() => setExpanded((v) => v !== true)}
        >
          {expanded === true ? 'Contraer' : 'Ver todos los pasos'}
        </button>
      </div>
      <p className="procedure-caption">
        {steps.length} {steps.length === 1 ? 'paso' : 'pasos'} · Abre cada paso para seguir la
        explicación.
      </p>
      <div className="steps-list">
        {steps.map((step, i) => (
          <StepItem key={i} step={step} index={i} expanded={expanded} />
        ))}
      </div>
    </section>
  );
}
