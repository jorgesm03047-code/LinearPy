import { useState } from 'react';
import type { RouteId } from '../core/share';
const CHAPTERS: {
  id: RouteId;
  number: string;
  title: string;
  description: string;
  equation: string;
}[] = [
  {
    id: 'vectores',
    number: '01',
    title: 'Vectores y geometría',
    description: 'Del producto punto a la intuición del espacio.',
    equation: 'u · v',
  },
  {
    id: 'matrices',
    number: '02',
    title: 'Matrices y sistemas',
    description: 'Encuentra soluciones y sigue cada operación.',
    equation: 'Ax = b',
  },
  {
    id: 'transformaciones',
    number: '03',
    title: 'Transformaciones lineales',
    description: 'Mira cómo una matriz cambia el plano.',
    equation: 'T(x)',
  },
  {
    id: 'diagonalizacion',
    number: '04',
    title: 'Diagonalización',
    description: 'Descubre las direcciones que se conservan.',
    equation: 'PDP⁻¹',
  },
];
export function InicioModule({ onNavigate }: { onNavigate: (route: RouteId) => void }) {
  const [shear, setShear] = useState(1);
  const point = (x: number, y: number) => `${120 + (x + shear * y) * 68},${225 - y * 68}`;
  return (
    <div className="home">
      <div className="home-intro">
        <div className="eyebrow">
          Proyecto educativo independiente <span>·</span> Laboratorio de álgebra lineal
        </div>
        <h1>
          Las matemáticas
          <br />
          tienen otra <em>perspectiva.</em>
        </h1>
        <p>
          Escribe un problema. Sigue su razonamiento.
          <br />
          Descubre la geometría detrás de los números.
        </p>
        <a
          className="btn btn-primary"
          href="#/matrices"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onNavigate('matrices');
          }}
        >
          Abrir un ejercicio <span aria-hidden="true">↗</span>
        </a>
        <span className="home-intro-note">Fracciones exactas · Explicaciones paso a paso</span>
      </div>
      <section className="home-experiment" aria-labelledby="experiment-title">
        <div className="experiment-header">
          <span className="experiment-tag">Una idea, en movimiento</span>
          <span className="small-mono">T(x, y) = (x + ky, y)</span>
        </div>
        <svg
          viewBox="0 0 420 320"
          role="img"
          aria-label={`Cizallamiento del cuadrado unitario con factor ${shear}`}
        >
          <defs>
            <pattern id="home-grid" width="34" height="34" patternUnits="userSpaceOnUse">
              <path d="M 34 0 L 0 0 0 34" fill="none" stroke="#e8edf0" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="420" height="320" fill="url(#home-grid)" />
          <path d="M 35 225 H 390 M 120 295 V 30" stroke="#b7c4cc" fill="none" />
          <text x="389" y="244" fill="#667582" fontSize="12">
            x
          </text>
          <text x="104" y="30" fill="#667582" fontSize="12">
            y
          </text>
          <rect
            x="120"
            y="157"
            width="68"
            height="68"
            fill="#eff3f5"
            stroke="#aebcc5"
            strokeDasharray="5 4"
          />
          <polygon
            points={[point(0, 0), point(1, 0), point(1, 1), point(0, 1)].join(' ')}
            fill="#dbeaf2"
            stroke="#176184"
            strokeWidth="2"
          />
          <path d={`M ${point(0, 0)} L ${point(0, 1)}`} stroke="#dc8307" strokeWidth="3" />
          <circle cx="120" cy="225" r="4" fill="#176184" />
          <text x="102" y="245" fontSize="12" fill="#667582">
            0
          </text>
        </svg>
        <div className="experiment-footer">
          <div>
            <h2 id="experiment-title">Una matriz. Otra forma.</h2>
            <p>Mueve el control y transforma el cuadrado.</p>
          </div>
          <label className="experiment-slider">
            Cizallamiento <output>k = {shear}</output>
            <input
              type="range"
              min="-1"
              max="2"
              step="0.1"
              value={shear}
              onChange={(e) => setShear(Number(e.target.value))}
            />
          </label>
        </div>
      </section>
      <section className="chapter-section">
        <div className="section-heading">
          <h2>Elige dónde empezar</h2>
          <span>Cuatro capítulos, muchas conexiones.</span>
        </div>
        <div className="chapter-list">
          {CHAPTERS.map((c) => (
            <a
              href={`#/${c.id}`}
              key={c.id}
              className="chapter-row"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                e.preventDefault();
                onNavigate(c.id);
              }}
            >
              <span className="chapter-number">{c.number}</span>
              <div>
                <h3>{c.title}</h3>
                <p>{c.description}</p>
              </div>
              <span className="chapter-equation" aria-hidden="true">
                {c.equation}
              </span>
              <span className="chapter-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>
      <aside className="home-method">
        <div className="eyebrow">Tu proceso</div>
        <h2>
          El resultado es
          <br />
          solo el comienzo.
        </h2>
        <ol>
          <li>
            <span>01</span>
            <div>
              <strong>Escribe</strong>
              <p>Captura tus datos o parte de un ejemplo.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Comprende</strong>
              <p>Explora cada paso y su explicación.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Comparte</strong>
              <p>Lleva el mismo ejercicio al aula con un enlace o QR.</p>
            </div>
          </li>
        </ol>
        <a
          href="#/referencias"
          onClick={(e) => {
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            onNavigate('referencias');
          }}
        >
          Explorar la biblioteca <span aria-hidden="true">↗</span>
        </a>
      </aside>
    </div>
  );
}
