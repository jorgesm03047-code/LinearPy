import { Rational } from './rational';
import { Surd } from './surd';
import type { Step } from './types';
import { linearCombinationLatex } from './systems';

/**
 * Operaciones con vectores en R³ y ecuaciones de rectas y planos, con procedimientos.
 */
export type Vec3 = [Rational, Rational, Rational];

const P = (r: Rational) => r.toLatexParen();
const L = (r: Rational) => r.toLatex();
const col = (v: Rational[]) => `\\begin{pmatrix} ${v.map(L).join(' \\\\ ')} \\end{pmatrix}`;

export function dot(u: Vec3, v: Vec3): Rational {
  return u[0].mul(v[0]).add(u[1].mul(v[1])).add(u[2].mul(v[2]));
}

export function cross(u: Vec3, v: Vec3): Vec3 {
  return [
    u[1].mul(v[2]).sub(u[2].mul(v[1])),
    u[2].mul(v[0]).sub(u[0].mul(v[2])),
    u[0].mul(v[1]).sub(u[1].mul(v[0])),
  ];
}

export function normSquared(v: Vec3): Rational {
  return dot(v, v);
}

export function norm(v: Vec3): Surd {
  return Surd.sqrt(normSquared(v));
}

/** Norma euclidiana desglosada componente por componente. */
export function normSteps(v: Vec3, name: string): Step {
  const sq = v.map((c) => c.mul(c));
  const sum = normSquared(v);
  return {
    title: `Norma de $\\vec{${name}}$`,
    math: [
      `\\|\\vec{${name}}\\| = \\sqrt{${v.map((c) => `${P(c)}^2`).join(' + ')}}`,
      `\\|\\vec{${name}}\\| = \\sqrt{${sq.map(L).join(' + ')}} = \\sqrt{${L(sum)}}`,
      `\\|\\vec{${name}}\\| = ${norm(v).toLatex()}`,
    ],
    tone: 'result',
  };
}

export function dotSteps(u: Vec3, v: Vec3): Step[] {
  const d = dot(u, v);
  const steps: Step[] = [
    {
      title: 'Producto componente por componente',
      detail: 'Se multiplican las componentes correspondientes y se suman los resultados.',
      math: [
        '\\vec{u}\\cdot\\vec{v} = u_x v_x + u_y v_y + u_z v_z',
        `\\vec{u}\\cdot\\vec{v} = ${u.map((c, i) => `${P(c)}${P(v[i])}`).join(' + ')}`,
        `\\vec{u}\\cdot\\vec{v} = ${u.map((c, i) => P(c.mul(v[i]))).join(' + ')} = ${L(d)}`,
      ],
      tone: 'result',
    },
  ];

  const nu = norm(u);
  const nv = norm(v);
  if (nu.isZero() || nv.isZero()) {
    steps.push({
      title: 'El ángulo no está definido',
      detail:
        'Uno de los vectores es el vector cero. Aunque su producto punto es cero, no tiene dirección para medir un ángulo.',
      tone: 'warning',
    });
  } else if (d.isZero()) {
    steps.push({
      title: 'Los vectores son ortogonales',
      detail: 'Su producto punto es cero, así que forman un ángulo de 90°.',
      tone: 'result',
    });
  } else {
    const product = nu.mul(nv);
    const cos = Surd.divide(d, product);
    const degrees = (Math.acos(Math.max(-1, Math.min(1, cos.toNumber()))) * 180) / Math.PI;
    steps.push({
      title: 'Ángulo entre los vectores',
      math: [
        '\\cos\\theta = \\frac{\\vec{u}\\cdot\\vec{v}}{\\|\\vec{u}\\|\\,\\|\\vec{v}\\|}',
        `\\cos\\theta = \\frac{${L(d)}}{${nu.toLatex()}\\cdot ${nv.toLatex()}} = \\frac{${L(d)}}{${product.toLatex()}} = ${cos.toLatex()}`,
        `\\theta = \\arccos\\left(${cos.toLatex()}\\right) \\approx ${degrees.toFixed(2)}^{\\circ}`,
      ],
      tone: 'result',
    });
  }
  return steps;
}

export function crossSteps(u: Vec3, v: Vec3): Step[] {
  const c = cross(u, v);
  const [ux, uy, uz] = u;
  const [vx, vy, vz] = v;
  const det2 = (a: Rational, b: Rational, cc: Rational, d: Rational) =>
    `\\begin{vmatrix} ${L(a)} & ${L(b)} \\\\ ${L(cc)} & ${L(d)} \\end{vmatrix}`;
  const area = norm(c);
  return [
    {
      title: 'Planteamos el determinante simbólico',
      detail:
        'La primera fila son los vectores canónicos; las otras dos son las componentes de u y v.',
      math: [
        `\\vec{u}\\times\\vec{v} = \\begin{vmatrix} \\hat{\\imath} & \\hat{\\jmath} & \\hat{k} \\\\ ${L(ux)} & ${L(uy)} & ${L(uz)} \\\\ ${L(vx)} & ${L(vy)} & ${L(vz)} \\end{vmatrix}`,
      ],
    },
    {
      title: 'Expandimos por cofactores sobre la primera fila',
      math: [
        `= \\hat{\\imath}${det2(uy, uz, vy, vz)} - \\hat{\\jmath}${det2(ux, uz, vx, vz)} + \\hat{k}${det2(ux, uy, vx, vy)}`,
        `= \\hat{\\imath}\\left[${P(uy)}${P(vz)} - ${P(uz)}${P(vy)}\\right] - \\hat{\\jmath}\\left[${P(ux)}${P(vz)} - ${P(uz)}${P(vx)}\\right] + \\hat{k}\\left[${P(ux)}${P(vy)} - ${P(uy)}${P(vx)}\\right]`,
      ],
    },
    {
      title: 'Resultado',
      detail: 'El vector obtenido es perpendicular tanto a u como a v.',
      math: [
        `\\vec{u}\\times\\vec{v} = ${P(c[0])}\\hat{\\imath} + ${P(c[1])}\\hat{\\jmath} + ${P(c[2])}\\hat{k} = ${col(c)}`,
      ],
      tone: 'result',
    },
    {
      title: 'Área del paralelogramo',
      detail: 'Es la norma del producto cruz.',
      math: [
        `A = \\|\\vec{u}\\times\\vec{v}\\| = \\sqrt{${c.map((x) => `${P(x)}^2`).join(' + ')}} = \\sqrt{${L(normSquared(c))}} = ${area.toLatex()}`,
        `A \\approx ${area.toNumber().toFixed(4)}`,
      ],
      tone: 'result',
    },
  ];
}

export function unitSteps(v: Vec3, name: string): Step[] {
  const n = norm(v);
  if (n.isZero()) {
    return [
      {
        title: `$\\vec{${name}}$ es el vector cero`,
        detail:
          'No tiene vector unitario ni cosenos directores porque habría una división entre cero.',
        tone: 'warning',
      },
    ];
  }
  const comps = v.map((c) => Surd.divide(c, n));
  const angles = ['\\alpha', '\\beta', '\\gamma'];
  const axes = ['x', 'y', 'z'];
  return [
    {
      title: `Vector unitario $\\hat{${name}}$`,
      detail:
        'Dividimos cada componente entre la norma; el resultado apunta en la misma dirección y mide 1.',
      math: [
        `\\hat{${name}} = \\frac{1}{\\|\\vec{${name}}\\|}\\vec{${name}} = \\frac{1}{${n.toLatex()}}${col(v)}`,
        `\\hat{${name}} = \\begin{pmatrix} ${comps.map((c) => c.toLatex()).join(' \\\\ ')} \\end{pmatrix}`,
      ],
      tone: 'result',
    },
    {
      title: 'Cosenos directores',
      detail:
        'Son los cosenos de los ángulos que forma el vector con cada eje; coinciden con las componentes del unitario.',
      math: comps.map(
        (c, i) =>
          `\\cos${angles[i]} = \\frac{${name}_${axes[i]}}{\\|\\vec{${name}}\\|} = ${c.toLatex()} \\;\\Rightarrow\\; ${angles[i]} \\approx ${((Math.acos(Math.max(-1, Math.min(1, c.toNumber()))) * 180) / Math.PI).toFixed(2)}^{\\circ}`,
      ),
    },
  ];
}

/** Ecuaciones vectorial, paramétricas y simétricas de la recta que pasa por P0 con dirección d. */
export function lineSteps(p0: Vec3, d: Vec3): Step[] {
  const axes = ['x', 'y', 'z'];
  const sum = p0.map((p, i) => linearCombinationLatex(p, [{ coef: d[i], symbol: 't' }]));
  const steps: Step[] = [
    {
      title: 'Ecuación vectorial',
      detail: 'Al punto fijo le sumamos el vector director multiplicado por un parámetro t.',
      math: [
        '\\vec{r}(t) = \\vec{P}_0 + t\\,\\vec{d}',
        `\\vec{r}(t) = ${col(p0)} + t${col(d)} = \\begin{pmatrix} ${sum.join(' \\\\ ')} \\end{pmatrix}`,
      ],
    },
    {
      title: 'Ecuaciones paramétricas',
      detail: 'Separamos la ecuación vectorial componente por componente.',
      math: sum.map((s, i) => `${axes[i]} = ${s}`),
    },
  ];

  if (d.every((c) => !c.isZero())) {
    const parts = p0.map((p, i) => {
      const num = p.isZero()
        ? axes[i]
        : `${axes[i]} ${p.isNegative() ? '+' : '-'} ${p.abs().toLatex()}`;
      return `\\frac{${num}}{${L(d[i])}}`;
    });
    steps.push({
      title: 'Ecuaciones simétricas',
      detail: 'Despejamos t de cada paramétrica e igualamos.',
      math: [parts.join(' = ')],
      tone: 'result',
    });
  } else if (d.every((c) => c.isZero())) {
    steps.push({
      title: 'El vector director no puede ser cero',
      detail: 'Con d = 0 no hay dirección y la "recta" se reduce a un punto.',
      tone: 'warning',
    });
  } else {
    steps.push({
      title: 'Sin forma simétrica completa',
      detail:
        'Alguna componente del vector director es cero, así que esa coordenada queda fija y no se puede despejar t de ella.',
    });
  }
  return steps;
}

/** Ecuación general del plano con normal n que pasa por P0. */
export function planeSteps(p0: Vec3, n: Vec3): Step[] {
  if (n.every((c) => c.isZero())) {
    return [
      {
        title: 'El vector normal no puede ser cero',
        detail: 'Sin una dirección perpendicular no queda definido un plano.',
        tone: 'warning',
      },
    ];
  }
  const axes = ['x', 'y', 'z'];
  const d = dot(n, p0).neg();
  const shifted = p0.map((p, i) =>
    p.isZero()
      ? axes[i]
      : `\\left(${axes[i]} ${p.isNegative() ? '+' : '-'} ${p.abs().toLatex()}\\right)`,
  );
  const lhs = linearCombinationLatex(
    Rational.ZERO,
    n.map((c, i) => ({ coef: c, symbol: axes[i] })),
  );
  const full = d.isZero() ? lhs : `${lhs} ${d.isNegative() ? '-' : '+'} ${d.abs().toLatex()}`;
  return [
    {
      title: 'Condición de perpendicularidad',
      detail:
        'Todo vector que va de P0 a un punto (x, y, z) del plano es perpendicular a la normal.',
      math: [
        '\\vec{n}\\cdot\\left(\\vec{x} - \\vec{P}_0\\right) = 0',
        `${col(n)}\\cdot\\left[\\begin{pmatrix} x \\\\ y \\\\ z \\end{pmatrix} - ${col(p0)}\\right] = 0`,
      ],
    },
    {
      title: 'Desarrollamos el producto punto',
      math: [`${n.map((c, i) => `${P(c)}${shifted[i]}`).join(' + ')} = 0`],
    },
    {
      title: 'Ecuación general del plano',
      math: [`${full} = 0`],
      tone: 'result',
    },
  ];
}
