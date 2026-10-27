import React, { useEffect, useRef, useState } from 'react';
import type { RouteId } from '../../core/share';

const ITEMS: { id: RouteId; label: string; caption: string; mark: string }[] = [
  { id: 'inicio', label: 'Tu laboratorio', caption: 'Explora y empieza', mark: '⌂' },
  { id: 'vectores', label: 'Vectores y geometría', caption: 'Capítulo 01', mark: '↗' },
  { id: 'matrices', label: 'Matrices y sistemas', caption: 'Capítulo 02', mark: '▦' },
  { id: 'transformaciones', label: 'Transformaciones', caption: 'Capítulo 03', mark: '↔' },
  { id: 'diagonalizacion', label: 'Diagonalización', caption: 'Capítulo 04', mark: 'λ' },
  { id: 'referencias', label: 'Biblioteca', caption: 'Recursos para aprender', mark: '≡' },
];
export const Header: React.FC<{
  currentRoute: RouteId;
  onNavigate: (route: RouteId) => void;
  onOpenShare: () => void;
}> = ({ currentRoute, onNavigate, onOpenShare }) => {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 1100px)').matches);
  useEffect(() => {
    const query = matchMedia('(max-width: 1100px)');
    const change = () => {
      setMobile(query.matches);
      if (!query.matches) setOpen(false);
    };
    query.addEventListener('change', change);
    return () => query.removeEventListener('change', change);
  }, []);
  const menuRef = useRef<HTMLButtonElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const el = sidebarRef.current;
    el?.querySelector<HTMLAnchorElement>('a')?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        menuRef.current?.focus();
      }
      if (e.key === 'Tab' && el) {
        const nodes = Array.from(el.querySelectorAll<HTMLElement>('a,button'));
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', key);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, [open]);
  const navigate = (e: React.MouseEvent<HTMLAnchorElement>, route: RouteId) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    setOpen(false);
    onNavigate(route);
  };
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Saltar al ejercicio
      </a>
      <header className="topbar">
        <div className="topbar-context">
          <button
            className="icon-button mobile-menu"
            type="button"
            ref={menuRef}
            aria-label="Abrir capítulos"
            aria-expanded={open}
            aria-controls="chapter-navigation"
            onClick={() => setOpen(true)}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
          <span className="topbar-product">LinearPy</span>
          <span className="topbar-divider">/</span>
          <span>{ITEMS.find((i) => i.id === currentRoute)?.label}</span>
        </div>
        <button type="button" className="btn btn-outline share-button" onClick={onOpenShare}>
          Compartir <span aria-hidden="true">↗</span>
        </button>
      </header>
      {open && (
        <button
          className="nav-backdrop"
          aria-label="Cerrar capítulos"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="chapter-navigation"
        ref={sidebarRef}
        inert={mobile && !open}
        aria-hidden={mobile && !open}
        className={`sidebar${open ? ' is-open' : ''}`}
        role={open ? 'dialog' : undefined}
        aria-modal={open || undefined}
        aria-label="Capítulos de LinearPy"
      >
        <a href="#/" className="brand" onClick={(e) => navigate(e, 'inicio')}>
          <span className="brand-symbol" aria-hidden="true">
            L<span>·</span>
          </span>
          <span>
            <strong>LinearPy</strong>
            <small>Álgebra en perspectiva</small>
          </span>
        </a>
        <button
          className="icon-button close-navigation"
          aria-label="Cerrar capítulos"
          type="button"
          onClick={() => setOpen(false)}
        >
          ×
        </button>
        <div className="nav-section-label">Espacio de aprendizaje</div>
        <nav aria-label="Navegación principal">
          {ITEMS.map((item) => (
            <a
              key={item.id}
              href={item.id === 'inicio' ? '#/' : `#/${item.id}`}
              onClick={(e) => navigate(e, item.id)}
              className={`nav-item${currentRoute === item.id ? ' active' : ''}`}
              aria-current={currentRoute === item.id ? 'page' : undefined}
            >
              <span className="nav-mark" aria-hidden="true">
                {item.mark}
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.caption}</small>
              </span>
              {currentRoute === item.id && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            Aprende el proceso.
            <br />
            <strong>Comprende el resultado.</strong>
          </p>
          <div className="institution-logos">
            <img src="/brand/buap-logo-positivo.png" alt="BUAP" width="90" height="38" />
            <img
              src="/brand/fcc-logo.png"
              alt="Facultad de Ciencias de la Computación"
              width="40"
              height="40"
            />
          </div>
          <small>Facultad de Ciencias de la Computación</small>
        </div>
      </aside>
    </>
  );
};
