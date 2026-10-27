export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer-meta">
        <span>LinearPy · Proyecto educativo independiente</span>
        <span>Jorge David Santos Marquez · Licencia MIT</span>
      </div>
      <details className="site-footer-terms">
        <summary>Condiciones de uso e identidad visual</summary>
        <div>
          <p>
            LinearPy sirve para aprender y practicar. Verifica los procedimientos antes de usar los
            resultados en una entrega; algunas vistas y operaciones son aproximadas.
          </p>
          <p>
            Los logotipos de BUAP y FCC aparecen solo como referencia visual del contexto académico.
            El sitio no representa a esas instituciones ni implica afiliación, aval o respaldo. Las
            marcas pertenecen a sus titulares; este aviso no sustituye las autorizaciones que puedan
            requerirse para usar la identidad gráfica institucional. Consulta el{' '}
            <a
              href="https://comunicacion.buap.mx/sites/default/files/IdentidadGrafica/manual-identidad-buap.pdf"
              target="_blank"
              rel="noreferrer"
            >
              Manual de Identidad Gráfica de BUAP
            </a>
            .
          </p>
          <p>La licencia MIT del código no incluye las marcas ni los logotipos institucionales.</p>
        </div>
      </details>
    </footer>
  );
}
