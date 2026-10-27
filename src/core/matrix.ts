import { Rational } from './rational';
import type { Ring, Step } from './types';

/**
 * Matrices con entradas racionales y los procedimientos del capítulo 2:
 * Gauss-Jordan con registro de operaciones elementales, determinante por cofactores,
 * inversa por la adjunta, rango, núcleo y espacio columna.
 */
export type Matrix = Rational[][];

/** Anillo de los racionales, para usar las funciones genéricas con matrices numéricas. */
export const RationalRing: Ring<Rational> = {
  zero: Rational.ZERO,
  one: Rational.ONE,
  add: (a, b) => a.add(b),
  sub: (a, b) => a.sub(b),
  mul: (a, b) => a.mul(b),
  neg: (a) => a.neg(),
  isZero: (a) => a.isZero(),
  latex: (a) => a.toLatex(),
  latexParen: (a) => a.toLatexParen(),
};

// Utilidades básicas

export const rows = (m: unknown[][]): number => m.length;
export const cols = (m: unknown[][]): number => (m.length ? m[0].length : 0);

export function clone<T>(m: T[][]): T[][] {
  return m.map((r) => [...r]);
}

export function identity(n: number): Matrix {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? Rational.ONE : Rational.ZERO)),
  );
}

export function zeros(m: number, n: number): Matrix {
  return Array.from({ length: m }, () => Array.from({ length: n }, () => Rational.ZERO));
}

export function transpose<T>(m: T[][]): T[][] {
  return m[0].map((_, j) => m.map((r) => r[j]));
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  return a.map((row) =>
    b[0].map((_, j) => row.reduce((acc, v, k) => acc.add(v.mul(b[k][j])), Rational.ZERO)),
  );
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => row.map((v, j) => v.sub(b[i][j])));
}

export function scale(m: Matrix, k: Rational): Matrix {
  return m.map((row) => row.map((v) => v.mul(k)));
}

export function equals(a: Matrix, b: Matrix): boolean {
  return (
    a.length === b.length &&
    a.every((row, i) => row.length === b[i].length && row.every((v, j) => v.equals(b[i][j])))
  );
}

/** Agrega columnas a la derecha, por ejemplo para formar [A | b]. */
export function hconcat(a: Matrix, b: Matrix): Matrix {
  return a.map((row, i) => [...row, ...b[i]]);
}

export function column(m: Matrix, j: number): Matrix {
  return m.map((r) => [r[j]]);
}

/** Submatriz que resulta de eliminar la fila i y la columna j. */
export function minor<T>(m: T[][], i: number, j: number): T[][] {
  return m.filter((_, r) => r !== i).map((row) => row.filter((_, c) => c !== j));
}

/** Convierte una cuadrícula de textos en matriz. Devuelve también las celdas inválidas. */
export function parseGrid(grid: string[][]): {
  matrix: Matrix | null;
  invalid: [number, number][];
} {
  const invalid: [number, number][] = [];
  const matrix = grid.map((row, i) =>
    row.map((text, j) => {
      const r = Rational.parse(text);
      if (!r) invalid.push([i, j]);
      return r ?? Rational.ZERO;
    }),
  );
  return { matrix: invalid.length ? null : matrix, invalid };
}

// Representación en LaTeX

export interface LatexOptions {
  /** Número de columnas a la derecha de la barra vertical (matriz aumentada). */
  augment?: number;
  /** Fila resaltada, normalmente la que acaba de modificarse. */
  highlightRow?: number;
  /** Celda del pivote, se pinta en naranja. */
  pivot?: [number, number];
}

/** Colores de resaltado; coinciden con los tokens de la hoja de estilos. */
export const HIGHLIGHT = {
  pivot: '#f18c06',
  row: '#003b5d',
};

export function matrixLatex<T>(
  m: T[][],
  toLatex: (v: T) => string,
  opts: LatexOptions = {},
): string {
  const n = cols(m);
  const augment = opts.augment ?? 0;
  const spec = 'c'.repeat(n - augment) + (augment ? '|' + 'c'.repeat(augment) : '');
  const body = m
    .map((row, i) =>
      row
        .map((v, j) => {
          const tex = toLatex(v);
          if (opts.pivot && opts.pivot[0] === i && opts.pivot[1] === j) {
            return `\\colorbox{${HIGHLIGHT.pivot}}{$\\color{white}${tex}$}`;
          }
          if (opts.highlightRow === i) return `\\textcolor{${HIGHLIGHT.row}}{\\boldsymbol{${tex}}}`;
          return tex;
        })
        .join(' & '),
    )
    .join(' \\\\ ');
  return `\\left(\\begin{array}{${spec}}${body}\\end{array}\\right)`;
}

export const ratLatex = (m: Matrix, opts?: LatexOptions): string =>
  matrixLatex(m, (v) => v.toLatex(), opts);

/** Vector columna en LaTeX. */
export function vectorLatex(v: Rational[]): string {
  return `\\begin{pmatrix} ${v.map((x) => x.toLatex()).join(' \\\\ ')} \\end{pmatrix}`;
}

// Gauss-Jordan

export interface GaussJordanStep extends Step {
  matrix: Matrix;
  pivot?: [number, number];
  row?: number;
}

export interface GaussJordanResult {
  steps: GaussJordanStep[];
  rref: Matrix;
  /** Índices (desde 0) de las columnas pivote. */
  pivots: number[];
}

/**
 * Reduce una matriz a su forma escalonada reducida (RREF) registrando cada operación.
 *
 * Solo se buscan pivotes en las columnas de coeficientes; las columnas aumentadas
 * (por ejemplo el vector b) se transforman pero nunca contienen pivotes.
 */
export function gaussJordan(input: Matrix, augment = 0): GaussJordanResult {
  const a = clone(input);
  const m = rows(a);
  const n = cols(a);
  const pivotCols = n - augment;
  const pivots: number[] = [];
  const steps: GaussJordanStep[] = [{ title: 'Matriz inicial', matrix: clone(a) }];

  const latex = (opts: LatexOptions) => ratLatex(a, { augment, ...opts });

  let r = 0;
  for (let c = 0; c < pivotCols && r < m; c++) {
    // Buscamos el primer renglón con entrada distinta de cero en esta columna
    let p = -1;
    for (let i = r; i < m; i++) {
      if (!a[i][c].isZero()) {
        p = i;
        break;
      }
    }
    if (p === -1) continue;

    if (p !== r) {
      [a[r], a[p]] = [a[p], a[r]];
      steps.push({
        title: `Intercambiamos la fila ${r + 1} con la fila ${p + 1}`,
        detail: 'Así colocamos una entrada distinta de cero en la posición del pivote.',
        math: [`R_{${r + 1}} \\leftrightarrow R_{${p + 1}}`, latex({ pivot: [r, c] })],
        matrix: clone(a),
        pivot: [r, c],
        row: r,
      });
    }

    const pv = a[r][c];
    if (!pv.isOne()) {
      const k = pv.inv();
      a[r] = a[r].map((v) => v.mul(k));
      steps.push({
        title: `Convertimos el pivote de la fila ${r + 1} en 1`,
        detail: `Multiplicamos toda la fila por el recíproco del pivote.`,
        math: [
          `R_{${r + 1}} \\leftarrow ${k.toLatexParen()} \\cdot R_{${r + 1}}`,
          latex({ pivot: [r, c], highlightRow: r }),
        ],
        matrix: clone(a),
        pivot: [r, c],
        row: r,
      });
    }

    for (let i = 0; i < m; i++) {
      if (i === r || a[i][c].isZero()) continue;
      const factor = a[i][c].neg();
      a[i] = a[i].map((v, j) => v.add(factor.mul(a[r][j])));
      steps.push({
        title: `Hacemos cero la entrada de la fila ${i + 1}, columna ${c + 1}`,
        detail: `Sumamos a la fila ${i + 1} la fila ${r + 1} multiplicada por ${factor.toString()}.`,
        math: [
          `R_{${i + 1}} \\leftarrow R_{${i + 1}} + ${factor.toLatexParen()} \\cdot R_{${r + 1}}`,
          latex({ pivot: [r, c], highlightRow: i }),
        ],
        matrix: clone(a),
        pivot: [r, c],
        row: i,
      });
    }

    pivots.push(c);
    r++;
  }

  // El primer paso solo muestra la matriz inicial
  steps[0].math = [ratLatex(input, { augment })];
  return { steps, rref: a, pivots };
}

export function rank(m: Matrix): number {
  return gaussJordan(m).pivots.length;
}

// Determinante

/** Determinante genérico por expansión de cofactores sobre la primera fila. */
export function detGeneric<T>(m: T[][], ring: Ring<T>): T {
  const n = m.length;
  if (n === 0) return ring.one;
  if (n === 1) return m[0][0];
  if (n === 2) return ring.sub(ring.mul(m[0][0], m[1][1]), ring.mul(m[0][1], m[1][0]));
  let acc = ring.zero;
  for (let j = 0; j < n; j++) {
    if (ring.isZero(m[0][j])) continue;
    const term = ring.mul(m[0][j], detGeneric(minor(m, 0, j), ring));
    acc = j % 2 === 0 ? ring.add(acc, term) : ring.sub(acc, term);
  }
  return acc;
}

/** Determinante rápido por eliminación, para verificaciones internas. */
export function determinant(input: Matrix): Rational {
  const a = clone(input);
  const n = rows(a);
  let det = Rational.ONE;
  for (let c = 0; c < n; c++) {
    let p = c;
    while (p < n && a[p][c].isZero()) p++;
    if (p === n) return Rational.ZERO;
    if (p !== c) {
      [a[p], a[c]] = [a[c], a[p]];
      det = det.neg();
    }
    det = det.mul(a[c][c]);
    for (let i = c + 1; i < n; i++) {
      const f = a[i][c].div(a[c][c]);
      a[i] = a[i].map((v, j) => v.sub(f.mul(a[c][j])));
    }
  }
  return det;
}

/**
 * Procedimiento del determinante por cofactores, en el mismo estilo que se enseña en clase.
 * Funciona para matrices numéricas y para A - λI.
 */
export function determinantSteps<T>(m: T[][], ring: Ring<T>): { steps: Step[]; value: T } {
  const n = m.length;
  const L = ring.latex;
  const P = ring.latexParen;
  const mat = (x: T[][]) =>
    matrixLatex(x, L).replace('\\left(', '\\left|').replace('\\right)', '\\right|');
  const steps: Step[] = [];

  if (n === 1) {
    return {
      steps: [
        {
          title: 'Una matriz 1×1 tiene como determinante su única entrada',
          math: [`\\det = ${L(m[0][0])}`],
        },
      ],
      value: m[0][0],
    };
  }

  if (n === 2) {
    const [[a, b], [c, d]] = m;
    const ad = ring.mul(a, d);
    const bc = ring.mul(b, c);
    const value = ring.sub(ad, bc);
    steps.push({
      title: 'Fórmula para matrices de 2×2',
      detail: 'Producto de la diagonal principal menos producto de la diagonal secundaria.',
      math: [
        '\\det = a_{11}a_{22} - a_{12}a_{21}',
        `\\det = ${P(a)}${P(d)} - ${P(b)}${P(c)}`,
        `\\det = ${P(ad)} - ${P(bc)} = ${L(value)}`,
      ],
    });
    return { steps, value };
  }

  steps.push({
    title: 'Expansión por cofactores sobre la primera fila',
    detail:
      'Cada entrada de la primera fila se multiplica por el determinante de la submatriz que queda al quitar su fila y su columna, alternando signos.',
    math: [`\\det(A) = \\sum_{j=1}^{${n}} (-1)^{1+j}\\, a_{1j} \\det(M_{1j})`],
  });

  const terms = m[0].map((entry, j) => {
    const sub = minor(m, 0, j);
    return { j, entry, sub, subDet: detGeneric(sub, ring) };
  });

  const expansion = terms
    .map(({ j, entry, sub }) => `${j === 0 ? '' : j % 2 === 0 ? '+' : '-'} ${P(entry)} ${mat(sub)}`)
    .join(' ');
  steps.push({
    title: 'Sustituimos las entradas y las submatrices menores',
    math: [`\\det(A) = ${expansion}`],
  });

  steps.push({
    title: `Calculamos los determinantes de las submatrices de ${n - 1}×${n - 1}`,
    detail: n - 1 > 2 ? 'Cada uno se obtiene a su vez por cofactores.' : undefined,
    math: terms.map(({ j, subDet }) => `\\det(M_{1${j + 1}}) = ${L(subDet)}`),
  });

  let value = ring.zero;
  const products = terms.map(({ j, entry, subDet }) => {
    const t = ring.mul(entry, subDet);
    value = j % 2 === 0 ? ring.add(value, t) : ring.sub(value, t);
    return `${j === 0 ? '' : j % 2 === 0 ? '+' : '-'} ${P(entry)}${P(subDet)}`;
  });
  steps.push({
    title: 'Sumamos los términos con su signo',
    math: [`\\det(A) = ${products.join(' ')}`, `\\det(A) = ${L(value)}`],
    tone: 'result',
  });

  return { steps, value };
}

// Inversa por la adjunta

export function cofactorMatrix(m: Matrix): Matrix {
  return m.map((row, i) =>
    row.map((_, j) => {
      const d = detGeneric(minor(m, i, j), RationalRing);
      return (i + j) % 2 === 0 ? d : d.neg();
    }),
  );
}

export function inverse(m: Matrix): Matrix | null {
  const det = determinant(m);
  if (det.isZero()) return null;
  return scale(transpose(cofactorMatrix(m)), det.inv());
}

export function inverseSteps(m: Matrix): { steps: Step[]; inverse: Matrix | null } {
  const det = determinant(m);
  if (det.isZero()) {
    return {
      steps: [
        {
          title: 'La matriz no es invertible',
          detail: 'Su determinante es cero, así que no existe la inversa.',
          tone: 'warning',
        },
      ],
      inverse: null,
    };
  }
  const cof = cofactorMatrix(m);
  const adj = transpose(cof);
  const inv = scale(adj, det.inv());
  const steps: Step[] = [
    {
      title: 'Fórmula de la inversa por la adjunta',
      math: [
        'A^{-1} = \\frac{1}{\\det(A)}\\,\\operatorname{Adj}(A)',
        `\\det(A) = ${det.toLatex()}`,
      ],
    },
    {
      title: 'Matriz de cofactores',
      detail: 'Cada entrada es $C_{ij} = (-1)^{i+j}\\det(M_{ij})$.',
      math: [`C = ${ratLatex(cof)}`],
    },
    {
      title: 'Matriz adjunta',
      detail: 'Es la transpuesta de la matriz de cofactores.',
      math: [`\\operatorname{Adj}(A) = C^{T} = ${ratLatex(adj)}`],
    },
    {
      title: 'Dividimos la adjunta entre el determinante',
      math: [`A^{-1} = \\frac{1}{${det.toLatex()}}${ratLatex(adj)} = ${ratLatex(inv)}`],
      tone: 'result',
    },
  ];
  return { steps, inverse: inv };
}

// Subespacios fundamentales

/**
 * Base del núcleo a partir de la RREF: por cada variable libre se arma un vector
 * con un 1 en esa posición y los valores que despejan a las variables principales.
 */
export function nullspaceFromRref(rref: Matrix, pivots: number[], n: number): Rational[][] {
  const free = Array.from({ length: n }, (_, j) => j).filter((j) => !pivots.includes(j));
  return free.map((f) => {
    const v = Array.from({ length: n }, (_, j) => (j === f ? Rational.ONE : Rational.ZERO));
    pivots.forEach((pc, r) => {
      v[pc] = rref[r][f].neg();
    });
    return v;
  });
}

export function nullspace(m: Matrix): Rational[][] {
  const { rref, pivots } = gaussJordan(m);
  return nullspaceFromRref(rref, pivots, cols(m));
}
