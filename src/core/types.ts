/**
 * Estructuras compartidas por todos los procedimientos paso a paso.
 *
 * Un paso tiene un título (puede incluir matemáticas en línea entre signos $),
 * una explicación opcional y una o varias expresiones LaTeX en bloque.
 */
export interface Step {
  title: string;
  detail?: string;
  math?: string[];
  /** Resalta el paso como resultado o conclusión. */
  tone?: 'default' | 'result' | 'warning';
}

/** Operaciones mínimas que necesita un tipo para usarse como entrada de matriz. */
export interface Ring<T> {
  zero: T;
  one: T;
  add(a: T, b: T): T;
  sub(a: T, b: T): T;
  mul(a: T, b: T): T;
  neg(a: T): T;
  isZero(a: T): boolean;
  latex(a: T): string;
  /** LaTeX con paréntesis cuando hace falta para escribir productos. */
  latexParen(a: T): string;
}
