import type { RouteId } from './share';
import type { Lab2DParams } from './transformations';

export interface VectorState {
  tab: 'operaciones' | 'rectas' | 'lab';
  operation?: 'norma' | 'punto' | 'cruz' | 'unitario';
  u: string[];
  v: string[];
  p0: string[];
  d: string[];
}
export interface MatrixState {
  tab: 'operaciones' | 'sel' | 'li';
  operation?: 'gauss' | 'det' | 'inv';
  matrixGrid: string[][];
  selGrid: string[][];
  liGrid: string[][];
}
export interface TransformState {
  tab: 'subespacios' | 'lab';
  tfGrid: string[][];
  labParams: Lab2DParams;
}
export interface EigenState {
  grid: string[][];
}
export interface Exercises {
  vectores: VectorState;
  matrices: MatrixState;
  transformaciones: TransformState;
  diagonalizacion: EigenState;
}
export type ExerciseRoute = keyof Exercises;
export interface ModuleProps {
  initialState?: unknown;
  onStateChange: (state: unknown) => void;
}
export const DEFAULTS: Exercises = {
  vectores: {
    tab: 'operaciones',
    u: ['1', '2', '3'],
    v: ['4', '5', '6'],
    p0: ['1', '-1', '2'],
    d: ['3', '1', '-2'],
  },
  matrices: {
    tab: 'operaciones',
    matrixGrid: [
      ['2', '1', '3'],
      ['0', '-1', '4'],
      ['1', '2', '0'],
    ],
    selGrid: [
      ['1', '1', '2', '9'],
      ['2', '4', '-3', '1'],
      ['3', '6', '-5', '0'],
    ],
    liGrid: [
      ['1', '2', '3'],
      ['2', '4', '6'],
      ['1', '0', '1'],
    ],
  },
  transformaciones: {
    tab: 'subespacios',
    tfGrid: [
      ['1', '2', '0'],
      ['0', '1', '1'],
    ],
    labParams: { angle: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0, reflect: false },
  },
  diagonalizacion: {
    grid: [
      ['4', '1'],
      ['2', '3'],
    ],
  },
};
const object = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const cell = (v: unknown): v is string => typeof v === 'string' && v.length <= 32;
const grid = (v: unknown): v is string[][] =>
  Array.isArray(v) &&
  v.length >= 2 &&
  v.length <= 5 &&
  v.every(
    (row) =>
      Array.isArray(row) &&
      row.length >= 2 &&
      row.length <= 5 &&
      row.length === v[0].length &&
      row.every(cell),
  );
const vector = (v: unknown): v is string[] => Array.isArray(v) && v.length === 3 && v.every(cell);
const tab = (v: unknown, allowed: string[]) => typeof v === 'string' && allowed.includes(v);
export const isExerciseRoute = (route: RouteId): route is ExerciseRoute =>
  Object.prototype.hasOwnProperty.call(DEFAULTS, route);

/** Valida enlaces y borradores antes de usarlos como datos de un ejercicio. */
export function validateExercise(route: RouteId, input: unknown): boolean {
  if (!isExerciseRoute(route) || !object(input)) return false;
  if (route === 'vectores')
    return (
      (input.operation === undefined ||
        tab(input.operation, ['norma', 'punto', 'cruz', 'unitario'])) &&
      tab(input.tab, ['operaciones', 'rectas', 'lab']) &&
      ['u', 'v', 'p0', 'd'].every((k) => vector(input[k]))
    );
  if (route === 'matrices')
    return (
      (input.operation === undefined || tab(input.operation, ['gauss', 'det', 'inv'])) &&
      tab(input.tab, ['operaciones', 'sel', 'li']) &&
      ['matrixGrid', 'selGrid', 'liGrid'].every((k) => grid(input[k]))
    );
  if (route === 'diagonalizacion')
    return grid(input.grid) && input.grid.length === input.grid[0].length;
  const p = input.labParams;
  return (
    tab(input.tab, ['subespacios', 'lab']) &&
    grid(input.tfGrid) &&
    object(p) &&
    typeof p.reflect === 'boolean' &&
    [
      ['angle', -180, 180],
      ['scaleX', 0, 3],
      ['scaleY', 0, 3],
      ['shearX', -2, 2],
      ['shearY', -2, 2],
    ].every(
      ([key, min, max]) =>
        typeof p[key] === 'number' &&
        Number.isFinite(p[key]) &&
        (p[key] as number) >= Number(min) &&
        (p[key] as number) <= Number(max),
    )
  );
}

export function useExercise<R extends ExerciseRoute>(
  route: R,
  props: ModuleProps,
): [Exercises[R], (patch: Partial<Exercises[R]>) => void] {
  const state = (props.initialState ?? DEFAULTS[route]) as Exercises[R];
  return [state, (patch) => props.onStateChange({ ...state, ...patch })];
}

export function readDrafts(): Record<string, unknown> {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem('linearpy:drafts:v1') ?? '{}');
    if (!object(stored)) return {};
    return Object.fromEntries(
      Object.entries(stored).filter(([route, state]) => validateExercise(route as RouteId, state)),
    );
  } catch {
    return {};
  }
}
