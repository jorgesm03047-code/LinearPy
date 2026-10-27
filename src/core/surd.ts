import { Rational } from './rational';

/**
 * Radicales simplificados de la forma c·√r.
 *
 * c es un racional y r es un entero positivo. Con esto podemos
 * expresar de forma exacta normas, vectores unitarios, cosenos directores y áreas,
 * por ejemplo √12 = 2√3 o 1/√14 = √14/14.
 */
export class Surd {
  constructor(
    readonly coef: Rational,
    readonly rad: bigint,
  ) {}

  /** Raíz cuadrada exacta de un racional no negativo, ya simplificada. */
  static sqrt(value: Rational): Surd {
    if (value.isNegative()) throw new RangeError('Raíz de un número negativo');
    if (value.isZero()) return new Surd(Rational.ZERO, 1n);
    // √(p/q) = √(p·q)/q, así el radicando queda entero
    const [outside, inside] = extractSquares(value.num * value.den);
    return new Surd(new Rational(outside, value.den), inside);
  }

  static fromRational(value: Rational): Surd {
    return new Surd(value, 1n);
  }

  isZero(): boolean {
    return this.coef.isZero();
  }

  isRational(): boolean {
    return this.rad === 1n || this.coef.isZero();
  }

  /** Multiplica por un racional. */
  scale(k: Rational): Surd {
    return new Surd(this.coef.mul(k), this.rad);
  }

  mul(o: Surd): Surd {
    const [outside, inside] = extractSquares(this.rad * o.rad);
    return new Surd(this.coef.mul(o.coef).mul(new Rational(outside)), inside);
  }

  /** Divide un racional entre este radical y racionaliza el denominador. */
  static divide(numerator: Rational, denominator: Surd): Surd {
    // A / (c√r) = a√r / (c·r)
    const den = denominator.coef.mul(new Rational(denominator.rad));
    return new Surd(numerator.div(den), denominator.rad);
  }

  toNumber(): number {
    return this.coef.toNumber() * Math.sqrt(Number(this.rad));
  }

  toLatex(): string {
    if (this.coef.isZero()) return '0';
    if (this.rad === 1n) return this.coef.toLatex();
    const root = `\\sqrt{${this.rad}}`;
    const c = this.coef;
    const sign = c.isNegative() ? '-' : '';
    const n = c.isNegative() ? -c.num : c.num;
    const top = n === 1n ? root : `${n}${root}`;
    return c.den === 1n ? `${sign}${top}` : `${sign}\\frac{${top}}{${c.den}}`;
  }
}

/**
 * Separa un entero positivo n en a²·b con un límite de simplificación.
 * Devuelve [a, b], de modo que √n = a√b.
 */
export function extractSquares(n: bigint): [bigint, bigint] {
  const root = (value: bigint) => {
    if (value < 2n) return value;
    let x = value,
      next = (x + 1n) / 2n;
    while (next < x) {
      x = next;
      next = (x + value / x) / 2n;
    }
    return x;
  };
  const whole = root(n);
  if (whole * whole === n) return [whole, 1n];
  let outside = 1n;
  let inside = n;
  // Limita la simplificación y conserva el valor exacto dentro del radical restante.
  for (let f = 2n; f * f <= inside && f <= 10000n; f++) {
    while (inside % (f * f) === 0n) {
      inside /= f * f;
      outside *= f;
    }
  }
  const rest = root(inside);
  if (rest * rest === inside) return [outside * rest, 1n];
  return [outside, inside];
}
