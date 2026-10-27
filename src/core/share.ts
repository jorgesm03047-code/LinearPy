import { validateExercise } from './exercise';

/**
 * Enlaces para compartir ejercicios.
 *
 * El estado de cada módulo (valores capturados, pestaña activa, dimensiones) se guarda
 * dentro del propio enlace, después del #. Así no se necesita servidor ni base de datos:
 * quien abre el enlace ve exactamente el mismo ejercicio resuelto.
 *
 * Ejemplo: https://linearpy.pages.dev/#/matrices?d=eyJ0YWIiOiJzZWwifQ
 */

export type RouteId =
  'inicio' | 'vectores' | 'matrices' | 'transformaciones' | 'diagonalizacion' | 'referencias';

export const ROUTES: RouteId[] = [
  'inicio',
  'vectores',
  'matrices',
  'transformaciones',
  'diagonalizacion',
  'referencias',
];

export interface ParsedHash {
  route: RouteId;
  data: unknown;
  invalid?: boolean;
}

/** Codifica texto UTF-8 en base64 apto para URL (sin +, / ni =). */
export function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(encoded: string): string {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeState(state: unknown): string {
  return toBase64Url(JSON.stringify({ version: 1, state }));
}

/** Devuelve null si el texto está dañado; un enlace roto nunca debe tumbar la app. */
export function decodeState(encoded: string): unknown {
  try {
    if (encoded.length > 20000) return null;
    const value: unknown = JSON.parse(fromBase64Url(encoded));
    if (value && typeof value === 'object' && 'version' in value) {
      return value.version === 1 && 'state' in value ? value.state : null;
    }
    return value;
  } catch {
    return null;
  }
}

export function parseHash(hash: string): ParsedHash {
  const clean = hash.replace(/^#\/?/, '');
  const [path, query = ''] = clean.split('?');
  const route = (ROUTES as string[]).includes(path) ? (path as RouteId) : 'inicio';
  const d = new URLSearchParams(query).get('d');
  const decoded = d ? decodeState(d) : null;
  const valid = d ? validateExercise(route, decoded) : true;
  return { route, data: valid ? decoded : null, invalid: !valid };
}

export function buildHash(route: RouteId, data?: unknown): string {
  const base = `#/${route === 'inicio' ? '' : route}`;
  return data === undefined || data === null ? base : `${base}?d=${encodeState(data)}`;
}
