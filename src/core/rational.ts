/**
 * Aritmética racional exacta.
 *
 * Cada número se guarda como una fracción p/q con enteros de precisión arbitraria
 * (bigint), siempre reducida y con el denominador positivo. Así evitamos los errores
 * de redondeo de los números de punto flotante (por ejemplo 0.1 + 0.2 = 0.30000000000000004)
 * y los resultados coinciden con lo que el alumno obtiene a mano.
 */

/** Máximo común divisor de dos enteros grandes (algoritmo de Euclides). */
export function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
}

export class Rational {
  readonly num: bigint;
  readonly den: bigint;

  constructor(num: bigint | number, den: bigint | number = 1n) {
    let n = BigInt(num);
    let d = BigInt(den);
    if (d === 0n) {
      throw new RangeError('División entre cero');
    }
    // El signo siempre vive en el numerador
    if (d < 0n) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d) || 1n;
    this.num = n / g;
    this.den = d / g;
  }

  static readonly ZERO = new Rational(0n);
  static readonly ONE = new Rational(1n);

  static from(value: Rational | number | bigint): Rational {
    if (value instanceof Rational) return value;
    if (typeof value === 'bigint') return new Rational(value);
    if (!Number.isInteger(value)) {
      throw new TypeError('Usa Rational.parse para valores decimales');
    }
    return new Rational(BigInt(value));
  }

  add(o: Rational): Rational {
    return new Rational(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(o: Rational): Rational {
    return new Rational(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(o: Rational): Rational {
    return new Rational(this.num * o.num, this.den * o.den);
  }

  div(o: Rational): Rational {
    if (o.num === 0n) throw new RangeError('División entre cero');
    return new Rational(this.num * o.den, this.den * o.num);
  }

  neg(): Rational {
    return new Rational(-this.num, this.den);
  }

  inv(): Rational {
    return Rational.ONE.div(this);
  }

  /** Potencia con exponente entero no negativo. */
  pow(e: number): Rational {
    let result = Rational.ONE;
    for (let i = 0; i < e; i++) result = result.mul(this);
    return result;
  }

  isZero(): boolean {
    return this.num === 0n;
  }

  isOne(): boolean {
    return this.num === 1n && this.den === 1n;
  }

  isInteger(): boolean {
    return this.den === 1n;
  }

  isNegative(): boolean {
    return this.num < 0n;
  }

  equals(o: Rational): boolean {
    return this.num === o.num && this.den === o.den;
  }

  compare(o: Rational): number {
    const diff = this.num * o.den - o.num * this.den;
    return diff === 0n ? 0 : diff > 0n ? 1 : -1;
  }

  abs(): Rational {
    return this.isNegative() ? this.neg() : this;
  }

  toNumber(): number {
    return Number(this.num) / Number(this.den);
  }

  /** Texto plano, útil para mostrar el valor dentro de un campo de captura. */
  toString(): string {
    return this.den === 1n ? this.num.toString() : `${this.num}/${this.den}`;
  }

  /** Representación en LaTeX, por ejemplo -\frac{3}{4}. */
  toLatex(): string {
    if (this.den === 1n) return this.num.toString();
    const sign = this.num < 0n ? '-' : '';
    const n = this.num < 0n ? -this.num : this.num;
    return `${sign}\\frac{${n}}{${this.den}}`;
  }

  /** LaTeX entre paréntesis cuando es negativo, para escribir productos como (2)(-3). */
  toLatexParen(): string {
    return this.isNegative() ? `\\left(${this.toLatex()}\\right)` : this.toLatex();
  }

  /**
   * Convierte texto capturado por el alumno en un racional.
   * Acepta enteros ("-4"), fracciones ("3/5", "-7/2") y decimales finitos ("0.25", "-1.5").
   * Devuelve null si el texto no es válido.
   */
  static parse(text: string): Rational | null {
    const s = text.trim().replace(/\s+/g, '').replace(',', '.');
    if (s === '' || s === '-' || s === '+') return null;

    const frac = /^([+-]?\d+(?:\.\d+)?)\/([+-]?\d+(?:\.\d+)?)$/.exec(s);
    if (frac) {
      const a = Rational.parse(frac[1]);
      const b = Rational.parse(frac[2]);
      if (!a || !b || b.isZero()) return null;
      return a.div(b);
    }

    const dec = /^([+-]?)(\d*)(?:\.(\d+))?$/.exec(s);
    if (dec && (dec[2] !== '' || dec[3] !== undefined)) {
      const sign = dec[1] === '-' ? -1n : 1n;
      const intPart = dec[2] === '' ? '0' : dec[2];
      const fracPart = dec[3] ?? '';
      const den = 10n ** BigInt(fracPart.length);
      const num = BigInt(intPart + fracPart);
      return new Rational(sign * num, den);
    }
    return null;
  }
}

/** Atajo para crear racionales en el código y en las pruebas. */
export const q = (num: number | bigint, den: number | bigint = 1): Rational =>
  new Rational(BigInt(num), BigInt(den));
