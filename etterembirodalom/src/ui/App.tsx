import { useEffect, useState } from 'react';
import { ITEMS, ITEM_ORDER, NEIGHBORHOODS, RECIPES, type ItemKind } from '../data/content';
import { article, money, num, signedMoney, t } from '../i18n';
import { loadGame } from '../persist';
import { IsoView } from '../render/IsoView';
import { B, costPerServing, dishQuality, referencePrice } from '../sim/formulas';
import { clockLabel, isServiceReady, sumLedger, todayProfit } from '../sim/sim';
import type { DayReport, GameState, Staff } from '../sim/types';
import { startLoop, useApp, type Speed } from '../store';

// --- Gyökér ------------------------------------------------------------------

export function App() {
  const game = useApp((s) => s.game);
  const narrow = useNarrow();
  useEffect(() => startLoop(), []);
  useKeyboard();
  if (!game) return <StartScreen />;
  return (
    <div className={`game ${narrow ? 'narrow' : 'wide'}`}>
      <IsoView />
      <TopBar />
      {narrow ? (
        <MobileDock />
      ) : (
        <>
          <BuildBar />
          <SidePanel />
          <Checklist />
        </>
      )}
      <DayEndModal />
      <ToastView />
    </div>
  );
}

function useNarrow(): boolean {
  const query = '(max-width: 899px)';
  const [narrow, setNarrow] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

function useKeyboard() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const st = useApp.getState();
      if (!st.game) return;
      if (e.key === ' ') {
        e.preventDefault();
        st.togglePause();
      } else if (e.key === '1') st.setSpeed(1);
      else if (e.key === '2') st.setSpeed(2);
      else if (e.key === '3') st.setSpeed(4);
      else if (e.key === 'Escape') st.setTool(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

// --- Kezdőképernyő ---------------------------------------------------------------

function StartScreen() {
  const { start, newGame } = useApp();
  const [saved, setSaved] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void loadGame().then((r) => {
      if (!r) return;
      if (r.ok) setSaved(r.state);
      else setError(t('start.loadError', { reason: t(`save.${r.error}`) }));
    });
  }, []);
  return (
    <div className="start">
      <div className="start-card">
        <div className="eyebrow">{t('app.subtitle')}</div>
        <h1>{t('app.title')}</h1>
        <p className="muted">{t('start.hint')}</p>
        <div className="start-actions">
          {saved && (
            <button className="btn primary" onClick={() => start(saved)}>
              {t('start.continue')}
              <span className="btn-sub">{t('start.saveInfo', { day: saved.day, cash: money(saved.cash) })}</span>
            </button>
          )}
          <button className={saved ? 'btn' : 'btn primary'} onClick={newGame}>
            {t('start.new')}
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

// --- Felső sáv ---------------------------------------------------------------------

function useGame(): GameState {
  useApp((s) => s.version);
  return useApp.getState().game!;
}

function TopBar() {
  const g = useGame();
  const { speed, setSpeed, save, notify } = useApp();
  const profit = todayProfit(g);
  const guests = g.groups.reduce((a, gr) => a + gr.members.length, 0);
  const speeds: Speed[] = [0, 1, 2, 4];
  return (
    <header className="topbar">
      <div className="brand">{t('app.title')}</div>
      <div className="stat">
        <span className="label">{t('top.day', { day: g.day })}</span>
        <span className="value mono">{clockLabel(g.time)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.cash')}</span>
        <span className="value mono">{money(g.cash)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.today')}</span>
        <span className={`value mono ${profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(profit)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.reputation')}</span>
        <span className="value">
          <Stars value={g.reputation} /> <span className="mono small">{num(g.reputation)}</span>
        </span>
      </div>
      <div className="stat hide-narrow">
        <span className="label">{t('top.guests')}</span>
        <span className="value mono">{guests}</span>
      </div>
      <div className="spacer" />
      <div className="speed" role="group">
        {speeds.map((s) => (
          <button key={s} className={`seg ${speed === s ? 'on' : ''}`} onClick={() => setSpeed(s)} title={s === 0 ? t('top.pause') : `${s}×`}>
            {s === 0 ? '❚❚' : `${s}×`}
          </button>
        ))}
      </div>
      <button
        className="btn small"
        onClick={() => {
          void save().then(() => notify(t('top.saved')));
        }}
      >
        {t('top.save')}
      </button>
    </header>
  );
}

function Stars({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="stars" aria-label={num(value)}>
      <span className="stars-bg">★★★★★</span>
      <span className="stars-fg" style={{ width: `${pct}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

// --- Építés ------------------------------------------------------------------------

const SWATCH: Record<ItemKind, string> = {
  table: 'var(--burgundy)',
  chair: 'var(--gold)',
  stove: 'var(--slate-600)',
  counter: 'var(--emerald)',
};

function BuildBar() {
  return (
    <aside className="buildbar">
      <h2>{t('build.title')}</h2>
      <BuildTools />
      <p className="hint subtle">{t('build.hint')}</p>
    </aside>
  );
}

function BuildTools() {
  const g = useGame();
  const { tool, setTool } = useApp();
  return (
    <div className="tools">
      {ITEM_ORDER.map((k) => {
        const price = ITEMS[k].price;
        const disabled = g.cash < price;
        return (
          <button key={k} className={`tool ${tool === k ? 'on' : ''}`} disabled={disabled} onClick={() => setTool(tool === k ? null : k)}>
            <span className="swatch" style={{ background: SWATCH[k] }} />
            <span className="tool-text">
              <span className="tool-name">{t(`item.${k}`)}</span>
              <span className="tool-price mono">{money(price)}</span>
            </span>
          </button>
        );
      })}
      <button className={`tool remove ${tool === 'remove' ? 'on' : ''}`} onClick={() => setTool(tool === 'remove' ? null : 'remove')}>
        <span className="swatch hollow" />
        <span className="tool-text">
          <span className="tool-name">{t('build.remove')}</span>
          <span className="tool-price">−{Math.round(B.economy.sellRefund * 100)}%</span>
        </span>
      </button>
      {tool && tool !== 'remove' && <p className="hint tool-desc">{t(`item.${tool}.desc`, { n: B.service.chefParallelDishes })}</p>}
    </div>
  );
}

// --- Oldalpanel --------------------------------------------------------------------

type Tab = 'staff' | 'menu' | 'finance';

function SidePanel() {
  const [tab, setTab] = useState<Tab>('staff');
  return (
    <aside className="panel">
      <nav className="tabs">
        {(['staff', 'menu', 'finance'] as Tab[]).map((k) => (
          <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {t(`tab.${k}`)}
          </button>
        ))}
      </nav>
      <div className="panel-body">
        {tab === 'staff' && <StaffTab />}
        {tab === 'menu' && <MenuTab />}
        {tab === 'finance' && <FinanceTab />}
      </div>
    </aside>
  );
}

function staffStatus(s: Staff): string {
  if (s.role === 'chef') {
    if (s.stoveId === null) return t('staff.status.noStove');
    return s.cooking.length ? t('staff.status.cooking', { n: s.cooking.length }) : t('staff.status.idle');
  }
  return s.task ? t(`staff.status.${s.task.kind}`) : t('staff.status.idle');
}

function SkillBar({ value }: { value: number }) {
  return (
    <span className="skillbar" title={`${t('staff.skill')}: ${value}`}>
      <span style={{ width: `${value}%` }} />
    </span>
  );
}

function StaffTab() {
  const g = useGame();
  const dispatch = useApp((s) => s.dispatch);
  return (
    <>
      <h3>{t('staff.hired')}</h3>
      {g.staff.length === 0 && <p className="muted">{t('staff.none')}</p>}
      <ul className="list">
        {g.staff.map((s) => (
          <li key={s.id} className="row">
            <span className={`role-dot ${s.role}`} />
            <div className="grow">
              <div className="name">{s.name}</div>
              <div className="meta">
                {t(`role.${s.role}`)} · {staffStatus(s)}
              </div>
            </div>
            <div className="right">
              <SkillBar value={s.skill} />
              <div className="meta mono">{t('staff.wage', { wage: money(s.wage) })}</div>
            </div>
          </li>
        ))}
      </ul>
      <h3>{t('staff.candidates')}</h3>
      {g.candidates.length === 0 && <p className="muted">{t('staff.noCandidates')}</p>}
      <ul className="list">
        {g.candidates.map((c) => (
          <li key={c.id} className="row">
            <span className={`role-dot ${c.role}`} />
            <div className="grow">
              <div className="name">{c.name}</div>
              <div className="meta">
                {t(`role.${c.role}`)} · {t('staff.skill')} {c.skill}
              </div>
            </div>
            <div className="right">
              <div className="meta mono">{t('staff.wage', { wage: money(c.wage) })}</div>
              <button className="btn small primary" onClick={() => dispatch({ type: 'hire', candidateId: c.id })}>
                {t('staff.hire')}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function MenuTab() {
  const g = useGame();
  const dispatch = useApp((s) => s.dispatch);
  const chefSkill = Math.max(0, ...g.staff.filter((s) => s.role === 'chef').map((s) => s.skill));
  return (
    <>
      <h3>{t('menu.title')}</h3>
      <p className="hint subtle">{t('menu.hint')}</p>
      <ul className="list">
        {g.menu.map((m) => {
          const recipe = RECIPES.find((r) => r.id === m.recipeId)!;
          const ref = referencePrice(m.recipeId, g.restaurant.neighborhood);
          const cost = costPerServing(m.recipeId, m.ingredient);
          const margin = m.price > 0 ? (m.price - cost) / m.price : 0;
          const q = dishQuality(m.level, m.ingredient, chefSkill);
          return (
            <li key={m.recipeId} className={`menu-row ${m.onMenu ? '' : 'off'}`}>
              <div className="menu-head">
                <label className="check">
                  <input type="checkbox" checked={m.onMenu} onChange={(e) => dispatch({ type: 'setMenu', recipeId: m.recipeId, onMenu: e.target.checked })} />
                  <span className="name">{t(`recipe.${recipe.id}`)}</span>
                </label>
                <PriceInput value={m.price} onCommit={(price) => dispatch({ type: 'setMenu', recipeId: m.recipeId, price })} />
              </div>
              <div className="meta">
                {t('menu.ref', { price: money(ref) })} · {t('menu.cost', { cost: money(cost) })} · {t('menu.margin', { pct: `${Math.round(margin * 100)}%` })}
              </div>
              <div className="meta">{t('menu.quality', { q: num(q * 100, 0) })}</div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function PriceInput({ value, onCommit }: { value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);
  const commit = () => {
    const v = Number(text.replace(/\s/g, ''));
    if (Number.isFinite(v) && v !== value) onCommit(v);
    else setText(String(value));
  };
  return (
    <span className="price-input">
      <input
        aria-label={t('menu.price')}
        value={text}
        inputMode="numeric"
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
      <span>Ft</span>
    </span>
  );
}

function FinanceTab() {
  const g = useGame();
  const rows: [string, number][] = [
    ['finance.revenue', sumLedger(g, ['revenue'])],
    ['finance.ingredients', sumLedger(g, ['ingredients'])],
  ];
  const s = g.today;
  return (
    <>
      <h3>{t('finance.today')}</h3>
      <table className="pl">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}>
              <td>{t(k)}</td>
              <td className="mono num">{signedMoney(v)}</td>
            </tr>
          ))}
          <tr className="muted">
            <td>
              {t('finance.wages')} · {t('finance.atClose')}
            </td>
            <td className="mono num">{signedMoney(-g.staff.reduce((a, x) => a + x.wage, 0))}</td>
          </tr>
          <tr className="muted">
            <td>
              {t('finance.rent')} · {t('finance.atClose')}
            </td>
            <td className="mono num">{signedMoney(-NEIGHBORHOODS[g.restaurant.neighborhood].rentPerDay)}</td>
          </tr>
          <tr className="total">
            <td>{t('finance.profit')}</td>
            <td className={`mono num ${todayProfit(g) >= 0 ? 'pos' : 'neg'}`}>{signedMoney(todayProfit(g))}</td>
          </tr>
          <tr className="muted">
            <td>{t('finance.capex')}</td>
            <td className="mono num">{signedMoney(sumLedger(g, ['purchase', 'refund']))}</td>
          </tr>
        </tbody>
      </table>
      <h3>{t('finance.stats')}</h3>
      <dl className="stats">
        <dt>{t('finance.arrived')}</dt>
        <dd className="mono">{s.arrivedGuests}</dd>
        <dt>{t('finance.served')}</dt>
        <dd className="mono">{s.servedGuests}</dd>
        <dt>{t('finance.leftPatience')}</dt>
        <dd className="mono">{s.leftPatience}</dd>
        <dt>{t('finance.leftPrice')}</dt>
        <dd className="mono">{s.leftPrice}</dd>
        <dt>{t('finance.avgRating')}</dt>
        <dd className="mono">{s.ratingCount ? num(s.ratingSum / s.ratingCount) : '–'}</dd>
      </dl>
      <h3>{t('finance.history')}</h3>
      {g.history.length === 0 ? (
        <p className="muted">{t('finance.noHistory')}</p>
      ) : (
        <table className="pl">
          <tbody>
            {[...g.history].reverse().slice(0, 7).map((r) => (
              <tr key={r.day}>
                <td>{t('top.day', { day: r.day })}</td>
                <td className={`mono num ${r.profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(r.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}

// --- Nyitási ellenőrzőlista -------------------------------------------------------

function Checklist({ compact = false }: { compact?: boolean }) {
  const g = useGame();
  const r = isServiceReady(g);
  const items: [string, boolean][] = [
    ['checklist.table', r.tables > 0 && r.chairs > 0],
    ['checklist.stove', r.stoves > 0],
    ['checklist.counter', r.counters > 0],
    ['checklist.chef', r.chefs > 0],
    ['checklist.waiter', r.waiters > 0],
  ];
  if (items.every(([, ok]) => ok)) return null;
  if (compact) {
    const missing = items.filter(([, ok]) => !ok).map(([k]) => t(k));
    return (
      <div className="checklist-compact">
        <strong>{t('checklist.title')}:</strong> {missing.join(', ')}
      </div>
    );
  }
  return (
    <div className="checklist">
      <h4>{t('checklist.title')}</h4>
      <ul>
        {items.map(([k, ok]) => (
          <li key={k} className={ok ? 'done' : ''}>
            <span className="tick">{ok ? '✓' : ''}</span>
            {t(k)}
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Telefonos dokk -------------------------------------------------------------

type DockTab = 'build' | Tab;

function MobileDock() {
  const [open, setOpen] = useState<DockTab | null>('build');
  const setTool = useApp((s) => s.setTool);
  const tabs: DockTab[] = ['build', 'staff', 'menu', 'finance'];
  const label = (k: DockTab) => (k === 'build' ? t('build.title') : t(`tab.${k}`));
  const toggle = (k: DockTab) => {
    if (k !== 'build') setTool(null);
    setOpen(open === k ? null : k);
  };
  return (
    <>
      {open !== 'staff' && open !== 'menu' && open !== 'finance' && <Checklist compact />}
      {open && (
        <section className={`sheet ${open === 'build' ? 'sheet-build' : 'sheet-tall'}`} aria-label={label(open)}>
          {open !== 'build' && (
            <header className="sheet-head">
              <h2>{label(open)}</h2>
              <button className="btn small" onClick={() => setOpen(null)}>
                {t('sheet.close')}
              </button>
            </header>
          )}
          <div className="sheet-body">
            {open === 'build' && <BuildTools />}
            {open === 'staff' && <StaffTab />}
            {open === 'menu' && <MenuTab />}
            {open === 'finance' && <FinanceTab />}
          </div>
        </section>
      )}
      <nav className="dock">
        {tabs.map((k) => (
          <button key={k} className={`dock-btn ${open === k ? 'on' : ''}`} onClick={() => toggle(k)}>
            {label(k)}
          </button>
        ))}
        <button className="dock-btn icon" onClick={() => window.dispatchEvent(new Event('etterem:refit'))} title={t('view.fit')} aria-label={t('view.fit')}>
          ⤢
        </button>
      </nav>
    </>
  );
}

// --- Napzárás ------------------------------------------------------------------------

function DayEndModal() {
  const g = useGame();
  const dispatch = useApp((s) => s.dispatch);
  if (g.phase !== 'dayEnd' || !g.lastReport) return null;
  const r: DayReport = g.lastReport;
  const tips: string[] = [];
  if (r.stats.servedGuests === 0) tips.push('dayEnd.tips.empty');
  else {
    if (r.stats.leftPatience > r.stats.arrivedGuests * 0.25) tips.push('dayEnd.tips.patience');
    if (r.stats.leftPrice > r.stats.servedGuests * 0.3) tips.push('dayEnd.tips.price');
  }
  const lines: [string, number][] = [
    ['finance.revenue', r.revenue],
    ['finance.ingredients', -r.ingredients],
    ['finance.wages', -r.wages],
    ['finance.rent', -r.rent],
    ['finance.maintenance', -r.maintenance],
  ];
  if (r.marketing) lines.push(['finance.marketing', -r.marketing]);
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className={`eyebrow ${r.profit >= 0 ? 'pos' : 'neg'}`}>{r.profit >= 0 ? t('dayEnd.profitPos') : t('dayEnd.profitNeg')}</div>
        <h2>{t('dayEnd.title', { Article: capitalize(article(r.day)), day: r.day })}</h2>
        <div className="modal-grid">
          <table className="pl">
            <tbody>
              {lines.map(([k, v]) => (
                <tr key={k}>
                  <td>{t(k)}</td>
                  <td className="mono num">{signedMoney(v)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>{t('finance.profit')}</td>
                <td className={`mono num ${r.profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(r.profit)}</td>
              </tr>
            </tbody>
          </table>
          <dl className="stats">
            <dt>{t('finance.arrived')}</dt>
            <dd className="mono">{r.stats.arrivedGuests}</dd>
            <dt>{t('finance.served')}</dt>
            <dd className="mono">{r.stats.servedGuests}</dd>
            <dt>{t('finance.leftPatience')}</dt>
            <dd className="mono">{r.stats.leftPatience}</dd>
            <dt>{t('finance.leftPrice')}</dt>
            <dd className="mono">{r.stats.leftPrice}</dd>
            <dt>{t('finance.leftClosing')}</dt>
            <dd className="mono">{r.stats.leftClosing}</dd>
            <dt>{t('finance.avgRating')}</dt>
            <dd className="mono">{r.avgRating ? num(r.avgRating) : '–'}</dd>
            <dt>{t('top.reputation')}</dt>
            <dd className="mono">{num(r.reputation, 2)}</dd>
          </dl>
        </div>
        {tips.map((k) => (
          <p key={k} className="tip">
            {t(k)}
          </p>
        ))}
        <button className="btn primary wide" onClick={() => dispatch({ type: 'continue' })}>
          {t('dayEnd.continue')}
        </button>
      </div>
    </div>
  );
}

function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function ToastView() {
  const toast = useApp((s) => s.toast);
  if (!toast) return null;
  return (
    <div key={toast.id} className={`toast ${toast.kind}`} role="status">
      {toast.text}
    </div>
  );
}
