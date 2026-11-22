import { test } from 'node:test';
import assert from 'node:assert/strict';
import { S, saveSettings } from '../js/ui/data.js';
import { kvGet } from '../js/ui/store.js';

test('gyors egymásutáni beállításírások nem veszítik el egymás mezőit', async () => {
  S.settings = { accepted: true, lang: 'hu' };
  await Promise.all([
    saveSettings({ theme: 'oled' }),
    saveSettings({ density: 'compact' }),
    saveSettings({ homeCards: ['quick', 'last', 'weekly', 'goals'] }),
  ]);
  assert.equal(S.settings.theme, 'oled');
  assert.equal(S.settings.density, 'compact');
  assert.deepEqual(S.settings.homeCards, ['quick', 'last', 'weekly', 'goals']);
  assert.deepEqual(await kvGet('settings'), S.settings);
});
