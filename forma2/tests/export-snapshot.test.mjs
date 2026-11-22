import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kvSet, itemPut, exportSnapshot, exportAll } from '../js/ui/store.js';

test('export pillanatkép: beállítások, program és naplók közös, másolható állapota', async () => {
  const settings = { accepted: true, lang: 'hu', theme: 'oled' };
  const program = { start: 123, done: 3 };
  await kvSet('settings', settings);
  await kvSet('program', program);
  await itemPut({ id: 'snap-workout-1', kind: 'workout', date: 200, key: 'strengthA', minutes: 22 });
  const snap = await exportSnapshot();
  assert.deepEqual(snap.values.settings, settings);
  assert.deepEqual(snap.values.program, program);
  assert.equal(snap.items.some(i => i.id === 'snap-workout-1'), true);
  snap.values.settings.lang = 'en';
  snap.items.find(i => i.id === 'snap-workout-1').minutes = 99;
  const next = await exportSnapshot();
  assert.equal(next.values.settings.lang, 'hu');
  assert.equal(next.items.find(i => i.id === 'snap-workout-1').minutes, 22);
});

test('v3 export megőrzi a korábbi szerződést az egyetlen pillanatképpel', async () => {
  const exportData = await exportAll();
  assert.equal(exportData.app, 'forma');
  assert.equal(exportData.version, 3);
  assert.equal(exportData.items.some(i => i.id === 'snap-workout-1'), true);
  assert.equal(exportData.settings.lang, 'hu');
  assert.deepEqual(exportData.program, { start: 123, done: 3 });
});
