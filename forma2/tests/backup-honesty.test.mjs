import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = readFileSync(new URL('../js/ui/backup-ui.js', import.meta.url), 'utf8');

test('a letöltés indítása nem állítható igazolt fájlmentésnek', () => {
  assert.match(file, /Letöltés indítva\. Ellenőrizd a Fájlok\/Letöltések mappát/);
  assert.match(file, /Utolsó mentésletöltés indítása:/);
  assert.doesNotMatch(file, /toast\('Elmentettem: '/);
});
