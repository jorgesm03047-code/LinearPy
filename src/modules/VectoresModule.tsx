import { Workbench } from '../components/ui/Workspace';
import { lazy, Suspense, useMemo } from 'react';
import { Rational } from '../core/rational';
import {
  cross,
  crossSteps,
  dot,
  dotSteps,
  lineSteps,
  norm,
  normSteps,
  planeSteps,
  unitSteps,
  type Vec3,
} from '../core/vectors';
import { vectorLatex } from '../core/matrix';
import { DEFAULTS, useExercise, type ModuleProps } from '../core/exercise';
import { StepAccordion } from '../components/math/StepAccordion';
import {
  EmptyResult,
  ModuleHeading,
  Note,
  Result,
  Tabs,
  VectorInput,
} from '../components/ui/Workspace';
const Viewport3D = lazy(() =>
  import('../components/visuals/Viewport3D').then((m) => ({ default: m.Viewport3D })),
);
function parse(v: string[]): Vec3 | null {
  const p = v.map(Rational.parse);
  return p.every(Boolean) ? (p as Vec3) : null;
}
export function VectoresModule(props: ModuleProps) {
  const [s, update] = useExercise('vectores', props);
  const operation = s.operation ?? 'norma';
  const u = useMemo(() => parse(s.u), [s.u]),
    v = useMemo(() => parse(s.v), [s.v]);
  const p0 = useMemo(() => parse(s.p0), [s.p0]),
    d = useMemo(() => parse(s.d), [s.d]);
  const steps = useMemo(() => {
    if (!u || !v) return [];
    if (operation === 'punto') return dotSteps(u, v);
    if (operation === 'cruz') return crossSteps(u, v);
    if (operation === 'unitario') return unitSteps(u, 'u');
    return [normSteps(u, 'u'), normSteps(v, 'v')];
  }, [u, v, operation]);
  const summary =
    u && v
      ? operation === 'punto'
        ? {
            label: 'Producto punto exacto',
            math: `\\vec u \\cdot \\vec v = ${dot(u, v).toLatex()}`,
          }
        : operation === 'cruz'
          ? {
              label: 'Producto cruz exacto',
              math: `\\vec u \\times \\vec v = ${vectorLatex(cross(u, v))}`,
            }
          : operation === 'unitario'
            ? { label: 'Vector unitario de u', math: steps[0]?.math?.[steps[0].math.length - 1] }
            : {
                label: 'Magnitudes exactas',
                math: `\\|\\vec u\\| = ${norm(u).toLatex()} \\qquad \\|\\vec v\\| = ${norm(v).toLatex()}`,
              }
      : null;
  const geometry = s.tab === 'rectas';
  return (
    <div>
      <ModuleHeading chapter="Capítulo 01" title="Vectores y geometría">
        Calcula, interpreta y mira qué ocurre en el espacio.
      </ModuleHeading>
      <Tabs
        value={s.tab}
        onChange={(tab) => update({ tab })}
        items={[
          { id: 'operaciones', label: 'Operaciones con vectores' },
          { id: 'rectas', label: 'Rectas y planos' },
          { id: 'lab', label: 'Laboratorio 3D' },
        ]}
      />
      <Workbench>
        <aside className="editor-panel">
          <div className="panel-heading">
            <h2>{geometry ? 'Punto y dirección' : 'Tus vectores en R³'}</h2>
            <button
              className="text-button"
              type="button"
              onClick={() => update({ ...DEFAULTS.vectores, tab: s.tab })}
            >
              Restablecer
            </button>
          </div>
          {s.tab === 'operaciones' && (
            <label className="control-label">
              ¿Qué quieres explorar?
              <select
                value={operation}
                onChange={(e) => update({ operation: e.target.value as typeof operation })}
              >
                <option value="norma">Magnitud de los vectores</option>
                <option value="punto">Producto punto y ángulo</option>
                <option value="cruz">Producto cruz y área</option>
                <option value="unitario">Vector unitario de u</option>
              </select>
            </label>
          )}
          {geometry ? (
            <>
              <VectorInput label="Punto P₀" value={s.p0} onChange={(p0) => update({ p0 })} />
              <VectorInput
                label="Vector d / normal n"
                value={s.d}
                onChange={(d) => update({ d })}
              />
            </>
          ) : (
            <>
              <VectorInput label="Vector u" value={s.u} onChange={(u) => update({ u })} />
              <VectorInput label="Vector v" value={s.v} onChange={(v) => update({ v })} />
            </>
          )}
          <Note>
            {geometry
              ? 'Usamos d como dirección de la recta y como normal del plano que pasa por P₀.'
              : 'Acepta enteros, decimales y fracciones. Los ángulos se muestran con una aproximación decimal.'}
          </Note>
          <div className="presets">
            <span>Prueba un ejemplo</span>
            <button
              type="button"
              onClick={() =>
                update(
                  geometry
                    ? { p0: ['0', '0', '0'], d: ['1', '0', '0'] }
                    : { u: ['1', '0', '0'], v: ['0', '1', '0'] },
                )
              }
            >
              {geometry ? 'Dirección del eje x' : 'Vectores perpendiculares'} <span>↗</span>
            </button>
            <button
              type="button"
              onClick={() =>
                update(
                  geometry
                    ? { p0: ['1', '2', '0'], d: ['0', '0', '1'] }
                    : { u: ['1', '2', '3'], v: ['2', '4', '6'] },
                )
              }
            >
              {geometry ? 'Normal del plano horizontal' : 'Vectores paralelos'} <span>↗</span>
            </button>
          </div>
        </aside>
        <div className="results-column">
          {geometry ? (
            p0 && d ? (
              <>
                <Result label="Una dirección, dos objetos geométricos">
                  <p>
                    La recta avanza en la dirección d. El plano tiene a d como vector perpendicular.
                  </p>
                </Result>
                <StepAccordion steps={lineSteps(p0, d)} title="Ecuaciones de la recta" />
                <StepAccordion steps={planeSteps(p0, d)} title="Ecuación del plano" />
              </>
            ) : (
              <EmptyResult />
            )
          ) : u && v ? (
            s.tab === 'lab' ? (
              <>
                <div className="visual-heading">
                  <h2>El espacio de tus vectores</h2>
                  <span>Vista interactiva</span>
                </div>
                <Suspense fallback={<p role="status">Preparando la escena 3D…</p>}>
                  <Viewport3D
                    u={u.map((c) => c.toNumber()) as [number, number, number]}
                    v={v.map((c) => c.toNumber()) as [number, number, number]}
                    cross={cross(u, v).map((c) => c.toNumber()) as [number, number, number]}
                    showPlane
                  />
                </Suspense>
                <Note>
                  Azul: u · Naranja: v · Blanco: u × v. El paralelogramo muestra el área que
                  generan.
                </Note>
              </>
            ) : (
              <>
                <Result label={summary?.label} math={summary?.math}>
                  {operation === 'unitario' && !summary?.math && (
                    <Note warning>El vector cero no tiene vector unitario.</Note>
                  )}
                </Result>
                <StepAccordion
                  steps={steps}
                  title={
                    operation === 'norma'
                      ? 'De las componentes a la magnitud'
                      : 'Explora el procedimiento'
                  }
                />
              </>
            )
          ) : (
            <EmptyResult />
          )}
        </div>
      </Workbench>
    </div>
  );
}
