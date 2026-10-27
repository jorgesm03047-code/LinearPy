import React, { useId, useRef, useState } from 'react';
import { Rational } from '../../core/rational';
interface MatrixGridProps {
  grid: string[][];
  onChange: (grid: string[][]) => void;
  augment?: number;
  label?: string;
  minDim?: number;
  maxDim?: number;
  allowResize?: boolean;
  onResize?: (rows: number, cols: number) => void;
  presets?: { label: string; values: string[][] }[];
  square?: boolean;
}
export function MatrixGrid({
  grid,
  onChange,
  augment = 0,
  label = 'Matriz',
  minDim = 2,
  maxDim = 5,
  allowResize = true,
  onResize,
  presets = [],
  square = false,
}: MatrixGridProps) {
  const id = useId();
  const refs = useRef<HTMLInputElement[][]>([]);
  const [message, setMessage] = useState('');
  const m = grid.length,
    n = grid[0].length;
  const invalid = grid.flatMap((row, r) =>
    row.flatMap((c, col) => (Rational.parse(c) ? [] : [`${r + 1},${col + 1}`])),
  );
  const resize = (rows: number, cols: number) => {
    if (onResize) {
      onResize(rows, cols);
      return;
    }
    onChange(
      Array.from({ length: rows }, (_, i) =>
        Array.from({ length: cols }, (_, j) => {
          if (augment && j === cols - 1) return grid[i]?.[n - 1] ?? '0';
          return j < n - augment ? (grid[i]?.[j] ?? '0') : '0';
        }),
      ),
    );
  };
  const change = (r: number, c: number, value: string) =>
    onChange(grid.map((row, i) => row.map((v, j) => (i === r && j === c ? value : v))));
  const key = (e: React.KeyboardEvent, r: number, c: number) => {
    const moves: Record<string, [number, number]> = {
      ArrowRight: [r, Math.min(n - 1, c + 1)],
      ArrowLeft: [r, Math.max(0, c - 1)],
      ArrowDown: [Math.min(m - 1, r + 1), c],
      ArrowUp: [Math.max(0, r - 1), c],
    };
    const target = moves[e.key];
    if (!target) return;
    e.preventDefault();
    refs.current[target[0]]?.[target[1]]?.focus();
    refs.current[target[0]]?.[target[1]]?.select();
  };
  const paste = (e: React.ClipboardEvent, r: number, c: number) => {
    const text = e.clipboardData.getData('text/plain').trim();
    if (!/[\t\n]/.test(text)) return;
    e.preventDefault();
    const rows = text
      .split(/\r?\n/)
      .slice(0, 5)
      .map((line) => line.split('\t').slice(0, 5));
    const next = grid.map((row) => [...row]);
    rows.forEach((row, i) =>
      row.forEach((v, j) => {
        if (r + i < m && c + j < n) next[r + i][c + j] = v.slice(0, 32);
      }),
    );
    onChange(next);
    setMessage('Datos pegados en las celdas disponibles.');
  };
  return (
    <div className="matrix-editor">
      {allowResize && (
        <div className="matrix-dimensions">
          <label htmlFor={`${id}-rows`}>
            {square ? 'Tamaño' : 'Filas'}
            <select
              id={`${id}-rows`}
              value={m}
              onChange={(e) => resize(Number(e.target.value), square ? Number(e.target.value) : n)}
            >
              {Array.from({ length: maxDim - minDim + 1 }, (_, i) => i + minDim).map((v) => (
                <option key={v} value={v}>
                  {square ? `${v} × ${v}` : v}
                </option>
              ))}
            </select>
          </label>
          {!square && (
            <>
              <span aria-hidden="true">×</span>
              <label htmlFor={`${id}-cols`}>
                {augment ? 'Incógnitas' : 'Columnas'}
                <select
                  id={`${id}-cols`}
                  value={n - augment}
                  onChange={(e) => resize(m, Number(e.target.value) + augment)}
                >
                  {Array.from(
                    { length: maxDim - augment - (augment ? 1 : minDim) + 1 },
                    (_, i) => i + (augment ? 1 : minDim),
                  ).map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
        </div>
      )}
      <div className="matrix-scroll" tabIndex={0} role="region" aria-label={`Editor de ${label}`}>
        <div className="matrix-bracket">
          <table className="matrix-table">
            <caption className="sr-only">
              {label}, {m} filas y {n} columnas
              {augment ? ', última columna de términos independientes' : ''}
            </caption>
            <tbody>
              {grid.map((row, r) => (
                <tr key={r}>
                  {row.map((v, c) => (
                    <td key={c} className={augment && c === n - augment ? 'augmented-cell' : ''}>
                      <input
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        spellCheck={false}
                        maxLength={32}
                        name={`${id}-${r}-${c}`}
                        ref={(el) => {
                          if (!refs.current[r]) refs.current[r] = [];
                          if (el) refs.current[r][c] = el;
                        }}
                        value={v}
                        className="matrix-cell-input"
                        aria-label={`${label}, fila ${r + 1}, ${augment && c === n - 1 ? 'término independiente' : `columna ${c + 1}`}`}
                        aria-invalid={!Rational.parse(v)}
                        aria-describedby={invalid.length ? `${id}-error` : `${id}-help`}
                        onChange={(e) => change(r, c, e.target.value)}
                        onKeyDown={(e) => key(e, r, c)}
                        onPaste={(e) => paste(e, r, c)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="input-hint" id={`${id}-help`}>
        Enteros, decimales o fracciones como 1/2.
        <br />
        Usa las flechas o pega celdas desde una hoja de cálculo.
      </p>
      {invalid.length > 0 && (
        <p className="field-error" id={`${id}-error`} role="status">
          Revisa {invalid.length === 1 ? 'la celda' : 'las celdas'} {invalid.join(' · ')}. Cada
          celda necesita un número válido.
        </p>
      )}
      {message && (
        <p className="input-hint" role="status">
          {message}
        </p>
      )}
      <div className="editor-actions">
        <button
          type="button"
          className="text-button"
          onClick={() => onChange(grid.map((row) => row.map(() => '0')))}
        >
          Poner en cero
        </button>
        <button
          type="button"
          className="text-button"
          onClick={() =>
            onChange(
              grid.map((row, i) => row.map((_, j) => (i === j && j < n - augment ? '1' : '0'))),
            )
          }
        >
          Identidad
        </button>
      </div>
      {presets.length > 0 && (
        <div className="presets">
          <span>Prueba un ejemplo</span>
          {presets.map((preset) => (
            <button
              type="button"
              key={preset.label}
              onClick={() => onChange(preset.values.map((row) => [...row]))}
            >
              {preset.label}
              <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
