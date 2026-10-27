import { Rational } from './rational';
import { cols, gaussJordan, rows, type GaussJordanResult, type Matrix } from './matrix';

/**
 * Sistemas de ecuaciones lineales y su clasificación con el teorema de Rouché-Frobenius.
 */
export type SystemKind = 'unica' | 'infinitas' | 'incompatible';

export interface SystemResult {
  reduction: GaussJordanResult;
  rankA: number;
  rankAug: number;
  unknowns: number;
  kind: SystemKind;
  /** Una línea LaTeX por incógnita, por ejemplo x_2 = 3 - 2t_1. */
  solution: string[];
  /** Renglón que produce la contradicción 0 = c cuando el sistema es incompatible. */
  contradictionRow?: number;
}

/** Escribe una combinación lineal c + a·t1 + b·t2 en LaTeX sin términos nulos. */
export function linearCombinationLatex(
  constant: Rational,
  terms: { coef: Rational; symbol: string }[],
): string {
  let out = constant.isZero() ? '' : constant.toLatex();
  for (const { coef, symbol } of terms) {
    if (coef.isZero()) continue;
    const abs = coef.abs();
    const body = `${abs.isOne() ? '' : abs.toLatex()}${symbol}`;
    if (out === '') out = coef.isNegative() ? `-${body}` : body;
    else out += coef.isNegative() ? ` - ${body}` : ` + ${body}`;
  }
  return out === '' ? '0' : out;
}

/** Resuelve el sistema representado por la matriz aumentada [A | b]. */
export function solveSystem(aug: Matrix): SystemResult {
  const n = cols(aug) - 1;
  const reduction = gaussJordan(aug, 1);
  const { rref, pivots } = reduction;
  const rankA = pivots.length;

  // Un renglón 0 0 ... 0 | c con c distinto de cero indica contradicción
  let contradictionRow: number | undefined;
  for (let i = rankA; i < rows(rref); i++) {
    if (!rref[i][n].isZero()) {
      contradictionRow = i;
      break;
    }
  }
  const rankAug = rankA + (contradictionRow !== undefined ? 1 : 0);

  if (contradictionRow !== undefined) {
    return {
      reduction,
      rankA,
      rankAug,
      unknowns: n,
      kind: 'incompatible',
      solution: [],
      contradictionRow,
    };
  }

  const free = Array.from({ length: n }, (_, j) => j).filter((j) => !pivots.includes(j));
  const paramName = new Map(free.map((j, k) => [j, free.length === 1 ? 't' : `t_{${k + 1}}`]));
  const solution: string[] = [];

  for (let j = 0; j < n; j++) {
    const r = pivots.indexOf(j);
    if (r === -1) {
      solution.push(`x_{${j + 1}} = ${paramName.get(j)}`);
      continue;
    }
    // X_j = b_r - suma de los coeficientes de las variables libres
    const terms = free.map((f) => ({ coef: rref[r][f].neg(), symbol: paramName.get(f)! }));
    solution.push(`x_{${j + 1}} = ${linearCombinationLatex(rref[r][n], terms)}`);
  }

  return {
    reduction,
    rankA,
    rankAug,
    unknowns: n,
    kind: rankA === n ? 'unica' : 'infinitas',
    solution,
  };
}
