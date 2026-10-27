// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createReport } from '../src/components/export/exportPdf';
import { paginateBlocks } from '../src/components/export/pagination';
import { DEFAULTS } from '../src/core/exercise';
import { MatricesModule } from '../src/modules/MatricesModule';
import { VectoresModule } from '../src/modules/VectoresModule';
import { TransformacionesModule } from '../src/modules/TransformacionesModule';
import { DiagonalizacionModule } from '../src/modules/DiagonalizacionModule';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
let root: Root;
let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});
function mount(module: typeof MatricesModule, state: unknown) {
  act(() => root.render(createElement(module, { initialState: state, onStateChange: () => {} })));
  return container.querySelector<HTMLElement>('.workbench-shell')!;
}

describe('Documento de ejercicios', () => {
  it('incluye la matriz actual, la operación y los pasos cerrados sin modificar el editor', () => {
    const wb = mount(MatricesModule, {
      ...DEFAULTS.matrices,
      tab: 'operaciones',
      operation: 'gauss',
      matrixGrid: [
        ['1/2', '2'],
        ['3', '4'],
      ],
    });
    const before = wb.querySelectorAll('.step-body').length;
    const { report } = createReport(wb);
    expect(report.textContent).toContain('Reducción de Gauss-Jordan');
    expect(report.querySelector('td')?.textContent).toBe('1/2');
    const expectedSteps = JSON.parse(
      wb.querySelector('.procedure')!.getAttribute('data-pdf-steps')!,
    );
    expect(before).toBeLessThan(expectedSteps.length);
    expect(report.textContent).toContain(`${expectedSteps.length}.`);
    expect(wb.querySelectorAll('.step-body')).toHaveLength(before);
    expect(report.querySelectorAll('input, button, .katex-mathml, [id]')).toHaveLength(0);
    expect(report.textContent).not.toContain('Restablecer');
  });
  it('identifica la columna independiente de un sistema y conserva su clasificación', () => {
    const wb = mount(MatricesModule, {
      ...DEFAULTS.matrices,
      tab: 'sel',
      selGrid: [
        ['1', '1', '1'],
        ['1', '1', '2'],
      ],
    });
    const { report } = createReport(wb);
    expect(report.querySelectorAll('.augmented-cell')).toHaveLength(2);
    expect(report.textContent).toContain('El sistema no tiene solución');
    expect(report.textContent).toContain('contradicción');
  });
  it('exporta las dos explicaciones de recta y plano con sus datos', () => {
    const { report } = createReport(
      mount(VectoresModule, {
        ...DEFAULTS.vectores,
        tab: 'rectas',
        p0: ['1', '2', '3'],
        d: ['4', '5', '6'],
      }),
    );
    expect(report.textContent).toContain('Punto P₀: (1, 2, 3)');
    expect(report.textContent).toContain('Ecuaciones de la recta');
    expect(report.textContent).toContain('Ecuación del plano');
  });
  it('incluye las bases y la reducción de una transformación', () => {
    const { report } = createReport(mount(TransformacionesModule, DEFAULTS.transformaciones));
    expect(report.textContent).toContain('Las bases y su interpretación');
    expect(report.textContent).toContain('Resuelve el sistema homogéneo');
  });
  it('conserva las limitaciones y aproximaciones de la diagonalización irracional', () => {
    const { report } = createReport(
      mount(DiagonalizacionModule, {
        grid: [
          ['1', '1'],
          ['1', '0'],
        ],
      }),
    );
    expect(report.textContent).toContain('Aproximaciones numéricas');
    expect(report.textContent).toContain('no implica por sí sola');
    expect(report.textContent).toContain('Ecuación característica');
  });
  it('rechaza celdas inválidas y operaciones que todavía no tienen resultado', () => {
    expect(() =>
      createReport(
        mount(MatricesModule, {
          ...DEFAULTS.matrices,
          matrixGrid: [
            ['x', '1'],
            ['2', '3'],
          ],
        }),
      ),
    ).toThrow('Completa los datos');
    expect(() =>
      createReport(
        mount(MatricesModule, {
          ...DEFAULTS.matrices,
          operation: 'det',
          matrixGrid: [
            ['1', '2', '3'],
            ['4', '5', '6'],
          ],
        }),
      ),
    ).toThrow('Completa los datos');
  });
});

describe('Paginación del PDF', () => {
  it('mantiene los encabezados con su contenido, incluido el espacio entre bloques', () => {
    const plan = paginateBlocks([
      { height: 225 },
      { height: 8, keepWithNext: true },
      { height: 12 },
    ]);
    expect(plan.map((block) => block.page)).toEqual([1, 2, 2]);
  });
  it('mantiene cadenas de encabezados junto al primer párrafo', () => {
    const plan = paginateBlocks([
      { height: 210 },
      { height: 10, keepWithNext: true },
      { height: 10, keepWithNext: true },
      { height: 20 },
    ]);
    expect(plan.map((block) => block.page)).toEqual([1, 2, 2, 2]);
  });
  it('ajusta un bloque demasiado alto y respeta encabezado y pie en todas las páginas', () => {
    const plan = paginateBlocks([
      { height: 700 },
      ...Array.from({ length: 50 }, () => ({ height: 37 })),
    ]);
    expect(plan[0].height).toBe(250);
    for (const [index, block] of plan.entries()) {
      expect(block.y).toBeGreaterThanOrEqual(28);
      expect(block.y + block.height).toBeLessThanOrEqual(278);
      if (index && plan[index - 1].page === block.page) {
        expect(block.y).toBeGreaterThanOrEqual(plan[index - 1].y + plan[index - 1].height + 3);
      }
    }
  });
});
