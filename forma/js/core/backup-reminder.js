/* Mentés-emlékeztető (tiszta függvény). Minden adat csak a telefonon van, ezért időnként fájlba kell menteni.
   Esedékes, ha van már érdemi adat (legalább 3 bejegyzés), és még nem volt mentés, vagy az utolsó 14 napnál régebbi. */
export const BACKUP_EVERY_DAYS = 14;
const DAY = 86400000;
export function backupStatus({ lastBackup = null, itemCount = 0, now = Date.now(), dismissedUntil = 0 } = {}) {
  const days = Number.isFinite(lastBackup) ? Math.floor((now - lastBackup) / DAY) : null;
  const due = itemCount >= 3 && (days == null || days >= BACKUP_EVERY_DAYS) && !(dismissedUntil > now);
  return { due, daysSince: days, never: days == null };
}
/* mentésfájl neve dátummal, hogy több mentés ne írja felül egymást */
export function backupFileName(now = Date.now()) {
  const d = new Date(now);
  return `forma-mentes-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}.json`;
}
