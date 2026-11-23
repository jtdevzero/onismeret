import { test } from 'node:test';
import assert from 'node:assert/strict';
import { MUSCLE_GUIDE, muscleGuide } from '../js/core/muscle-guide.js';

test('mind a hét izomterület rövid kalauza magyarul és angolul teljes', () => {
  assert.equal(Object.keys(MUSCLE_GUIDE).length, 7);
  for (const [area, versions] of Object.entries(MUSCLE_GUIDE)) {
    for (const locale of ['hu', 'en']) {
      const guide = muscleGuide(area, locale);
      assert.deepEqual(guide, versions[locale]);
      for (const key of ['title', 'about', 'moves', 'tip']) assert.ok(typeof guide[key] === 'string' && guide[key].length >= (key === 'title' ? 3 : 8), `${area}/${locale}/${key}`);
    }
  }
  assert.equal(muscleGuide('unknown'), null);
  assert.equal(muscleGuide('chest', 'xx').title, MUSCLE_GUIDE.chest.hu.title);
});
