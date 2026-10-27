import React, { lazy, Suspense, useEffect, useState } from 'react';
import { buildHash, parseHash, type RouteId } from './core/share';
import { DEFAULTS, isExerciseRoute, readDrafts, validateExercise } from './core/exercise';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ShareModal } from './components/share/ShareModal';
import { InicioModule } from './modules/InicioModule';
const VectoresModule = lazy(() =>
  import('./modules/VectoresModule').then((m) => ({ default: m.VectoresModule })),
);
const MatricesModule = lazy(() =>
  import('./modules/MatricesModule').then((m) => ({ default: m.MatricesModule })),
);
const TransformacionesModule = lazy(() =>
  import('./modules/TransformacionesModule').then((m) => ({ default: m.TransformacionesModule })),
);
const DiagonalizacionModule = lazy(() =>
  import('./modules/DiagonalizacionModule').then((m) => ({ default: m.DiagonalizacionModule })),
);
const ReferenciasModule = lazy(() =>
  import('./modules/ReferenciasModule').then((m) => ({ default: m.ReferenciasModule })),
);
export const App: React.FC = () => {
  const [route, setRoute] = useState<RouteId>('inicio');
  const [states, setStates] = useState<Record<string, unknown>>(() => ({
    ...DEFAULTS,
    ...readDrafts(),
  }));
  const [notice, setNotice] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  useEffect(() => {
    const handleHash = () => {
      const parsed = parseHash(window.location.hash);
      setRoute(parsed.route);
      if (parsed.invalid)
        setNotice(
          'El enlace no contiene un ejercicio válido. Cargamos tus datos guardados o un ejemplo para empezar.',
        );
      else if (parsed.data && validateExercise(parsed.route, parsed.data)) {
        setStates((prev) => ({ ...prev, [parsed.route]: parsed.data }));
        setNotice('Ejercicio compartido cargado. Puedes editarlo y explorar el procedimiento.');
      } else setNotice('');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        localStorage.setItem('linearpy:drafts:v1', JSON.stringify(states));
      } catch {
        /* El ejercicio sigue disponible aunque el navegador no permita guardar. */
      }
    }, 350);
    return () => window.clearTimeout(id);
  }, [states]);
  const update = (state: unknown) => {
    if (validateExercise(route, state)) {
      setStates((prev) => ({ ...prev, [route]: state }));
      history.replaceState(null, '', buildHash(route, state));
    }
  };
  const navigate = (next: RouteId) => {
    window.location.hash = buildHash(next);
    setRoute(next);
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(() => document.getElementById('main-content')?.focus());
  };
  return (
    <div className="app-container">
      <Header
        currentRoute={route}
        onNavigate={navigate}
        onOpenShare={() =>
          setShareUrl(
            `${location.origin}${location.pathname}${buildHash(route, isExerciseRoute(route) ? states[route] : undefined)}`,
          )
        }
      />
      <main className="main-content" id="main-content" tabIndex={-1}>
        {notice && (
          <div className="notice" role="status">
            <span>{notice}</span>
            <button
              type="button"
              className="icon-button"
              aria-label="Cerrar aviso"
              onClick={() => setNotice('')}
            >
              ×
            </button>
          </div>
        )}
        <Suspense
          fallback={
            <div className="loading-state" role="status">
              Preparando tu espacio de trabajo…
            </div>
          }
        >
          {route === 'inicio' && <InicioModule onNavigate={navigate} />}
          {route === 'vectores' && (
            <VectoresModule initialState={states.vectores} onStateChange={update} />
          )}
          {route === 'matrices' && (
            <MatricesModule initialState={states.matrices} onStateChange={update} />
          )}
          {route === 'transformaciones' && (
            <TransformacionesModule initialState={states.transformaciones} onStateChange={update} />
          )}
          {route === 'diagonalizacion' && (
            <DiagonalizacionModule initialState={states.diagonalizacion} onStateChange={update} />
          )}
          {route === 'referencias' && <ReferenciasModule />}
        </Suspense>
      </main>
      <Footer />
      <ShareModal isOpen={!!shareUrl} url={shareUrl} onClose={() => setShareUrl('')} />
    </div>
  );
};
