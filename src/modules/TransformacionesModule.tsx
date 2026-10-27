import { Workbench } from '../components/ui/Workspace';
import { useMemo } from 'react';
import { analyzeSubspaces, composeLab, m2Latex, type Lab2DParams } from '../core/transformations';
import { parseGrid } from '../core/matrix';
import { DEFAULTS, useExercise, type ModuleProps } from '../core/exercise';
import { MatrixGrid } from '../components/math/MatrixGrid';
import { StepAccordion } from '../components/math/StepAccordion';
import { TransformCanvas2D } from '../components/visuals/TransformCanvas2D';
import { Latex } from '../components/math/Latex';
import { EmptyResult, ModuleHeading, Note, Result, Tabs } from '../components/ui/Workspace';
const SLIDERS: {
  key: keyof Omit<Lab2DParams, 'reflect'>;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
}[] = [
  { key: 'angle', label: 'Rotación', min: -180, max: 180, step: 1, unit: '°' },
  { key: 'scaleX', label: 'Escala horizontal', min: 0, max: 3, step: 0.1 },
  { key: 'scaleY', label: 'Escala vertical', min: 0, max: 3, step: 0.1 },
  { key: 'shearX', label: 'Cizallamiento horizontal', min: -2, max: 2, step: 0.1 },
  { key: 'shearY', label: 'Cizallamiento vertical', min: -2, max: 2, step: 0.1 },
];
export function TransformacionesModule(props: ModuleProps) {
  const [s, update] = useExercise('transformaciones', props);
  const { matrix: a } = useMemo(() => parseGrid(s.tfGrid), [s.tfGrid]);
  const result = useMemo(() => (a ? analyzeSubspaces(a) : null), [a]);
  const lab = useMemo(() => composeLab(s.labParams), [s.labParams]);
  return (
    <div>
      <ModuleHeading chapter="Capítulo 03" title="Transformaciones lineales">
        Descubre qué conserva una transformación y qué cambia en el espacio.
      </ModuleHeading>
      <Tabs
        value={s.tab}
        onChange={(tab) => update({ tab })}
        items={[
          { id: 'subespacios', label: 'Núcleo e imagen' },
          { id: 'lab', label: 'Laboratorio 2D' },
        ]}
      />
      <Workbench>
        <aside className="editor-panel">
          <div className="panel-heading">
            <h2>{s.tab === 'lab' ? 'Transforma el plano' : 'Matriz de la transformación'}</h2>
            <button
              type="button"
              className="text-button"
              onClick={() => update({ ...DEFAULTS.transformaciones, tab: s.tab })}
            >
              Restablecer
            </button>
          </div>
          {s.tab === 'subespacios' ? (
            <>
              <MatrixGrid
                grid={s.tfGrid}
                onChange={(tfGrid) => update({ tfGrid })}
                label="Transformación A"
                presets={[
                  { label: 'De R³ a R²', values: DEFAULTS.transformaciones.tfGrid },
                  {
                    label: 'Proyección en el eje x',
                    values: [
                      ['1', '0'],
                      ['0', '0'],
                    ],
                  },
                ]}
              />
              <Note>
                Las columnas indican la dimensión del dominio; las filas, la dimensión del
                codominio.
              </Note>
            </>
          ) : (
            <>
              <div className="slider-list">
                {SLIDERS.map((control) => (
                  <label key={control.key} className="slider-control">
                    <span>
                      {control.label}
                      <output>
                        {s.labParams[control.key]}
                        {control.unit}
                      </output>
                    </span>
                    <input
                      type="range"
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      value={s.labParams[control.key]}
                      onChange={(e) =>
                        update({
                          labParams: { ...s.labParams, [control.key]: Number(e.target.value) },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
              <label className="checkbox-control">
                <input
                  type="checkbox"
                  checked={s.labParams.reflect}
                  onChange={(e) =>
                    update({ labParams: { ...s.labParams, reflect: e.target.checked } })
                  }
                />
                Reflejar respecto al eje x
              </label>
              <Note>
                Se aplica reflexión → escala → cizallamiento → rotación. La vista y la matriz
                compuesta usan aproximaciones numéricas.
              </Note>
            </>
          )}
        </aside>
        <div className="results-column">
          {s.tab === 'lab' ? (
            <>
              <div className="visual-heading">
                <h2>El cuadrado, antes y después</h2>
                <span>Arrastra los controles</span>
              </div>
              <TransformCanvas2D
                matrix={lab.T}
                range={Math.ceil(
                  Math.max(4, ...lab.T.map((row) => row.reduce((acc, v) => acc + Math.abs(v), 0))) *
                    1.2,
                )}
              />
              <Result
                label="Transformación compuesta"
                math={`T = R \\cdot Sh \\cdot S \\cdot Ref = ${m2Latex(lab.T)}`}
              >
                <p>
                  Factor de área: <strong>{Number(lab.det.toFixed(4))}</strong>
                  {Math.abs(lab.det) < 1e-10
                    ? ' · El plano colapsa en una dimensión menor.'
                    : lab.det < 0
                      ? ' · La orientación se invierte.'
                      : ' · La orientación se conserva.'}
                </p>
              </Result>
              <details className="formula-details">
                <summary>Ver las matrices individuales</summary>
                {[
                  ['R', lab.R],
                  ['Sh', lab.Sh],
                  ['S', lab.S],
                  ['Ref', lab.Ref],
                ].map(([name, m]) => (
                  <Latex
                    key={String(name)}
                    math={`${name} = ${m2Latex(m as typeof lab.T)}`}
                    block
                  />
                ))}
              </details>
            </>
          ) : result ? (
            <>
              <Result
                label="Rango y nulidad"
                math={`\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = ${result.nullity} + ${result.rank} = ${result.domainDim}`}
              >
                <div className="result-metrics">
                  <span>
                    Núcleo <strong>{result.nullity}</strong>
                  </span>
                  <span>
                    Imagen <strong>{result.rank}</strong>
                  </span>
                  <span>
                    Dominio <strong>R{['⁰', '¹', '²', '³', '⁴', '⁵'][result.domainDim]}</strong>
                  </span>
                </div>
              </Result>
              <StepAccordion steps={result.summary} title="Las bases y su interpretación" />
              <StepAccordion
                steps={result.homogeneous.steps}
                title="Resuelve el sistema homogéneo"
              />
            </>
          ) : (
            <EmptyResult />
          )}
        </div>
      </Workbench>
    </div>
  );
}
