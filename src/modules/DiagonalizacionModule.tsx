import { Workbench } from '../components/ui/Workspace';
import { useMemo } from 'react';
import { analyzeEigen } from '../core/eigen';
import { parseGrid, ratLatex } from '../core/matrix';
import { DEFAULTS, useExercise, type ModuleProps } from '../core/exercise';
import { MatrixGrid } from '../components/math/MatrixGrid';
import { StepAccordion } from '../components/math/StepAccordion';
import { Latex } from '../components/math/Latex';
import { EmptyResult, ModuleHeading, Note, Result } from '../components/ui/Workspace';
function formatComplex(re: number, im: number) {
  const format = (n: number) => Number(n.toPrecision(6)).toString();
  if (!Number.isFinite(re) || !Number.isFinite(im)) return 'Sin convergencia numérica';
  if (Math.abs(im) < 1e-7) return format(re);
  return `${Math.abs(re) < 1e-7 ? '' : format(re)} ${im < 0 ? '−' : '+'} ${format(Math.abs(im))}i`.trim();
}
export function DiagonalizacionModule(props: ModuleProps) {
  const [s, update] = useExercise('diagonalizacion', props);
  const { matrix: a } = useMemo(() => parseGrid(s.grid), [s.grid]);
  const result = useMemo(() => (a ? analyzeEigen(a) : null), [a]);
  const diag = result?.diagonalization;
  return (
    <div>
      <ModuleHeading chapter="Capítulo 04" title="Diagonalización">
        Encuentra las direcciones propias de una matriz y entiende su descomposición.
      </ModuleHeading>
      <Workbench>
        <aside className="editor-panel">
          <div className="panel-heading">
            <h2>Tu matriz cuadrada</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => update(DEFAULTS.diagonalizacion)}
            >
              Restablecer
            </button>
          </div>
          <MatrixGrid
            square
            grid={s.grid}
            onChange={(grid) => update({ grid })}
            label="Matriz A"
            presets={[
              { label: 'Diagonalizable 2 × 2', values: DEFAULTS.diagonalizacion.grid },
              {
                label: 'Matriz defectiva',
                values: [
                  ['1', '1'],
                  ['0', '1'],
                ],
              },
              {
                label: 'Autovalores irracionales',
                values: [
                  ['1', '1'],
                  ['1', '0'],
                ],
              },
              {
                label: 'Ejemplo 3 × 3',
                values: [
                  ['2', '0', '0'],
                  ['0', '3', '4'],
                  ['0', '4', '9'],
                ],
              },
            ]}
          />
          <Note>
            Construimos P y D cuando todos los autovalores son racionales. Para raíces no racionales
            mostramos expresiones exactas cuando es posible y aproximaciones identificadas.
          </Note>
        </aside>
        <div className="results-column">
          {!result ? (
            <EmptyResult />
          ) : (
            <>
              <Result
                label={
                  result.diagonalizable === true
                    ? 'La matriz es diagonalizable'
                    : result.diagonalizable === false
                      ? 'La matriz es defectiva'
                      : 'El análisis exacto tiene un alcance limitado'
                }
              >
                {result.spaces.length > 0 && (
                  <div className="eigen-values">
                    {result.spaces.map((space) => (
                      <div key={space.value.toString()}>
                        <Latex math={`\\lambda = ${space.value.toLatex()}`} />
                        <span>
                          Multiplicidad {space.algebraic} · {space.geometric}{' '}
                          {space.geometric === 1 ? 'autovector' : 'autovectores'} en la base
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {!result.allRational && (
                  <p>
                    Hay raíces pendientes del análisis racional. La ausencia de P y D no implica por
                    sí sola que la matriz no sea diagonalizable.
                  </p>
                )}
                {result.diagonalizable === false && (
                  <p>
                    La multiplicidad geométrica de al menos un autovalor es menor que su
                    multiplicidad algebraica.
                  </p>
                )}
              </Result>
              {!result.allRational && (
                <section className="result-section">
                  <h2>Raíces no incluidas en el análisis racional</h2>
                  {result.roots.remainderLatex.map((math, i) => (
                    <Latex key={i} math={`\\lambda = ${math}`} block />
                  ))}
                  <p className="input-hint">
                    Aproximaciones numéricas, no usadas para construir P:
                  </p>
                  <ul className="numeric-roots">
                    {result.roots.remainderNumeric.map((root, i) => (
                      <li key={i}>λ ≈ {formatComplex(root.re, root.im)}</li>
                    ))}
                  </ul>
                  {result.roots.searchLimited && (
                    <Note warning>
                      Se alcanzó el límite de búsqueda racional para evitar bloquear tu navegador.
                      Estas raíces podrían incluir valores racionales.
                    </Note>
                  )}
                </section>
              )}
              <StepAccordion
                steps={result.charSteps}
                title="Construye el polinomio característico"
              />
              <Result
                label="Ecuación característica"
                math={`p(\\lambda) = ${result.charPoly.toLatex()} = 0`}
              />
              {result.spaces.map((space) => (
                <section key={space.value.toString()} className="result-section">
                  <h2>Espacio propio para λ = {space.value.toString()}</h2>
                  <div className="eigen-basis">
                    {space.basis.map((v, i) => (
                      <Latex
                        key={i}
                        math={`v_{${i + 1}} = \\begin{pmatrix}${v.map((c) => c.toLatex()).join(' \\\\ ')}\\end{pmatrix}`}
                        block
                      />
                    ))}
                  </div>
                  <StepAccordion
                    steps={space.reduction.steps}
                    title="Obtén la base con Gauss-Jordan"
                  />
                </section>
              ))}
              {diag && (
                <section className="result-section">
                  <h2>La factorización A = P D P⁻¹</h2>
                  <div className="paired-matrices">
                    <Latex math={`P = ${ratLatex(diag.P)}`} block />
                    <Latex math={`D = ${ratLatex(diag.D)}`} block />
                  </div>
                  <StepAccordion steps={diag.inverse.steps} title="Calcula P⁻¹" />
                  <Result
                    label={
                      diag.verified
                        ? 'Factorización verificada con aritmética exacta'
                        : 'La verificación no coincide'
                    }
                    math={`P D P^{-1} = ${ratLatex(diag.PDPinv)}`}
                  />
                </section>
              )}
            </>
          )}
        </div>
      </Workbench>
    </div>
  );
}
