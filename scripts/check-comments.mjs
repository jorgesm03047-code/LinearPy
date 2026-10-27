import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parsers } from 'prettier/plugins/typescript';

function files(path) {
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? files(join(path, entry.name)) : [join(path, entry.name)],
  );
}
const failures = [];
function check(path, text, start, comment) {
  const plain = comment.replace(/^\/\*+|\*\/$|^\s*\/\/|^\s*\*\s?/gm, '').trim();
  const letters = plain.replace(/[^\p{L}]/gu, '');
  if (/[-=─━═]{4,}/.test(plain) || (letters.length >= 4 && letters === letters.toUpperCase())) {
    failures.push(
      `${path}:${text.slice(0, start).split('\n').length} Usa comentarios en formato oración y sin separadores decorativos.`,
    );
  }
}
for (const path of [...files('src'), ...files('tests'), ...files('scripts'), 'vite.config.ts']) {
  const text = readFileSync(path, 'utf8');
  if (path.endsWith('.css')) {
    for (const match of text.matchAll(/\/\*[\s\S]*?\*\//g))
      check(path, text, match.index, match[0]);
  } else if (/\.(?:tsx?|mjs)$/.test(path)) {
    const ast = await parsers.typescript.parse(text, { filepath: path });
    for (const comment of ast.comments ?? []) {
      check(path, text, comment.range[0], comment.value);
    }
  }
}
if (failures.length) {
  process.stderr.write(failures.join('\n') + '\n');
  process.exitCode = 1;
} else {
  process.stdout.write(
    'Los comentarios usan formato oración y no contienen separadores decorativos.\n',
  );
}
