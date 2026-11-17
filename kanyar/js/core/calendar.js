/* Az edzésterv naptárfájlként (iCalendar, RFC 5545): a telefon naptára így szerver nélkül emlékeztet.
   Az időpontok „lebegő” helyi idők (időzóna nélkül), vagyis a telefon saját idejében értendők. */

const pad = n => String(n).padStart(2, '0');
const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
const utcStamp = d => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
/* szövegmezők védése: visszaperjel, pontosvessző, vessző és sortörés */
export const icsText = s => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
/* sorhajtás 75 bájtonként (UTF-8), a folytatósor szóközzel kezdődik */
export function fold(line) {
  const enc = new TextEncoder(), out = [];
  let cur = '', bytes = 0;
  for (const ch of line) {
    const b = enc.encode(ch).length;
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join('\r\n ');
}

/* A program első napja (start) után a megadott hét napjain (0 = vasárnap … 6 = szombat), hetente egy-egy edzés.
   → [{ week, session, date }] időrendben */
export function scheduleDates(weeks, start, weekdays) {
  const days = [...new Set(weekdays)].sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7));
  if (days.length !== 3) throw new Error('Három különböző napot kell választani.');
  const out = [];
  const monday = new Date(start); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  for (let w = 0; w < weeks; w++) {
    days.forEach((wd, i) => {
      const d = new Date(monday); d.setDate(monday.getDate() + w * 7 + ((wd + 6) % 7));
      out.push({ week: w + 1, session: i, date: d });
    });
  }
  /* ami a kezdőnap elé esne, a végére tolódik, hogy mind a 18 edzés meglegyen */
  const s0 = new Date(start); s0.setHours(0, 0, 0, 0);
  const early = out.filter(x => x.date < s0);
  if (early.length) {
    const rest = out.filter(x => x.date >= s0);
    const last = new Date(monday); last.setDate(monday.getDate() + weeks * 7);
    const extra = [];
    for (let i = 0; extra.length < early.length; i++) {
      const d = new Date(last); d.setDate(last.getDate() + Math.floor(i / 3) * 7 + ((days[i % 3] + 6) % 7));
      extra.push(d);
    }
    const all = [...rest.map(x => x.date), ...extra].sort((a, b) => a - b);
    return out.map((x, i) => ({ week: x.week, session: x.session, date: all[i] }));
  }
  return out;
}

/* program: buildProgram eredménye · opts: { start: Date, weekdays: [3 nap], time: 'HH:MM', minutes, title(week, session), body(week, session), url, now } */
export function buildIcs(program, opts) {
  const [hh, mm] = String(opts.time || '18:00').split(':').map(Number);
  const now = opts.now || new Date();
  const dates = scheduleDates(program.weeks.length, opts.start, opts.weekdays);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Kanyar//Edzesterv//HU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Kanyar edzésterv'];
  for (const { week, session, date } of dates) {
    const s = new Date(date); s.setHours(hh, mm, 0, 0);
    const e = new Date(s.getTime() + (opts.minutes || 30) * 60000);
    lines.push('BEGIN:VEVENT',
      `UID:kanyar-${stamp(s)}-${week}-${session}@kanyar.app`,
      `DTSTAMP:${utcStamp(now)}`,
      `DTSTART:${stamp(s)}`, `DTEND:${stamp(e)}`,
      `SUMMARY:${icsText(opts.title(week, session))}`,
      `DESCRIPTION:${icsText(opts.body(week, session))}`,
      ...(opts.url ? [`URL:${opts.url}`] : []),
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(opts.title(week, session))}`, 'TRIGGER:-PT15M', 'END:VALARM',
      'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(fold).join('\r\n') + '\r\n';
}
