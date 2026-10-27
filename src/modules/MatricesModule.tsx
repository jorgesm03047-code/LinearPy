import { Workbench } from '../components/ui/Workspace';
import { useMemo } from 'react';
import {
  determinantSteps,
  gaussJordan,
  inverseSteps,
  parseGrid,
  ratLatex,
  RationalRing,
} from '../core/matrix';
import { solveSystem } from '../core/systems';
import { DEFAULTS, useExercise, type ModuleProps } from '../core/exercise';
import { MatrixGrid } from '../components/math/MatrixGrid';
import { StepAccordion } from '../components/math/StepAccordion';
import { Latex } from '../components/math/Latex';
import { EmptyResult, ModuleHeading, Note, Result, Tabs } from '../components/ui/Workspace';
export function MatricesModule(props: ModuleProps) {
  const [s, update] = useExercise('matrices', props);
  const operation = s.operation ?? 'gauss';
  const key = s.tab === 'operaciones' ? 'matrixGrid' : s.tab === 'sel' ? 'selGrid' : 'liGrid';
  const { matrix: a } = useMemo(() => parseGrid(s[key]), [s, key]);
  const data = useMemo(() => {
    if (!a) return null;
    if (s.tab === 'sel') {
      const system = solveSystem(a);
      return { steps: system.reduction.steps, system, rank: system.rankA };
    }
    const gj = gaussJordan(a);
    if (s.tab === 'li') return { steps: gj.steps, rank: gj.pivots.length, gj };
    if (operation === 'det' && a.length === a[0].length) {
      const det = determinantSteps(a, RationalRing);
      return {
        steps: det.steps,
        rank: gj.pivots.length,
        math: `\\det(A) = ${det.value.toLatex()}`,
      };
    }
    if (operation === 'inv' && a.length === a[0].length) {
      const inv = inverseSteps(a);
      return {
        steps: inv.steps,
        rank: gj.pivots.length,
        math: inv.inverse ? `A^{-1} = ${ratLatex(inv.inverse)}` : undefined,
        singular: !inv.inverse,
      };
    }
    return {
      steps: gj.steps,
      rank: gj.pivots.length,
      gj,
      math: `\\operatorname{RREF}(A) = ${ratLatex(gj.rref)}`,
    };
  }, [a, s.tab, operation]);
  const square = a && a.length === a[0].length;
  return (
    <div>
      <ModuleHeading chapter="Capítulo 02" title="Matrices y sistemas">
        De una cuadrícula de números a una solución que puedes explicar.
      </ModuleHeading>
      <Tabs
        value={s.tab}
        onChange={(tab) => update({ tab })}
        items={[
          { id: 'operaciones', label: 'Operaciones matriciales' },
          { id: 'sel', label: 'Sistemas de ecuaciones' },
          { id: 'li', label: 'Independencia lineal' },
        ]}
      />
      <Workbench>
        <aside className="editor-panel">
          <div className="panel-heading">
            <h2>
              {s.tab === 'sel'
                ? 'Tu sistema [A | b]'
                : s.tab === 'li'
                  ? 'Tus vectores, por filas'
                  : 'Tu matriz A'}
            </h2>
            <button
              className="text-button"
              type="button"
              onClick={() => update({ [key]: DEFAULTS.matrices[key] })}
            >
              Restablecer
            </button>
          </div>
          {s.tab === 'operaciones' && (
            <label className="control-label">
              ¿Qué quieres calcular?
              <select
                value={operation}
                onChange={(e) => update({ operation: e.target.value as typeof operation })}
              >
                <option value="gauss">Reducción de Gauss-Jordan</option>
                <option value="det">Determinante por cofactores</option>
                <option value="inv">Inversa por la adjunta</option>
              </select>
            </label>
          )}
          <MatrixGrid
            grid={s[key]}
            onChange={(grid) => update({ [key]: grid })}
            augment={s.tab === 'sel' ? 1 : 0}
            label={s.tab === 'sel' ? 'Sistema aumentado' : 'Matriz A'}
            presets={
              s.tab === 'sel'
                ? [
                    { label: 'Solución única', values: DEFAULTS.matrices.selGrid },
                    {
                      label: 'Infinitas soluciones',
                      values: [
                        ['1', '2', '3'],
                        ['2', '4', '6'],
                      ],
                    },
                    {
                      label: 'Sin solución',
                      values: [
                        ['1', '1', '1'],
                        ['1', '1', '2'],
                      ],
                    },
                  ]
                : [
                    { label: 'Ejemplo 3 × 3', values: DEFAULTS.matrices.matrixGrid },
                    {
                      label: 'Matriz singular',
                      values: [
                        ['1', '2'],
                        ['2', '4'],
                      ],
                    },
                  ]
            }
          />
          <Note>
            {s.tab === 'sel'
              ? 'La última columna contiene los términos independientes. El resto corresponde a tus incógnitas.'
              : s.tab === 'li'
                ? 'Cada fila es un vector. Comparamos su cantidad con el rango de la matriz.'
                : 'Los cálculos usan fracciones exactas. La visualización se actualiza al editar.'}
          </Note>
        </aside>
        <div className="results-column">
          {!data || !a ? (
            <EmptyResult />
          ) : s.tab === 'operaciones' && operation !== 'gauss' && !square ? (
            <Note warning>
              Elige el mismo número de filas y columnas para calcular{' '}
              {operation === 'det' ? 'el determinante' : 'la inversa'}.
            </Note>
          ) : (
            <>
              {data.system ? (
                <Result
                  label={
                    data.system.kind === 'unica'
                      ? 'Una solución única'
                      : data.system.kind === 'infinitas'
                        ? 'Infinitas soluciones'
                        : 'El sistema no tiene solución'
                  }
                >
                  <div className="result-metrics">
                    <span>
                      Rango A <strong>{data.system.rankA}</strong>
                    </span>
                    <span>
                      Rango [A | b] <strong>{data.system.rankAug}</strong>
                    </span>
                    <span>
                      Incógnitas <strong>{data.system.unknowns}</strong>
                    </span>
                  </div>
                  {data.system.solution.map((sol, i) => (
                    <Latex key={i} math={sol} block />
                  ))}
                  {data.system.kind === 'incompatible' && (
                    <Note warning>
                      Una fila representa una contradicción: cero es igual a un número distinto de
                      cero.
                    </Note>
                  )}
                </Result>
              ) : s.tab === 'li' ? (
                <Result
                  label={
                    data.rank === a.length
                      ? 'Vectores linealmente independientes'
                      : 'Vectores linealmente dependientes'
                  }
                >
                  <div className="result-metrics">
                    <span>
                      Rango <strong>{data.rank}</strong>
                    </span>
                    <span>
                      Vectores <strong>{a.length}</strong>
                    </span>
                  </div>
                  <p>
                    {data.rank === a.length
                      ? 'Ningún vector se obtiene como combinación lineal de los demás.'
                      : 'El rango es menor que la cantidad de vectores. Al menos uno se obtiene a partir de los demás.'}
                  </p>
                </Result>
              ) : (
                <Result
                  label={data.singular ? 'La matriz no tiene inversa' : 'Resultado exacto'}
                  math={data.math}
                >
                  <p className="result-footnote">
                    Rango {data.rank} · Matriz de {a.length} × {a[0].length}
                    {data.singular ? ' · Determinante igual a cero' : ''}
                  </p>
                </Result>
              )}
              <StepAccordion steps={data.steps} />
            </>
          )}
        </div>
      </Workbench>
    </div>
  );
}
