import { Rational } from './rational';
import {
  cols,
  column,
  gaussJordan,
  hconcat,
  nullspaceFromRref,
  vectorLatex,
  zeros,
  type Matrix,
} from './matrix';
import type { Step } from './types';

/**
 * Núcleo, imagen y teorema de la dimensión de una transformación lineal T(x) = Ax.
 */
export interface SubspaceAnalysis {
  homogeneous: ReturnType<typeof gaussJordan>;
  pivots: number[];
  free: number[];
  kernelBasis: Rational[][];
  imageBasis: Rational[][];
  nullity: number;
  rank: number;
  domainDim: number;
  summary: Step[];
}

export function analyzeSubspaces(a: Matrix): SubspaceAnalysis {
  const n = cols(a);
  const aug = hconcat(a, zeros(a.length, 1));
  const homogeneous = gaussJordan(aug, 1);
  const { rref, pivots } = homogeneous;
  const free = Array.from({ length: n }, (_, j) => j).filter((j) => !pivots.includes(j));
  const kernelBasis = nullspaceFromRref(rref, pivots, n);
  // La base de la imagen se toma de las columnas originales de A en las posiciones pivote
  const imageBasis = pivots.map((p) => column(a, p).map((r) => r[0]));

  const summary: Step[] = [
    {
      title: 'Variables principales y libres',
      detail:
        `Columnas pivote: ${pivots.map((p) => p + 1).join(', ') || 'ninguna'}. ` +
        `Variables libres: ${free.map((f) => `x${f + 1}`).join(', ') || 'ninguna'}.`,
    },
    {
      title: 'Base del núcleo',
      detail: kernelBasis.length
        ? 'Por cada variable libre armamos un vector: ponemos 1 en esa variable, 0 en las otras libres y despejamos las principales.'
        : 'No hay variables libres, así que la única solución de Ax = 0 es el vector cero.',
      math: kernelBasis.length
        ? [kernelBasis.map((v, i) => `\\vec{k}_{${i + 1}} = ${vectorLatex(v)}`).join(',\\quad ')]
        : ['\\ker(T) = \\{\\vec{0}\\}'],
      tone: 'result',
    },
    {
      title: 'Base de la imagen',
      detail: imageBasis.length
        ? 'Tomamos las columnas de la matriz original A que están en las posiciones pivote; son linealmente independientes y generan la imagen.'
        : 'La matriz es cero, así que la imagen solo contiene al vector cero.',
      math: imageBasis.length
        ? [imageBasis.map((v, i) => `\\vec{w}_{${i + 1}} = ${vectorLatex(v)}`).join(',\\quad ')]
        : ['\\operatorname{Im}(T) = \\{\\vec{0}\\}'],
      tone: 'result',
    },
    {
      title: 'Teorema de la dimensión',
      detail: 'La nulidad más el rango es igual a la dimensión del dominio.',
      math: [
        '\\dim(\\ker T) + \\dim(\\operatorname{Im} T) = \\dim(V)',
        `${kernelBasis.length} + ${imageBasis.length} = ${n}\\;\\checkmark`,
      ],
      tone: 'result',
    },
  ];

  return {
    homogeneous,
    pivots,
    free,
    kernelBasis,
    imageBasis,
    nullity: kernelBasis.length,
    rank: imageBasis.length,
    domainDim: n,
    summary,
  };
}

/** Parámetros del laboratorio 2D. */
export interface Lab2DParams {
  angle: number;
  scaleX: number;
  scaleY: number;
  shearX: number;
  shearY: number;
  reflect: boolean;
}

export type M2 = [[number, number], [number, number]];

export const mul2 = (a: M2, b: M2): M2 => [
  [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
  [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
];

/**
 * Matrices individuales del laboratorio y su composición T = R · Sh · S · Ref.
 * Se aplican de derecha a izquierda: primero la reflexión y al final la rotación.
 */
export function composeLab(p: Lab2DParams) {
  const t = (p.angle * Math.PI) / 180;
  const R: M2 = [
    [Math.cos(t), -Math.sin(t)],
    [Math.sin(t), Math.cos(t)],
  ];
  const Sh: M2 = [
    [1, p.shearX],
    [p.shearY, 1],
  ];
  const S: M2 = [
    [p.scaleX, 0],
    [0, p.scaleY],
  ];
  const Ref: M2 = p.reflect
    ? [
        [1, 0],
        [0, -1],
      ]
    : [
        [1, 0],
        [0, 1],
      ];
  const SRef = mul2(S, Ref);
  const ShSRef = mul2(Sh, SRef);
  const T = mul2(R, ShSRef);
  const det = T[0][0] * T[1][1] - T[0][1] * T[1][0];
  return { R, Sh, S, Ref, SRef, ShSRef, T, det };
}

/** Matriz 2×2 en LaTeX con decimales cortos y sin ceros negativos. */
export function m2Latex(m: M2): string {
  const f = (x: number) => {
    const r = Math.round(x * 1000) / 1000;
    return (Object.is(r, -0) ? 0 : r).toString();
  };
  return `\\begin{pmatrix} ${f(m[0][0])} & ${f(m[0][1])} \\\\ ${f(m[1][0])} & ${f(m[1][1])} \\end{pmatrix}`;
}
