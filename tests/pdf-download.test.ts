// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest';
import type { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { exportExercisePdf } from '../src/components/export/exportPdf';

const state = vi.hoisted(() => ({ pdf: null as jsPDF | null }));
vi.mock('jspdf', async (loadOriginal) => {
  const original = await loadOriginal<typeof import('jspdf')>();
  return {
    jsPDF: function (...args: ConstructorParameters<typeof original.jsPDF>) {
      const pdf = new original.jsPDF(...args);
      state.pdf = pdf;
      return pdf;
    },
  };
});
vi.mock('html2canvas', () => ({ default: vi.fn() }));
afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});
function fixture() {
  document.body.innerHTML =
    '<div><h1>Matrices</h1><div class="workbench-shell"><aside class="editor-panel"><h2>Matriz A</h2></aside><div class="results-column"><section class="result-panel"><p>Resultado exacto</p></section></div></div></div>';
  Object.defineProperty(document, 'fonts', {
    configurable: true,
    value: { ready: Promise.resolve() },
  });
  return document.querySelector<HTMLElement>('.workbench-shell')!;
}

it('genera un PDF A4 con metadatos, enlace al ejercicio y descarga, y limpia el documento temporal', async () => {
  const workbench = fixture();
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    width: 680,
    height: 50,
    x: 0,
    y: 0,
    top: 0,
    right: 680,
    bottom: 50,
    left: 0,
    toJSON: () => ({}),
  });
  vi.mocked(html2canvas).mockImplementation(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 680;
    canvas.height = 50;
    canvas.toDataURL = () =>
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC';
    return canvas;
  });
  const progress: number[] = [];
  const file = await exportExercisePdf(workbench, (percent) => progress.push(percent));
  expect(file.filename).toMatch(/^linearpy-matrices-\d{4}-\d{2}-\d{2}\.pdf$/);
  expect(file.blob.type).toBe('application/pdf');
  expect(file.blob.size).toBeGreaterThan(500);
  expect(state.pdf!.internal.pageSize.getWidth()).toBeCloseTo(210, 1);
  expect(state.pdf!.internal.pageSize.getHeight()).toBeCloseTo(297, 1);
  const bytes = new TextDecoder().decode(state.pdf!.output('arraybuffer'));
  expect(bytes).toMatch(/^%PDF-/);
  expect(bytes).toContain('/Subtype /Link');
  expect(bytes).toContain(location.href);
  expect(progress[progress.length - 1]).toBe(100);
  expect(document.querySelector('.pdf-report')).toBeNull();
});

it('elimina el documento temporal si falla el renderizado, permitiendo volver a exportar', async () => {
  vi.mocked(html2canvas).mockRejectedValueOnce(new Error('Error de captura'));
  await expect(exportExercisePdf(fixture())).rejects.toThrow('Error de captura');
  expect(document.querySelector('.pdf-report')).toBeNull();
});
