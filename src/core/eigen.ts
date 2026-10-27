import { Rational } from './rational';
import { Poly, PolyRing, analyzeRoots, type RootAnalysis } from './polynomial';
import {
  determinantSteps,
  equals,
  gaussJordan,
  hconcat,
  identity,
  inverseSteps,
  matrixLatex,
  multiply,
  nullspaceFromRref,
  scale,
  subtract,
  transpose,
  zeros,
  type GaussJordanResult,
  type Matrix,
} from './matrix';
import type { Step } from './types';

/**
 * Polinomio característico, autovalores, espacios propios y diagonalización A = P D P⁻¹.
 *
 * Todo el procedimiento es exacto cuando los autovalores son racionales. Si aparecen
 * autovalores irracionales o complejos se muestran en forma exacta (cuando el factor
 * restante es cuadrático) o aproximada, y se indica que P y D no se construyen.
 */
export interface Eigenspace {
  value: Rational;
  algebraic: number;
  geometric: number;
  shifted: Matrix;
  reduction: GaussJordanResult;
  basis: Rational[][];
}

export interface Diagonalization {
  P: Matrix;
  D: Matrix;
  inverse: ReturnType<typeof inverseSteps>;
  PD: Matrix;
  PDPinv: Matrix;
  verified: boolean;
}

export interface EigenAnalysis {
  lambdaMatrixLatex: string;
  charSteps: Step[];
  charPoly: Poly;
  roots: RootAnalysis;
  spaces: Eigenspace[];
  allRational: boolean;
  diagonalizable: boolean | null;
  diagonalization?: Diagonalization;
}

/** Construye A - λI como matriz de polinomios. */
export function lambdaMatrix(a: Matrix): Poly[][] {
  return a.map((row, i) =>
    row.map((v, j) => (i === j ? Poly.linear(v, Rational.ONE.neg()) : Poly.constant(v))),
  );
}

export function analyzeEigen(a: Matrix): EigenAnalysis {
  const n = a.length;
  const lm = lambdaMatrix(a);
  const { steps: charSteps, value: charPoly } = determinantSteps(lm, PolyRing);
  const roots = analyzeRoots(charPoly);
  const allRational = roots.remainder.degree <= 0;

  const spaces: Eigenspace[] = roots.rational.map(({ value, multiplicity }) => {
    const shifted = subtract(a, scale(identity(n), value));
    const reduction = gaussJordan(hconcat(shifted, zeros(n, 1)), 1);
    const basis = nullspaceFromRref(reduction.rref, reduction.pivots, n);
    return { value, algebraic: multiplicity, geometric: basis.length, shifted, reduction, basis };
  });

  // Si hay autovalores no racionales no podemos construir P exacta; distinguimos ese caso con null
  const defective = spaces.some((s) => s.geometric < s.algebraic);
  let diagonalizable: boolean | null = allRational ? !defective : defective ? false : null;

  let diagonalization: Diagonalization | undefined;
  if (allRational && diagonalizable) {
    const columns = spaces.flatMap((s) => s.basis);
    const values = spaces.flatMap((s) => s.basis.map(() => s.value));
    const P = transpose(columns);
    const D = values.map((v, i) => values.map((_, j) => (i === j ? v : Rational.ZERO)));
    const inv = inverseSteps(P);
    if (inv.inverse) {
      const PD = multiply(P, D);
      const PDPinv = multiply(PD, inv.inverse);
      diagonalization = { P, D, inverse: inv, PD, PDPinv, verified: equals(PDPinv, a) };
    } else {
      diagonalizable = false;
    }
  }

  return {
    lambdaMatrixLatex: matrixLatex(lm, (p) => p.toLatex()),
    charSteps,
    charPoly,
    roots,
    spaces,
    allRational,
    diagonalizable,
    diagonalization,
  };
}
