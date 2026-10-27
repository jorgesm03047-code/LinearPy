# Revisión de la renovación

## Comprobaciones locales

- Compilación de producción con TypeScript y Vite.
- 30 pruebas de regresión de aritmética, vectores, matrices, sistemas, subespacios, raíces y enlaces.
- Verificación del formato y de comentarios en formato oración, sin separadores decorativos.
- Inspección visual de la compilación de producción en 1440, 768 y 390 píxeles: cero fallos del inspector.
- Navegación móvil, alternancia entre entrada y resultado, QR, cierre del diálogo con Escape, edición de valores, enlaces distintos dentro del mismo capítulo y controles de órbita y zoom 3D.

## Alcance de las advertencias

El inspector visual genérico identifica MathML y KaTeX como fuentes adicionales. Se conservan porque las expresiones matemáticas necesitan su tipografía y representación accesible. También interpreta matrices como gráficos y pide un color para series; la notación algebraica se mantiene en tinta, con énfasis de color para pivotes y selecciones. Las cifras de controles y salidas usan números tabulares, aunque el detector no reconoce los números de MathML.

Vite advierte que el bloque de Three.js supera 500 kB sin comprimir. Se carga bajo demanda al abrir la escena 3D y no forma parte de la descarga inicial de la portada.

Las capturas de `previews/` documentan la distribución en PC y una vista móvil de resultados. La revisión automática no sustituye pruebas con usuarios ni una auditoría completa con lectores de pantalla reales.

## Exportación PDF de la versión 3.1

Se añadieron 11 comprobaciones sobre el documento y su descarga: selección de datos y operaciones, pasos cerrados, sistemas incompatibles, rectas y planos, transformaciones, límites de diagonalización, rechazo de entradas inválidas, paginación y limpieza tras errores. El total es de 41 pruebas.

El PDF A4 conserva las fórmulas como imágenes de bloques y ofrece un enlace interactivo al ejercicio original. Las dependencias de captura y PDF se cargan al solicitar la exportación. La descarga incluye un enlace alternativo para abrir el archivo en el visor del navegador. La escena WebGL se consulta desde el enlace; la vista 2D se incorpora como imagen.

El contenido del ejercicio se rasteriza por bloques, por lo que sus datos, fórmulas y explicaciones no son texto seleccionable. El encabezado, la numeración y el enlace sí se incorporan directamente al PDF.

Las pruebas de generación usan una imagen controlada y medidas simuladas para comprobar el archivo, los metadatos y el enlace. La revisión visual de una descarga real en PC, tablet y móvil sigue pendiente: el navegador rechazó el acceso a la vista local y se acordó continuar sin él. Las capturas de la renovación anterior no validan esta función nueva.
