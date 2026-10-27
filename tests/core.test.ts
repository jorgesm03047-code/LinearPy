import { describe, expect, it } from 'vitest';
import { Rational, q } from '../src/core/rational';
import { Surd } from '../src/core/surd';
import { Poly, analyzeRoots } from '../src/core/polynomial';
import {
  determinant,
  determinantSteps,
  gaussJordan,
  identity,
  inverse,
  multiply,
  equals,
  RationalRing,
  type Matrix,
} from '../src/core/matrix';
import { solveSystem } from '../src/core/systems';
import { cross, dot, dotSteps, norm, type Vec3 } from '../src/core/vectors';
import { analyzeSubspaces } from '../src/core/transformations';
import { analyzeEigen } from '../src/core/eigen';
import { buildHash, parseHash, encodeState, decodeState, toBase64Url } from '../src/core/share';
import { DEFAULTS, validateExercise } from '../src/core/exercise';

const M = (rows: number[][]): Matrix => rows.map((r) => r.map((v) => q(v)));
const V = (a: number, b: number, c: number): Vec3 => [q(a), q(b), q(c)];

describe('Rational', () => {
  it('reduce y normaliza el signo', () => {
    expect(q(6, -8).toString()).toBe('-3/4');
  });

  it('opera sin errores de redondeo', () => {
    expect(Rational.parse('0.1')!.add(Rational.parse('0.2')!).toString()).toBe('3/10');
  });

  it('interpreta enteros, fracciones y decimales', () => {
    expect(Rational.parse('-7/2')!.toString()).toBe('-7/2');
    expect(Rational.parse('1.25')!.toString()).toBe('5/4');
    expect(Rational.parse('abc')).toBeNull();
    expect(Rational.parse('3/0')).toBeNull();
  });

  it('genera LaTeX', () => {
    expect(q(-3, 4).toLatex()).toBe('-\\frac{3}{4}');
  });
});

describe('Surd', () => {
  it('simplifica radicales', () => {
    expect(Surd.sqrt(q(12)).toLatex()).toBe('2\\sqrt{3}');
    expect(Surd.sqrt(q(1, 2)).toLatex()).toBe('\\frac{\\sqrt{2}}{2}');
  });

  it('racionaliza denominadores', () => {
    expect(Surd.divide(q(1), Surd.sqrt(q(14))).toLatex()).toBe('\\frac{\\sqrt{14}}{14}');
  });
});

describe('Vectores', () => {
  it('producto punto, cruz y norma', () => {
    const u = V(1, 2, 3);
    const v = V(4, 5, 6);
    expect(dot(u, v).toString()).toBe('32');
    expect(cross(u, v).map(String)).toEqual(['-3', '6', '-3']);
    expect(norm(cross(u, v)).toLatex()).toBe('3\\sqrt{6}');
  });
});

describe('Matrices', () => {
  const A = M([
    [2, 1, 3],
    [0, -1, 4],
    [1, 2, 0],
  ]);

  it('determinante por eliminación y por cofactores coinciden', () => {
    expect(determinant(A).toString()).toBe('-9');
    expect(determinantSteps(A, RationalRing).value.toString()).toBe('-9');
  });

  it('la inversa por la adjunta cumple A·A⁻¹ = I', () => {
    const inv = inverse(A)!;
    expect(equals(multiply(A, inv), identity(3))).toBe(true);
  });

  it('detecta matrices singulares', () => {
    expect(
      inverse(
        M([
          [1, 2],
          [2, 4],
        ]),
      ),
    ).toBeNull();
  });

  it('Gauss-Jordan obtiene la RREF y los pivotes', () => {
    const { rref, pivots } = gaussJordan(
      M([
        [1, 2, 3],
        [2, 4, 7],
      ]),
    );
    expect(pivots).toEqual([0, 2]);
    expect(rref.map((r) => r.map(String))).toEqual([
      ['1', '2', '0'],
      ['0', '0', '1'],
    ]);
  });
});

describe('Sistemas de ecuaciones', () => {
  it('solución única', () => {
    const r = solveSystem(
      M([
        [1, 1, 3],
        [1, -1, 1],
      ]),
    );
    expect(r.kind).toBe('unica');
    expect(r.solution).toEqual(['x_{1} = 2', 'x_{2} = 1']);
  });

  it('infinitas soluciones con parámetro', () => {
    const r = solveSystem(
      M([
        [1, 2, 3],
        [2, 4, 6],
      ]),
    );
    expect(r.kind).toBe('infinitas');
    expect(r.solution).toEqual(['x_{1} = 3 - 2t', 'x_{2} = t']);
  });

  it('sistema incompatible', () => {
    const r = solveSystem(
      M([
        [1, 1, 1],
        [1, 1, 2],
      ]),
    );
    expect(r.kind).toBe('incompatible');
    expect(r.rankA).toBe(1);
    expect(r.rankAug).toBe(2);
  });
});

describe('Transformaciones lineales', () => {
  it('cumple el teorema de la dimensión', () => {
    const r = analyzeSubspaces(
      M([
        [1, 2, 3],
        [2, 4, 6],
      ]),
    );
    expect(r.rank).toBe(1);
    expect(r.nullity).toBe(2);
    expect(r.kernelBasis.map((v) => v.map(String))).toEqual([
      ['-2', '1', '0'],
      ['-3', '0', '1'],
    ]);
  });
});

describe('Polinomios', () => {
  it('encuentra raíces racionales con multiplicidad', () => {
    // (λ - 1)²(λ + 1/2) = λ³ - 3/2 λ² + 0 λ + 1/2
    const p = new Poly([q(1, 2), q(0), q(-3, 2), q(1)]);
    const r = analyzeRoots(p);
    expect(r.rational.map((x) => [x.value.toString(), x.multiplicity])).toEqual([
      ['1', 2],
      ['-1/2', 1],
    ]);
  });
});

describe('Diagonalización', () => {
  it('matriz diagonalizable con verificación exacta', () => {
    const r = analyzeEigen(
      M([
        [4, 1],
        [2, 3],
      ]),
    );
    expect(r.charPoly.toLatex()).toBe('\\lambda^{2} - 7\\lambda + 10');
    expect(r.spaces.map((s) => s.value.toString())).toEqual(['5', '2']);
    expect(r.diagonalizable).toBe(true);
    expect(r.diagonalization?.verified).toBe(true);
  });

  it('matriz 3×3 con autovalores 1, 2 y 11', () => {
    const r = analyzeEigen(
      M([
        [2, 0, 0],
        [0, 3, 4],
        [0, 4, 9],
      ]),
    );
    expect(r.spaces.map((s) => s.value.toString())).toEqual(['11', '2', '1']);
    expect(r.diagonalization?.verified).toBe(true);
  });

  it('matriz defectiva', () => {
    const r = analyzeEigen(
      M([
        [1, 1],
        [0, 1],
      ]),
    );
    expect(r.spaces[0].algebraic).toBe(2);
    expect(r.spaces[0].geometric).toBe(1);
    expect(r.diagonalizable).toBe(false);
  });

  it('autovalores irracionales se reportan sin construir P', () => {
    const r = analyzeEigen(
      M([
        [1, 1],
        [1, 0],
      ]),
    );
    expect(r.allRational).toBe(false);
    expect(r.diagonalizable).toBeNull();
    expect(r.roots.remainderLatex[0]).toBe('\\frac{1}{2} \\pm \\frac{\\sqrt{5}}{2}');
  });
});

describe('Enlaces compartibles', () => {
  it('ida y vuelta conserva el estado, incluidos acentos', () => {
    const state = { ...DEFAULTS.matrices, tab: 'sel', nota: 'Matriz de ejemplo, sesión 4' };
    const parsed = parseHash(buildHash('matrices', state));
    expect(parsed.route).toBe('matrices');
    expect(parsed.data).toEqual(state);
  });

  it('un enlace dañado no rompe la app', () => {
    expect(parseHash('#/vectores?d=%%%').data).toBeNull();
    expect(parseHash('#/ruta-inexistente').route).toBe('inicio');
  });
});

describe('Validación y compatibilidad de ejercicios', () => {
  it('rechaza dimensiones vacías, irregulares y celdas no textuales', () => {
    for (const grid of [
      [],
      [[]],
      [['1', '2'], ['3']],
      [
        [1, 2],
        [3, 4],
      ],
      'matriz',
    ]) {
      expect(validateExercise('diagonalizacion', { grid })).toBe(false);
      expect(parseHash(buildHash('diagonalizacion', { grid })).invalid).toBe(true);
    }
  });
  it('rechaza parámetros fuera de rango, tipos incorrectos y versiones futuras', () => {
    const input = {
      ...DEFAULTS.transformaciones,
      labParams: { ...DEFAULTS.transformaciones.labParams, angle: 181 },
    };
    expect(validateExercise('transformaciones', input)).toBe(false);
    expect(validateExercise('vectores', { ...DEFAULTS.vectores, u: '1,2,3' })).toBe(false);
    expect(
      decodeState(toBase64Url(JSON.stringify({ version: 99, state: DEFAULTS.vectores }))),
    ).toBeNull();
    expect(decodeState('a'.repeat(20001))).toBeNull();
  });
  it('acepta enlaces antiguos sin envoltura y conserva Unicode en los nuevos', () => {
    const legacy = toBase64Url(JSON.stringify(DEFAULTS.vectores));
    expect(parseHash('#/vectores?d=' + legacy).data).toEqual(DEFAULTS.vectores);
    expect(decodeState(encodeState({ nota: 'Fracción, núcleo y dirección' }))).toEqual({
      nota: 'Fracción, núcleo y dirección',
    });
  });
  it('conserva la operación elegida al compartir', () => {
    const state = { ...DEFAULTS.matrices, operation: 'inv' };
    expect(parseHash(buildHash('matrices', state)).data).toEqual(state);
  });
});

describe('Casos límite matemáticos', () => {
  it('no atribuye un ángulo de 90 grados al vector cero', () => {
    const steps = dotSteps(V(0, 0, 0), V(1, 2, 3));
    expect(steps.some((s) => s.title === 'El ángulo no está definido')).toBe(true);
    expect(steps.some((s) => s.title === 'Los vectores son ortogonales')).toBe(false);
  });
  it('compara también las dimensiones de las matrices', () => {
    expect(equals(M([[1]]), M([[1, 2]]))).toBe(false);
    expect(inverse(M([[2]]))?.[0][0].toString()).toBe('1/2');
  });
  it('aproxima un polinomio cúbico sin raíces racionales', () => {
    const roots = analyzeRoots(new Poly([q(-2), q(0), q(0), q(1)]));
    expect(roots.rational).toHaveLength(0);
    expect(roots.remainderNumeric).toHaveLength(3);
    const real = roots.remainderNumeric.find((r) => Math.abs(r.im) < 1e-7);
    expect(real?.re).toBeCloseTo(Math.cbrt(2), 8);
  });
  it('limita búsquedas muy grandes sin afirmar que son completas', () => {
    const roots = analyzeRoots(new Poly([q(100000000000003n), q(1), q(1)]));
    expect(roots.searchLimited).toBe(true);
    expect(roots.remainderNumeric).toHaveLength(2);
  });
});
