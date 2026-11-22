/* Mentés-emlékeztető. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { backupStatus, backupFileName, BACKUP_EVERY_DAYS } from '../js/core/backup-reminder.js';

const DAY = 86400000, NOW = new Date(2026, 10, 22, 12).getTime();

test('kevés adatnál nem szól; mentés nélkül vagy 14 nap után igen', () => {
  assert.equal(backupStatus({ itemCount: 2, now: NOW }).due, false);
  assert.deepEqual(backupStatus({ itemCount: 3, now: NOW }), { due: true, daysSince: null, never: true });
  assert.equal(backupStatus({ itemCount: 10, lastBackup: NOW - 13 * DAY, now: NOW }).due, false);
  assert.equal(backupStatus({ itemCount: 10, lastBackup: NOW - BACKUP_EVERY_DAYS * DAY, now: NOW }).due, true);
});

test('„Később” után a halasztás idejéig nem szól', () => {
  assert.equal(backupStatus({ itemCount: 10, now: NOW, dismissedUntil: NOW + DAY }).due, false);
  assert.equal(backupStatus({ itemCount: 10, now: NOW, dismissedUntil: NOW - 1 }).due, true);
});

test('dátumos fájlnév, hogy a mentések ne írják felül egymást', () => {
  assert.equal(backupFileName(NOW), 'forma-mentes-2026-11-22.json');
});
