'use strict';
const { randomInt } = require('node:crypto');
const { questions } = require('./questions.js');
function deck(settings = {}) {
  const films = settings.films;
  if (!Array.isArray(films) || !films.length || films.some(n => !Number.isInteger(n) || n < 1 || n > 8)) throw new Error('Válassz legalább egy filmrészt!');
  if (!['mixed', 'choice', 'picture', 'number'].includes(settings.mode)) throw new Error('Ismeretlen kérdéstípus.');
  if (![5, 10, 15, 20, 40].includes(settings.count) || ![20, 30, 45, 60].includes(settings.seconds)) throw new Error('Hibás körbeállítás.');
  const pool = questions.filter(q => films.includes(q.film) && (settings.mode === 'mixed' || q.type === settings.mode));
  for (let i = pool.length - 1; i > 0; i--) { const j = randomInt(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, settings.count).map(q => {
    if (q.type === 'number') return { ...q };
    const order = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) { const j = randomInt(i + 1); [order[i], order[j]] = [order[j], order[i]]; }
    return { ...q, options: order.map(i => q.options[i]), answer: order.indexOf(q.answer) };
  });
}
function validAnswer(q, answer) {
  return typeof answer === 'number' && Number.isFinite(answer) && (q.type === 'number' ? answer >= 0 && answer <= 1000000 : Number.isInteger(answer) && answer >= 0 && answer < 4);
}
function points(q, answer) { return q.type === 'number' ? Math.round(1000 / (1 + Math.abs(q.answer - answer))) : (answer === q.answer ? 1000 : 0); }
function publicQuestion(q) { const { answer, explanation, ...safe } = q; return safe; }
module.exports = { deck, validAnswer, points, publicQuestion };
