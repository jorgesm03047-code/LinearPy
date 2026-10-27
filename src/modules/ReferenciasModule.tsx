import React from 'react';
import { ModuleHeading } from '../components/ui/Workspace';

interface VideoCardProps {
  title: string;
  url: string;
  author: string;
  desc: string;
}

const VideoCard: React.FC<VideoCardProps> = ({ title, url, author, desc }) => (
  <a href={url} target="_blank" rel="noopener noreferrer" className="resource-row">
    <div>
      <span className="resource-author">{author}</span>
      <h3>{title}</h3>
      <p>{desc}</p>
      <small>Video externo · Abre en una pestaña nueva</small>
    </div>
    <span aria-hidden="true">↗</span>
  </a>
);

/**
 * Vista de referencias y materiales didácticos recomendados.
 */
export const ReferenciasModule: React.FC = () => {
  return (
    <div>
      <ModuleHeading chapter="Biblioteca" title="Otra forma de comprender">
        Videos y explicaciones para conectar el cálculo con su intuición geométrica.
      </ModuleHeading>
      {/* Capitulo 1 */}
      <div className="resource-section">
        <h3 style={{ color: 'var(--navy-900)', marginBottom: 'var(--s-4)' }}>
          Capítulo 1: Vectores y Geometría Analítica
        </h3>
        <VideoCard
          title="Vectores: qué son y para qué sirven (Cap. 1)"
          url="https://www.youtube.com/watch?v=fNk_zzaMoSs"
          author="3Blue1Brown"
          desc="Introducción visual a los vectores desde múltiples perspectivas: geométrica, matricial y algebraica en el espacio euclidiano."
        />
        <VideoCard
          title="Combinaciones lineales, span y bases (Cap. 2)"
          url="https://www.youtube.com/watch?v=k7RM-ot2NWY"
          author="3Blue1Brown"
          desc="Intuición geométrica del espacio generado por un conjunto de vectores y significado fundamental de una base."
        />
        <VideoCard
          title="Producto punto y producto cruz (Cap. 9 y 10)"
          url="https://www.youtube.com/watch?v=LyGKycYT2v0"
          author="3Blue1Brown"
          desc="Visualización del producto escalar como proyección y del producto vectorial como área orientada del paralelogramo."
        />
        <VideoCard
          title="Ecuaciones de rectas y planos en el espacio"
          url="https://www.youtube.com/watch?v=_MVr1-ys1cs"
          author="Professor Leonard"
          desc="Derivación detallada paso a paso de la ecuación vectorial, paramétrica y simétrica de la recta y de la ecuación general del plano."
        />
      </div>

      {/* Capitulo 2 */}
      <div className="resource-section">
        <h3 style={{ color: 'var(--navy-900)', marginBottom: 'var(--s-4)' }}>
          Capítulo 2: Matrices y Sistemas de Ecuaciones Lineales
        </h3>
        <VideoCard
          title="Eliminación Gaussiana y método de Gauss-Jordan"
          url="https://www.youtube.com/watch?v=eYSASx8_nyg"
          author="Khan Academy"
          desc="Procedimiento riguroso de operaciones elementales por fila para obtener la forma escalonada reducida (RREF)."
        />
        <VideoCard
          title="Determinantes y factor de escala de áreas (Cap. 6)"
          url="https://www.youtube.com/watch?v=Ip3X9LOh2dk"
          author="3Blue1Brown"
          desc="Interpretación geométrica del determinante como el factor por el cual una matriz escala áreas o volúmenes."
        />
        <VideoCard
          title="Matriz inversa y sistemas de ecuaciones"
          url="https://www.youtube.com/watch?v=uQhTuRlWMxw"
          author="3Blue1Brown"
          desc="Condición de invertibilidad y relación directa con la unicidad de solución de un sistema lineal."
        />
      </div>

      {/* Capitulo 3 */}
      <div className="resource-section">
        <h3 style={{ color: 'var(--navy-900)', marginBottom: 'var(--s-4)' }}>
          Capítulo 3: Transformaciones Lineales
        </h3>
        <VideoCard
          title="Transformaciones lineales (Cap. 3)"
          url="https://www.youtube.com/watch?v=kYB8IZa5AuE"
          author="3Blue1Brown"
          desc="Animación de cómo las matrices transforman el plano preservando el origen y la condición de paralelismo de las líneas de cuadrícula."
        />
        <VideoCard
          title="Núcleo (Kernel), Imagen y Teorema de la Dimensión"
          url="https://www.youtube.com/watch?v=JVDrlTdzxiI"
          author="MIT OpenCourseWare"
          desc="Gilbert Strang explica la relación fundamental Rango-Nulidad y la estructura de los cuatro subespacios fundamentales."
        />
      </div>

      {/* Capitulo 4 */}
      <div className="resource-section">
        <h3 style={{ color: 'var(--navy-900)', marginBottom: 'var(--s-4)' }}>
          Capítulo 4: Diagonalización y Análisis Espectral
        </h3>
        <VideoCard
          title="Autovalores y Autovectores (Cap. 14)"
          url="https://www.youtube.com/watch?v=PFDu9oVAE-g"
          author="3Blue1Brown"
          desc="Explicación visual de los ejes invariantes bajo transformaciones y el significado geométrico del autovalor."
        />
        <VideoCard
          title="Diagonalización de Matrices y Descomposición A = P D P⁻¹"
          url="https://www.youtube.com/watch?v=mB5HXBCKcEI"
          author="Professor Leonard"
          desc="Construcción explícita de la matriz modal P, la matriz diagonal D y diagnóstico de matrices defectivas."
        />
      </div>
    </div>
  );
};
