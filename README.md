# LinearPy

Laboratorio interactivo de Álgebra Lineal y Geometría Analítica para estudiantes y docentes de la Facultad de Ciencias de la Computación de la BUAP. Creado por Jorge David Santos Marquez.

La interfaz funciona en móvil, tablet y PC. Cada capítulo combina un editor, resultados y procedimientos desplegables. La portada permite explorar una transformación geométrica antes de entrar a los ejercicios.

## Vista previa

![Editor y resultados en PC](docs/previews/desktop.jpg)

[Vista móvil de los resultados](docs/previews/mobile.png)

## Capítulos

- Vectores y geometría: normas, producto punto, ángulos, producto cruz, unitarios, rectas, planos y laboratorio 3D con ratón, tacto o teclado.
- Matrices y sistemas: determinantes, inversas, Gauss-Jordan, clasificación de sistemas e independencia lineal. Incluye navegación por flechas y pegado de celdas tabuladas.
- Transformaciones lineales: núcleo, imagen, rango, nulidad y laboratorio 2D de rotación, escala, cizallamiento y reflexión.
- Diagonalización: polinomio característico, raíces, espacios propios y factorización exacta cuando los autovalores son racionales.
- Biblioteca: recursos audiovisuales organizados por capítulo.

## Ejecutar

Requiere Node.js 24 y npm.

```bash
npm ci
npm run dev
```

Abre la dirección local indicada por Vite, normalmente `http://localhost:5173`.

```bash
npm test
npm run build
npm run preview
npm run format:check
npm run check:comments
```

## Exactitud y límites

El motor algebraico utiliza fracciones exactas con `BigInt` y conserva radicales exactos. Los ángulos, el laboratorio 2D, las escenas geométricas y las raíces numéricas usan aproximaciones identificadas en la interfaz. Las matrices admiten de 2 a 5 filas y columnas; en sistemas, la última columna es el término independiente. La entrada de cada celda está limitada a 32 caracteres.

La diagonalización construye P y D únicamente para un espectro racional completo. Las raíces cuadráticas restantes se muestran en forma exacta; para factores de mayor grado se muestran aproximaciones. La búsqueda de divisores y la simplificación de radicales tienen límites de trabajo para evitar bloquear el navegador con números grandes. Alcanzar un límite no demuestra que una raíz sea irracional. La factorización disponible verifica exactamente P D P⁻¹ = A.

## Ejercicios compartidos y borradores

El botón Compartir genera un enlace y un código QR con los datos y la operación seleccionada. Los enlaces nuevos incluyen una versión de esquema; se aceptan enlaces anteriores con una estructura válida. Los datos recibidos se validan antes de usarse. Los cambios actualizan la URL sin recargar, incluidos los cambios dentro del mismo capítulo.

Los borradores se guardan en el almacenamiento local del navegador. No se envían a un servidor. Si el navegador bloquea el almacenamiento, el ejercicio sigue funcionando y puede compartirse por enlace. No hay cuentas de alumno ni base de datos.

## Estructura

```text
src/core/          Motor matemático, validación y enlaces
src/components/    Controles, procedimientos, navegación y escenas
src/modules/       Los capítulos y la biblioteca
src/styles/        Sistema visual y adaptación de pantallas
tests/             Pruebas de regresión
public/brand/      Identidad institucional
legacy/python/    Versión anterior en Streamlit, preservada como referencia
```

La biblioteca externa de referencias de diseño está fuera del repositorio de la aplicación. `DESIGN.md` contiene la dirección específica de LinearPy y `AGENTS.md` establece las convenciones del código, incluidos comentarios en formato oración y sin separadores decorativos.

## Despliegue

El resultado de `npm run build` se genera en `dist`. Puede alojarse como sitio estático en Cloudflare Pages con comando de compilación `npm run build`, directorio `dist` y Node.js 24. Los capítulos se cargan bajo demanda; Three.js se descarga al abrir el laboratorio 3D. El alojamiento se configura por separado de este repositorio.

## Licencia

MIT. Copyright © 2026 Jorge David Santos Marquez. Los logotipos institucionales identifican el contexto académico del proyecto; no implican una declaración de aval institucional.
