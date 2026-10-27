import { Rational, gcd } from './rational';
import { Surd } from './surd';
import type { Ring } from './types';

/**
 * Polinomios en una variable (λ) con coeficientes racionales.
 *
 * Se usan para el polinomio característico det(A - λI). Los coeficientes se guardan
 * en orden ascendente: coefs[k] acompaña a λ^k.
 */
export class Poly {
  readonly coefs: Rational[];

  constructor(coefs: Rational[]) {
    const c = [...coefs];
    // Quitamos ceros del grado más alto para que el grado sea correcto
    while (c.length > 1 && c[c.length - 1].isZero()) c.pop();
    this.coefs = c.length ? c : [Rational.ZERO];
  }

  static constant(r: Rational): Poly {
    return new Poly([r]);
  }

  /** El polinomio a + bλ. */
  static linear(a: Rational, b: Rational): Poly {
    return new Poly([a, b]);
  }

  get degree(): number {
    return this.isZero() ? -Infinity : this.coefs.length - 1;
  }

  leading(): Rational {
    return this.coefs[this.coefs.length - 1];
  }

  isZero(): boolean {
    return this.coefs.length === 1 && this.coefs[0].isZero();
  }

  add(o: Poly): Poly {
    const n = Math.max(this.coefs.length, o.coefs.length);
    const out: Rational[] = [];
    for (let i = 0; i < n; i++) {
      out.push((this.coefs[i] ?? Rational.ZERO).add(o.coefs[i] ?? Rational.ZERO));
    }
    return new Poly(out);
  }

  neg(): Poly {
    return new Poly(this.coefs.map((c) => c.neg()));
  }

  sub(o: Poly): Poly {
    return this.add(o.neg());
  }

  mul(o: Poly): Poly {
    if (this.isZero() || o.isZero()) return new Poly([Rational.ZERO]);
    const out: Rational[] = Array.from(
      { length: this.coefs.length + o.coefs.length - 1 },
      () => Rational.ZERO,
    );
    this.coefs.forEach((a, i) => {
      o.coefs.forEach((b, j) => {
        out[i + j] = out[i + j].add(a.mul(b));
      });
    });
    return new Poly(out);
  }

  evaluate(x: Rational): Rational {
    // Evaluación de Horner
    let acc = Rational.ZERO;
    for (let i = this.coefs.length - 1; i >= 0; i--) acc = acc.mul(x).add(this.coefs[i]);
    return acc;
  }

  evaluateNumber(x: number): number {
    let acc = 0;
    for (let i = this.coefs.length - 1; i >= 0; i--) acc = acc * x + this.coefs[i].toNumber();
    return acc;
  }

  /** Divide entre (λ - r) con división sintética. Supone que r es raíz. */
  deflate(r: Rational): Poly {
    const n = this.coefs.length - 1;
    const out: Rational[] = new Array(n);
    let carry = Rational.ZERO;
    for (let i = n; i >= 1; i--) {
      carry = carry.mul(r).add(this.coefs[i]);
      out[i - 1] = carry;
    }
    return new Poly(out);
  }

  /** LaTeX en potencias descendentes, por ejemplo -\lambda^{3} + 6\lambda^{2} - 11\lambda + 6. */
  toLatex(variable = '\\lambda'): string {
    if (this.isZero()) return '0';
    let out = '';
    for (let k = this.coefs.length - 1; k >= 0; k--) {
      const c = this.coefs[k];
      if (c.isZero()) continue;
      const negative = c.isNegative();
      const abs = c.abs();
      const power = k === 0 ? '' : k === 1 ? variable : `${variable}^{${k}}`;
      const coef = k > 0 && abs.isOne() ? '' : abs.toLatex();
      const term = `${coef}${power}`;
      if (out === '') out = negative ? `-${term}` : term;
      else out += negative ? ` - ${term}` : ` + ${term}`;
    }
    return out;
  }

  /** Cantidad de términos no nulos, útil para decidir si se necesitan paréntesis. */
  termCount(): number {
    return this.coefs.filter((c) => !c.isZero()).length;
  }
}

/** Anillo de polinomios, para reutilizar el determinante genérico con matrices A - λI. */
export const PolyRing: Ring<Poly> = {
  zero: Poly.constant(Rational.ZERO),
  one: Poly.constant(Rational.ONE),
  add: (a, b) => a.add(b),
  sub: (a, b) => a.sub(b),
  mul: (a, b) => a.mul(b),
  neg: (a) => a.neg(),
  isZero: (a) => a.isZero(),
  latex: (a) => a.toLatex(),
  latexParen: (a) => {
    const needs = a.termCount() > 1 || (a.termCount() === 1 && a.coefs.some((c) => c.isNegative()));
    return needs ? `\\left(${a.toLatex()}\\right)` : a.toLatex();
  },
};

/** Divisores positivos de un entero, usados por el teorema de la raíz racional. */
function divisors(n: bigint): bigint[] {
  n = n < 0n ? -n : n;
  const out: bigint[] = [];
  for (let d = 1n; d * d <= n && d <= 10000n; d++) {
    if (n % d === 0n) {
      out.push(d);
      if (d * d !== n) out.push(n / d);
    }
  }
  return out;
}

export interface RootAnalysis {
  /** Raíces racionales con su multiplicidad algebraica. */
  searchLimited: boolean;
  rational: { value: Rational; multiplicity: number }[];
  /** Factor que queda después de quitar las raíces racionales. */
  remainder: Poly;
  /** Raíces del resto en forma exacta (solo cuando el resto es cuadrático). */
  remainderLatex: string[];
  /** Aproximaciones numéricas de las raíces del resto (parte real e imaginaria). */
  remainderNumeric: { re: number; im: number }[];
}

/**
 * Encuentra todas las raíces racionales con el teorema de la raíz racional y
 * describe las raíces restantes (exactas si el resto es cuadrático, numéricas si no).
 */
export function analyzeRoots(p: Poly): RootAnalysis {
  const found = new Map<string, { value: Rational; multiplicity: number }>();
  let current = p;
  let searchLimited = false;

  const register = (r: Rational) => {
    const key = r.toString();
    const entry = found.get(key);
    if (entry) entry.multiplicity++;
    else found.set(key, { value: r, multiplicity: 1 });
  };

  // Primero λ = 0 tantas veces como se repita
  while (current.degree > 0 && current.coefs[0].isZero()) {
    register(Rational.ZERO);
    current = new Poly(current.coefs.slice(1));
  }

  let searching = true;
  while (searching && current.degree > 0) {
    searching = false;
    // Pasamos a coeficientes enteros multiplicando por el mcm de los denominadores
    let lcm = 1n;
    for (const c of current.coefs) lcm = (lcm * c.den) / gcd(lcm, c.den);
    const ints = current.coefs.map((c) => (c.num * lcm) / c.den);
    const a0 = ints[0];
    const an = ints[ints.length - 1];
    if (a0 < -100000000n || a0 > 100000000n || an < -100000000n || an > 100000000n)
      searchLimited = true;
    const candidates: Rational[] = [];
    for (const num of divisors(a0)) {
      for (const den of divisors(an)) {
        candidates.push(new Rational(num, den), new Rational(-num, den));
      }
    }
    for (const r of candidates) {
      if (current.evaluate(r).isZero()) {
        register(r);
        current = current.deflate(r);
        searching = true;
        break;
      }
    }
  }

  const rational = [...found.values()].sort((a, b) => b.value.compare(a.value));
  const remainderLatex: string[] = [];
  let remainderNumeric: { re: number; im: number }[] = [];

  if (current.degree === 2) {
    const [c, b, a] = current.coefs;
    const disc = b.mul(b).sub(new Rational(4n).mul(a).mul(c));
    const twoA = new Rational(2n).mul(a);
    const center = b.neg().div(twoA);
    const centerLatex = center.isZero() ? '' : center.toLatex();
    // El ± hace irrelevante el signo de 2a, así que usamos su valor absoluto
    const radical = Surd.sqrt(disc.abs()).scale(twoA.abs().inv()).toLatex();
    remainderLatex.push(`${centerLatex} \\pm ${radical}${disc.isNegative() ? '\\,i' : ''}`);
    remainderNumeric = numericRoots(current);
  } else if (current.degree > 2) {
    remainderNumeric = numericRoots(current);
  }

  return { searchLimited, rational, remainder: current, remainderLatex, remainderNumeric };
}

/** Aproxima todas las raíces complejas con el método de Durand-Kerner. */
export function numericRoots(p: Poly): { re: number; im: number }[] {
  const n = p.degree;
  if (n < 1) return [];
  const lead = p.leading().toNumber();
  const c = p.coefs.map((x) => x.toNumber() / lead);

  type C = [number, number];
  const mul = (a: C, b: C): C => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
  const sub = (a: C, b: C): C => [a[0] - b[0], a[1] - b[1]];
  const div = (a: C, b: C): C => {
    const d = b[0] * b[0] + b[1] * b[1];
    return [(a[0] * b[0] + a[1] * b[1]) / d, (a[1] * b[0] - a[0] * b[1]) / d];
  };
  const evalC = (z: C): C => {
    let acc: C = [0, 0];
    for (let i = n; i >= 0; i--) acc = [mul(acc, z)[0] + c[i], mul(acc, z)[1]];
    return acc;
  };

  let roots: C[] = Array.from({ length: n }, (_, k) => {
    const angle = (2 * Math.PI * k) / n + 0.4;
    return [0.9 * Math.cos(angle), 0.9 * Math.sin(angle)] as C;
  });
  for (let iter = 0; iter < 500; iter++) {
    let delta = 0;
    roots = roots.map((z, i) => {
      let den: C = [1, 0];
      roots.forEach((w, j) => {
        if (i !== j) den = mul(den, sub(z, w));
      });
      const step = div(evalC(z), den);
      delta = Math.max(delta, Math.hypot(step[0], step[1]));
      return sub(z, step);
    });
    if (delta < 1e-14) break;
  }
  return roots
    .map(([re, im]) => ({ re: Math.abs(re) < 1e-10 ? 0 : re, im: Math.abs(im) < 1e-10 ? 0 : im }))
    .sort((a, b) => b.re - a.re || b.im - a.im);
}
