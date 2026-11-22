/* Napi emlékeztető naptárfájlként (iCalendar, RFC 5545): a telefon naptára így szerver nélkül jelez.
   Az időpont „lebegő” helyi idő (időzóna nélkül), vagyis a telefon saját idejében értendő. A Kanyar calendar.js-éből. */

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

/* opts: { time: 'HH:MM', start: Date, minutes, days (hány napig ismétlődjön), title, body, now } */
export function buildDailyIcs(opts) {
  const [hh, mm] = String(opts.time || '07:00').split(':').map(Number);
  if (!(hh >= 0 && hh < 24 && mm >= 0 && mm < 60)) throw new Error('Érvénytelen időpont.');
  const now = opts.now || new Date();
  const s = new Date(opts.start || now); s.setHours(hh, mm, 0, 0);
  const e = new Date(s.getTime() + (opts.minutes || 20) * 60000);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Forma//Edzes//HU', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Forma',
    'BEGIN:VEVENT', `UID:forma-daily-${stamp(s)}@forma.app`, `DTSTAMP:${utcStamp(now)}`, `DTSTART:${stamp(s)}`, `DTEND:${stamp(e)}`,
    `RRULE:FREQ=DAILY;COUNT=${Math.max(1, Math.min(366, opts.days || 42))}`,
    `SUMMARY:${icsText(opts.title || 'Forma: mai edzés')}`, `DESCRIPTION:${icsText(opts.body || '')}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsText(opts.title || 'Forma: mai edzés')}`, 'TRIGGER:-PT10M', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'];
  return lines.map(fold).join('\r\n') + '\r\n';
}
