import katex from 'katex';
import type { Step } from '../../core/types';
import { paginateBlocks } from './pagination';

const WIDTH = 680;
const STYLES = `
.pdf-report { position: fixed; left: -10000px; top: 0; width: ${WIDTH}px; background: #fff; color: #172b3d; font: 16px/1.55 Arial, sans-serif; }
.pdf-report .pdf-block { width: 100%; padding: 5px 0; margin: 0; background: #fff; box-sizing: border-box; }
.pdf-report h2 { font-size: 22px; line-height: 1.3; font-weight: 700; margin: 0; }
.pdf-report h3 { font-size: 17px; line-height: 1.4; font-weight: 700; margin: 0; }
.pdf-report p, .pdf-report ul { font-size: 16px; line-height: 1.55; margin: 0; color: #172b3d; }
.pdf-report .math-block { display: block; padding: 6px 0; margin: 0; overflow: visible; color: #172b3d; font-size: 16px; }
.pdf-report .katex-display { margin: 0; overflow: visible; }
.pdf-report .katex-display > .katex, .pdf-report .katex-display > .katex > .katex-html { display: inline-block; }
.pdf-report .katex { color: #172b3d; }
.pdf-report table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 16px; }
.pdf-report td, .pdf-report th { border: 1px solid #bcc8cf; padding: 10px 6px; text-align: center; overflow-wrap: anywhere; }
.pdf-report .augmented-cell { border-left: 3px solid #406179; }
.pdf-report img { display: block; max-width: 400px; width: 100%; height: auto; margin: auto; }
.pdf-report .pdf-muted { color: #506575; font-size: 14px; }
`;

function textElement(tag: string, text: string) {
  const el = document.createElement(tag);
  el.textContent = text;
  return el;
}

function inlineMath(text: string) {
  const p = document.createElement('p');
  for (const part of text.split(/(\$[^$]+\$)/g)) {
    if (part.startsWith('$') && part.endsWith('$')) {
      const span = document.createElement('span');
      span.innerHTML = katex.renderToString(part.slice(1, -1), {
        throwOnError: false,
        output: 'html',
      });
      p.append(span);
    } else p.append(document.createTextNode(part));
  }
  return p;
}

function mathBlock(math: string) {
  const el = document.createElement('div');
  el.className = 'math-block';
  el.innerHTML = katex.renderToString(math, {
    displayMode: true,
    throwOnError: false,
    output: 'html',
  });
  return el;
}

function cleanClone(source: Element) {
  const clone = source.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll('button, .katex-mathml, .step-toggle, .status-dot')
    .forEach((el) => el.remove());
  [clone, ...clone.querySelectorAll('[id]')].forEach((el) => el.removeAttribute('id'));
  return clone;
}

export function createReport(workbench: HTMLElement) {
  const results = workbench.querySelector('.results-column');
  if (
    !results ||
    workbench.querySelector('[aria-invalid="true"], .empty-result') ||
    !results.querySelector('.result-panel, .procedure, canvas')
  ) {
    throw new Error('Completa los datos y obtén un resultado antes de descargar el PDF.');
  }
  const module = workbench.parentElement!;
  const title = module.querySelector('h1')?.textContent?.trim() ?? 'Ejercicio';
  const topic = module.querySelector('.workspace-tabs [aria-pressed="true"]')?.textContent?.trim();
  const report = document.createElement('div');
  report.className = 'pdf-report';
  report.setAttribute('aria-hidden', 'true');
  report.inert = true;
  const style = document.createElement('style');
  style.textContent = STYLES;
  report.append(style);
  const append = (el: HTMLElement, keep = false) => {
    el.classList.add('pdf-block');
    if (keep) el.dataset.keep = 'true';
    report.append(el);
  };
  append(textElement('h2', title), true);
  if (topic) append(textElement('p', topic), true);
  const date = textElement('p', `Generado el ${new Date().toLocaleString('es-MX')}`);
  date.className = 'pdf-muted';
  append(date);
  append(textElement('h3', 'Datos del ejercicio'), true);
  const editor = workbench.querySelector('.editor-panel')!;
  const label = editor.querySelector('h2')?.textContent;
  if (label) append(textElement('p', label), true);
  editor.querySelectorAll('.control-label select').forEach((select) => {
    append(textElement('p', (select as HTMLSelectElement).selectedOptions[0].textContent ?? ''));
  });
  editor.querySelectorAll('.matrix-table').forEach((source) => {
    const table = document.createElement('table');
    const caption = source.querySelector('caption')?.textContent;
    if (caption) append(textElement('p', caption), true);
    source.querySelectorAll('tr').forEach((row) => {
      const tr = document.createElement('tr');
      row.querySelectorAll('td').forEach((cell) => {
        const td = textElement('td', cell.querySelector('input')?.value ?? '');
        if (cell.classList.contains('augmented-cell')) td.className = 'augmented-cell';
        tr.append(td);
      });
      table.append(tr);
    });
    const block = document.createElement('div');
    block.append(table);
    append(block);
  });
  editor.querySelectorAll('.vector-input').forEach((fieldset) => {
    const values = Array.from(fieldset.querySelectorAll('input')).map((input) => input.value);
    append(
      textElement('p', `${fieldset.querySelector('legend')?.textContent}: (${values.join(', ')})`),
    );
  });
  editor.querySelectorAll('.slider-control').forEach((label) => {
    const span = label.querySelector('span')!;
    const clone = span.cloneNode(true) as HTMLElement;
    clone.querySelector('output')?.remove();
    append(
      textElement(
        'p',
        `${clone.textContent?.trim()}: ${label.querySelector('output')?.textContent}`,
      ),
    );
  });
  editor.querySelectorAll('.checkbox-control').forEach((label) => {
    append(
      textElement(
        'p',
        `${label.textContent?.trim()}: ${label.querySelector('input')?.checked ? 'Sí' : 'No'}`,
      ),
    );
  });
  editor.querySelectorAll('.workspace-note').forEach((note) => append(cleanClone(note)));
  append(textElement('h3', 'Resultado y procedimiento'), true);

  const collect = (el: Element) => {
    if (el.matches('button, .procedure-caption, .viewport-controls-hint, .viewport-controls'))
      return;
    if (el.matches('.procedure')) {
      append(textElement('h3', el.querySelector('h2')?.textContent ?? 'Procedimiento'), true);
      const steps: Step[] = JSON.parse(el.getAttribute('data-pdf-steps') ?? '[]');
      steps.forEach((step, i) => {
        const heading = inlineMath(`${i + 1}. ${step.title}`);
        heading.style.fontWeight = '700';
        append(heading, !!(step.detail || step.math?.length));
        if (step.detail) append(inlineMath(step.detail), !!step.math?.length);
        step.math?.forEach((expr) => append(mathBlock(expr)));
      });
      return;
    }
    if (el.matches('canvas')) {
      if (el.closest('.viewport-container')) {
        append(
          textElement(
            'p',
            'La escena 3D se explora desde el enlace del ejercicio incluido en este PDF.',
          ),
        );
      } else {
        const img = document.createElement('img');
        img.src = (el as HTMLCanvasElement).toDataURL('image/png');
        const block = document.createElement('div');
        block.append(img);
        append(block);
        append(textElement('p', el.getAttribute('aria-label') ?? 'Transformación en el plano'));
      }
      return;
    }
    if (el.matches('.math-block, p, ul')) {
      append(cleanClone(el));
      return;
    }
    if (el.matches('h2, h3, summary, .result-label')) {
      append(textElement('h3', el.textContent?.trim() ?? ''), true);
      return;
    }
    if (el.matches('.result-metrics')) {
      append(
        textElement(
          'p',
          Array.from(el.children)
            .map((child) => child.textContent?.trim())
            .join(' · '),
        ),
      );
      return;
    }
    if (el.matches('.eigen-values > div')) {
      const p = document.createElement('p');
      p.innerHTML = cleanClone(el).innerHTML;
      append(p);
      return;
    }
    Array.from(el.children).forEach(collect);
  };
  Array.from(results.children).forEach(collect);
  append(
    textElement(
      'p',
      'Material de apoyo educativo. Las aproximaciones se identifican en el procedimiento.',
    ),
  );
  return { report, title, topic, url: location.href };
}

export async function exportExercisePdf(
  workbench: HTMLElement,
  onProgress?: (percent: number) => void,
) {
  const { report, title, topic, url } = createReport(workbench);
  document.body.append(report);
  try {
    const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
      import('jspdf'),
      import('html2canvas'),
    ]);
    await document.fonts.ready;
    await Promise.all(Array.from(report.querySelectorAll('img')).map((img) => img.decode()));
    report.querySelectorAll<HTMLElement>('.katex-display').forEach((el) => {
      const mathWidth =
        el.querySelector('.katex-html')?.getBoundingClientRect().width ?? el.scrollWidth;
      if (mathWidth > WIDTH - 8) el.style.fontSize = `${((WIDTH - 8) / mathWidth) * 100}%`;
    });
    const blocks = Array.from(report.querySelectorAll<HTMLElement>(':scope > .pdf-block'));
    const plan = paginateBlocks(
      blocks.map((el) => ({
        height: (el.getBoundingClientRect().height * 180) / WIDTH,
        keepWithNext: el.dataset.keep === 'true',
      })),
    );
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
    pdf.setProperties({
      title: `LinearPy - ${title}`,
      subject: topic ?? 'Ejercicio resuelto',
      author: 'LinearPy',
      creator: 'LinearPy',
    });
    for (const [index, block] of blocks.entries()) {
      const placement = plan[index];
      while (pdf.getNumberOfPages() < placement.page) pdf.addPage();
      pdf.setPage(placement.page);
      const canvas = await html2canvas(block, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 1200,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (el) =>
          el.id === 'root' ||
          (el.classList.contains('pdf-block') && el !== block) ||
          (el.classList.contains('pdf-report') && el !== report),
      });
      const width = Math.min(180, (placement.height * canvas.width) / canvas.height);
      pdf.addImage(canvas, 'PNG', 15, placement.y, width, placement.height, undefined, 'FAST');
      canvas.width = canvas.height = 0;
      onProgress?.(Math.round(((index + 1) / blocks.length) * 100));
    }
    const total = pdf.getNumberOfPages();
    for (let page = 1; page <= total; page++) {
      pdf.setPage(page);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(23, 43, 61);
      pdf.text('LinearPy / Cuaderno de trabajo', 15, 15);
      pdf.setDrawColor(200, 210, 217);
      pdf.line(15, 20, 195, 20);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.textWithLink('Volver al ejercicio', 15, 289, { url });
      pdf.text(`${page} / ${total}`, 195, 289, { align: 'right' });
    }
    const slug = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    return {
      blob: pdf.output('blob'),
      filename: `linearpy-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`,
    };
  } finally {
    report.remove();
  }
}
