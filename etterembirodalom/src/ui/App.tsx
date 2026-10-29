import { useEffect, useState } from 'react';
import {
  FLOOR_STYLES,
  ITEMS,
  NEIGHBORHOODS,
  NEIGHBORHOOD_ORDER,
  RECIPES,
  RIVALS,
  WALL_STYLES,
  type FloorStyle,
  type IngredientQuality,
  type ItemKind,
  type WallStyle,
} from '../data/content';
import { article, centsToInput, inputToCents, money, num, signedMoney, t } from '../i18n';
import { loadGame } from '../persist';
import { Scene3D } from '../render3d/Scene3D';
import { CHAPTERS, GOOD_DAY_SERVED, STREAK_RATING, STREAK_SERVED, expectedScore, progress, storyPending, type ChapterDef } from '../sim/campaign';
import { B, costPerServing, dishQuality, referencePrice } from '../sim/formulas';
import { activeRestaurant, clockLabel, empireTodayProfit, isServiceReady, shareOf, sumLedger, todayProfit } from '../sim/sim';
import type { GameState, RestaurantState, Staff } from '../sim/types';
import { startLoop, useApp, type Speed } from '../store';
import { isMusicOn, toggleMusic } from './music';

// --- Gyökér ------------------------------------------------------------------

export function App() {
  const game = useApp((s) => s.game);
  const narrow = useNarrow();
  useEffect(() => startLoop(), []);
  useKeyboard();
  if (!game) return <StartScreen />;
  return (
    <div className={`game ${narrow ? 'narrow' : 'wide'}`}>
      <Scene3D />
      <TopBar />
      <MissionBar />
      {narrow ? (
        <MobileDock />
      ) : (
        <>
          <BuildBar />
          <SidePanel />
        </>
      )}
      <DayEndModal />
      <StoryModal />
      <BankruptModal />
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
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
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

function useGame(): GameState {
  useApp((s) => s.version);
  return useApp.getState().game!;
}

function useRest(): RestaurantState {
  return activeRestaurant(useGame());
}

function capitalize(w: string): string {
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function goalText(def: ChapterDef): string {
  const decimal = def.kind === 'reputation' || def.kind === 'goodDay' || def.kind === 'critic';
  const target = def.kind === 'profit' ? money(def.target) : decimal ? num(def.target) : String(def.target);
  return t(`ch.${def.id}.goal`, { target, served: def.kind === 'cleanStreak' ? STREAK_SERVED : GOOD_DAY_SERVED, rating: num(STREAK_RATING) });
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
          <button className={saved ? 'btn' : 'btn primary'} onClick={() => newGame('campaign')}>
            {t('start.campaign')}
            <span className="btn-sub">{t('start.campaign.sub')}</span>
          </button>
          <button className="btn" onClick={() => newGame('free')}>
            {t('start.free')}
            <span className="btn-sub">{t('start.free.sub')}</span>
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}

// --- Felső sáv ---------------------------------------------------------------------

function TopBar() {
  const g = useGame();
  const r = activeRestaurant(g);
  const { speed, setSpeed, save, notify } = useApp();
  const [music, setMusic] = useState(isMusicOn());
  const profit = empireTodayProfit(g);
  const speeds: Speed[] = [0, 1, 2, 4];
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-name">{r.name}</span>
        <span className="brand-city">{t(`city.${r.neighborhood}`)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.day', { day: g.day })}</span>
        <span className="value mono">{clockLabel(g.time)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.cash')}</span>
        <span className={`value mono ${g.cash < 0 ? 'neg' : ''}`}>{money(g.cash)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.today')}</span>
        <span className={`value mono ${profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(profit)}</span>
      </div>
      <div className="stat">
        <span className="label">{t('top.reputation')}</span>
        <span className="value">
          <Stars value={r.reputation} /> <span className="mono small">{num(r.reputation)}</span>
        </span>
      </div>
      <div className="spacer" />
      <div className="speed" role="group">
        {speeds.map((s) => (
          <button key={s} className={`seg ${speed === s ? 'on' : ''}`} onClick={() => setSpeed(s)} title={s === 0 ? t('top.pause') : `${s}×`}>
            {s === 0 ? '❚❚' : `${s}×`}
          </button>
        ))}
      </div>
      <button className={`btn small icon-btn ${music ? 'on' : ''}`} onClick={() => setMusic(toggleMusic())} aria-pressed={music} title={t('top.music')} aria-label={t('top.music')}>
        ♪
      </button>
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

// --- Küldetéssáv --------------------------------------------------------------------

function MissionBar() {
  const g = useGame();
  const p = progress(g);
  const [contest, setContest] = useState(false);
  if (!p) return null;
  const def = p.def;
  const pct = Math.max(0, Math.min(100, (p.value / p.target) * 100));
  const decimal = def.kind === 'reputation' || def.kind === 'goodDay' || def.kind === 'critic';
  const shown = def.kind === 'profit' ? `${money(p.value)} / ${money(p.target)}` : decimal ? `${num(p.value)} / ${num(p.target)}` : `${Math.round(p.value)} / ${p.target}`;
  return (
    <>
      <div className="missionbar">
        <div className="mission-head">
          <span className="eyebrow">
            {t('mission.chapter', { n: p.chapter + 1 })} · {t(`act.${def.act}`)}
          </span>
          <span className="mission-days mono">{t('mission.days', { day: p.dayOfChapter, total: p.daysTotal })}</span>
        </div>
        <div className="mission-title">{t(`ch.${def.id}.title`)}</div>
        <div className="mission-goal">{goalText(def)}</div>
        <div className="mission-progress">
          <span className="bar">
            <span style={{ width: `${pct}%` }} />
          </span>
          <span className="mono small">{shown}</span>
        </div>
        {def.kind === 'contest' && (
          <button className="btn small primary" onClick={() => setContest(true)}>
            {t('mission.contest')}
          </button>
        )}
      </div>
      {contest && <ContestModal def={def} onClose={() => setContest(false)} />}
    </>
  );
}

function ContestModal({ def, onClose }: { def: ChapterDef; onClose: () => void }) {
  const g = useGame();
  const r = activeRestaurant(g);
  const dispatch = useApp((s) => s.dispatch);
  const chefs = r.staff.filter((x) => x.role === 'chef' && x.trainingDay !== g.day && !x.saboteur);
  const skill = chefs.length ? Math.max(...chefs.map((x) => x.skill)) : 0;
  const options = def.dish ? r.menu.filter((m) => m.recipeId === def.dish) : r.menu;
  const today = g.campaign.contestDay === g.day;
  const last = g.campaign.lastContest;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="eyebrow">{t(`ch.${def.id}.title`)}</div>
        <h2>{t('contest.title')}</h2>
        <p className="muted">{def.dish ? t('contest.required') : t('contest.pick')}</p>
        {last && last.day === g.day && (
          <p className={`tip ${last.win ? 'good' : ''}`}>
            {t('contest.score', { score: last.score, target: last.target })}. {last.win ? t('contest.win') : t('contest.lose')}
          </p>
        )}
        <ul className="list">
          {options.map((m) => (
            <li key={m.recipeId} className="row">
              <div className="grow">
                <div className="name">{t(`recipe.${m.recipeId}`)}</div>
                <div className="meta">
                  {t(`ingredient.${m.ingredient}`)} · {t('contest.expected', { score: expectedScore(dishQuality(m.level, m.ingredient, skill)) })}
                </div>
              </div>
              <button className="btn small primary" disabled={today} onClick={() => dispatch({ type: 'contest', recipeId: m.recipeId })}>
                {t('contest.enter')}
              </button>
            </li>
          ))}
        </ul>
        {today && !last?.win && <p className="hint">{t('contest.today')}</p>}
        <button className="btn wide" onClick={onClose}>
          {t('sheet.close')}
        </button>
      </div>
    </div>
  );
}

// --- Történet --------------------------------------------------------------------

function StoryModal() {
  const g = useGame();
  const dispatch = useApp((s) => s.dispatch);
  if (!storyPending(g)) return null;
  const c = g.campaign;
  if (c.chapter >= CHAPTERS.length) {
    return (
      <div className="modal-backdrop story">
        <div className="modal letter">
          <div className="eyebrow">{t('mission.done')}</div>
          <h2>{t('mission.finalTitle')}</h2>
          <p className="story-text">{t('mission.finalText')}</p>
          <button className="btn primary wide" onClick={() => dispatch({ type: 'seenIntro', chapter: c.chapter })}>
            {t('mission.next')}
          </button>
        </div>
      </div>
    );
  }
  const def = CHAPTERS[c.chapter]!;
  return (
    <div className="modal-backdrop story">
      <div className="modal letter">
        <div className="eyebrow">
          {t('mission.chapter', { n: c.chapter + 1 })} · {t('mission.act', { n: def.act })} · {t(`act.${def.act}`)}
        </div>
        <h2>{t(`ch.${def.id}.title`)}</h2>
        <p className="story-text">{t(`ch.${def.id}.story`)}</p>
        <div className="goal-box">
          <span className="label">{t('mission.goal')}</span>
          <span>{goalText(def)}</span>
        </div>
        <button className="btn primary wide" onClick={() => dispatch({ type: 'seenIntro', chapter: c.chapter })}>
          {t('mission.start')}
        </button>
      </div>
    </div>
  );
}

function BankruptModal() {
  const g = useGame();
  const newGame = useApp((s) => s.newGame);
  if (g.phase !== 'bankrupt') return null;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="eyebrow neg">{t('bankrupt.title')}</div>
        <h2>{t('bankrupt.title')}</h2>
        <p>{t('bankrupt.text')}</p>
        <button className="btn primary wide" onClick={() => newGame(g.campaign.mode)}>
          {t('bankrupt.new')}
        </button>
      </div>
    </div>
  );
}

// --- Építés ------------------------------------------------------------------------

const SWATCH: Record<ItemKind, string> = {
  table: 'var(--burgundy)',
  chair: 'var(--gold)',
  stove: 'var(--slate-600)',
  counter: 'var(--emerald)',
  plant: '#4d7c3a',
  lamp: '#e8c76a',
  wine: '#3f2615',
  aquarium: '#7cc4e8',
  piano: '#0b0b0f',
};

const FURNITURE: ItemKind[] = ['table', 'chair', 'stove', 'counter'];
const DECOR: ItemKind[] = ['plant', 'lamp', 'wine', 'aquarium', 'piano'];

function BuildBar() {
  return (
    <aside className="buildbar">
      <h2>{t('build.title')}</h2>
      <Checklist />
      <BuildTools />
      <StylePicker />
      <p className="hint subtle">{t('build.hint')}</p>
    </aside>
  );
}

function ToolButton({ k }: { k: ItemKind }) {
  const g = useGame();
  const { tool, setTool } = useApp();
  const price = ITEMS[k].price;
  return (
    <button className={`tool ${tool === k ? 'on' : ''}`} disabled={g.cash < price} onClick={() => setTool(tool === k ? null : k)}>
      <span className="swatch" style={{ background: SWATCH[k] }} />
      <span className="tool-text">
        <span className="tool-name">{t(`item.${k}`)}</span>
        <span className="tool-price mono">{money(price)}</span>
      </span>
    </button>
  );
}

function BuildTools({ withStyle = false }: { withStyle?: boolean }) {
  const { tool, setTool } = useApp();
  return (
    <>
    <div className="tools">
      <div className="tool-group-label">{t('build.furniture')}</div>
      {FURNITURE.map((k) => (
        <ToolButton key={k} k={k} />
      ))}
      <div className="tool-group-label">{t('build.decor')}</div>
      {DECOR.map((k) => (
        <ToolButton key={k} k={k} />
      ))}
      <button className={`tool remove ${tool === 'remove' ? 'on' : ''}`} onClick={() => setTool(tool === 'remove' ? null : 'remove')}>
        <span className="swatch hollow" />
        <span className="tool-text">
          <span className="tool-name">{t('build.remove')}</span>
          <span className="tool-price">−{Math.round((1 - B.economy.sellRefund) * 100)}%</span>
        </span>
      </button>
      {tool && tool !== 'remove' && <p className="hint tool-desc">{t(`item.${tool}.desc`, { n: B.service.chefParallelDishes })}</p>}
    </div>
    {withStyle && <StylePicker />}
    </>
  );
}

function StylePicker() {
  const r = useRest();
  const dispatch = useApp((s) => s.dispatch);
  return (
    <div className="style-picker">
      <div className="tool-group-label">{t('build.floor')}</div>
      <div className="chips">
        {(Object.keys(FLOOR_STYLES) as FloorStyle[]).map((f) => (
          <button key={f} className={`chip ${r.style.floor === f ? 'on' : ''}`} onClick={() => dispatch({ type: 'setStyle', floor: f })}>
            {t(`floor.${f}`)}
            <span className="chip-sub">{r.style.floor === f ? t('build.free') : money(FLOOR_STYLES[f].price)}</span>
          </button>
        ))}
      </div>
      <div className="tool-group-label">{t('build.wall')}</div>
      <div className="chips">
        {(Object.keys(WALL_STYLES) as WallStyle[]).map((w) => (
          <button key={w} className={`chip ${r.style.wall === w ? 'on' : ''}`} onClick={() => dispatch({ type: 'setStyle', wall: w })}>
            {t(`wall.${w}`)}
            <span className="chip-sub">{r.style.wall === w ? t('build.free') : money(WALL_STYLES[w].price)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Oldalpanel --------------------------------------------------------------------

type Tab = 'staff' | 'menu' | 'finance' | 'empire';
const TABS: Tab[] = ['staff', 'menu', 'finance', 'empire'];

function SidePanel() {
  const [tab, setTab] = useState<Tab>('staff');
  return (
    <aside className="panel">
      <nav className="tabs">
        {TABS.map((k) => (
          <button key={k} className={`tab ${tab === k ? 'on' : ''}`} onClick={() => setTab(k)}>
            {t(`tab.${k}`)}
          </button>
        ))}
      </nav>
      <div className="panel-body">
        <TabContent tab={tab} />
      </div>
    </aside>
  );
}

function TabContent({ tab }: { tab: Tab }) {
  if (tab === 'staff') return <StaffTab />;
  if (tab === 'menu') return <MenuTab />;
  if (tab === 'finance') return <FinanceTab />;
  return <EmpireTab />;
}

function staffStatus(g: GameState, s: Staff): string {
  if (s.trainingDay === g.day) return t('staff.inTraining');
  if (s.trainingDay !== null && s.trainingDay > g.day) return t('staff.training');
  if (s.role === 'chef') {
    if (s.stoveId === null) return t('staff.status.noStove');
    return s.cooking.length ? t('staff.status.cooking', { n: s.cooking.length }) : t('staff.status.idle');
  }
  if (s.role === 'cleaner') return s.cleanTimer > 0 ? t('staff.status.cleaning') : t('staff.status.idle');
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
  const r = activeRestaurant(g);
  const dispatch = useApp((s) => s.dispatch);
  return (
    <>
      <h3>{t('staff.hired')}</h3>
      {r.staff.length === 0 && <p className="muted">{t('staff.none')}</p>}
      <ul className="list">
        {r.staff.map((s) => (
          <li key={s.id} className="row wrap">
            <span className={`role-dot ${s.role}`} />
            <div className="grow">
              <div className="name">{s.name}</div>
              <div className="meta">
                {t(`role.${s.role}`)} · {staffStatus(g, s)}
              </div>
            </div>
            <div className="right">
              <SkillBar value={s.skill} />
              <div className="meta mono">{t('staff.wage', { wage: money(s.wage) })}</div>
            </div>
            <div className="row-actions">
              <button className="btn small" disabled={s.skill >= 100 || (s.trainingDay !== null && s.trainingDay >= g.day)} onClick={() => dispatch({ type: 'train', staffId: s.id })}>
                {t('staff.train', { cost: money(B.economy.trainingCost) })}
              </button>
              <button className="btn small danger" onClick={() => dispatch({ type: 'fire', staffId: s.id })}>
                {t('staff.fire')}
              </button>
            </div>
          </li>
        ))}
      </ul>
      <h3>{t('staff.candidates')}</h3>
      {r.candidates.length === 0 && <p className="muted">{t('staff.noCandidates')}</p>}
      <ul className="list">
        {r.candidates.map((c) => (
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

const QUALITIES: IngredientQuality[] = ['cheap', 'normal', 'premium'];

function MenuTab() {
  const g = useGame();
  const r = activeRestaurant(g);
  const dispatch = useApp((s) => s.dispatch);
  const chefSkill = Math.max(0, ...r.staff.filter((s) => s.role === 'chef').map((s) => s.skill));
  return (
    <>
      <h3>{t(`menu.title.${NEIGHBORHOODS[r.neighborhood].favoriteCuisine}`)}</h3>
      <p className="hint subtle">{t('menu.hint')}</p>
      <ul className="list">
        {r.menu.map((m) => {
          const recipe = RECIPES.find((x) => x.id === m.recipeId)!;
          const ref = referencePrice(m.recipeId, r.neighborhood);
          const cost = costPerServing(m.recipeId, m.ingredient);
          const margin = m.price > 0 ? (m.price - cost) / m.price : 0;
          const q = dishQuality(m.level, m.ingredient, chefSkill);
          return (
            <li key={m.recipeId} className={`menu-row ${m.onMenu ? '' : 'off'} ${recipe.lost ? 'lost' : ''}`}>
              <div className="menu-head">
                <label className="check">
                  <input id={`menu-${m.recipeId}`} type="checkbox" checked={m.onMenu} onChange={(e) => dispatch({ type: 'setMenu', recipeId: m.recipeId, onMenu: e.target.checked })} />
                  <span className="name">{t(`recipe.${recipe.id}`)}</span>
                </label>
                <PriceInput id={`price-${m.recipeId}`} value={m.price} onCommit={(price) => dispatch({ type: 'setMenu', recipeId: m.recipeId, price })} />
              </div>
              {recipe.lost && <div className="badge-lost">{t('menu.lost')}</div>}
              <div className="seg-row" role="group" aria-label={t('menu.ingredient')}>
                {QUALITIES.map((qq) => (
                  <button key={qq} className={`seg small ${m.ingredient === qq ? 'on' : ''}`} onClick={() => dispatch({ type: 'setMenu', recipeId: m.recipeId, ingredient: qq })}>
                    {t(`ingredient.${qq}`)}
                  </button>
                ))}
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

function PriceInput({ id, value, onCommit }: { id: string; value: number; onCommit: (v: number) => void }) {
  const [text, setText] = useState(centsToInput(value));
  useEffect(() => setText(centsToInput(value)), [value]);
  const commit = () => {
    const v = inputToCents(text);
    if (Number.isFinite(v) && v !== value) onCommit(v);
    else setText(centsToInput(value));
  };
  return (
    <span className="price-input">
      <input
        id={id}
        aria-label={t('menu.price')}
        value={text}
        inputMode="decimal"
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
      <span>€</span>
    </span>
  );
}

function FinanceTab() {
  const g = useGame();
  const r = activeRestaurant(g);
  const dispatch = useApp((s) => s.dispatch);
  const s = r.today;
  const share = shareOf(g, r);
  const [mkt, setMkt] = useState(centsToInput(r.marketingPerDay));
  useEffect(() => setMkt(centsToInput(r.marketingPerDay)), [r.marketingPerDay, r.id]);
  return (
    <>
      <h3>{t('finance.today')}</h3>
      <table className="pl">
        <tbody>
          <tr>
            <td>{t('finance.revenue')}</td>
            <td className="mono num">{signedMoney(sumLedger(r, ['revenue']))}</td>
          </tr>
          <tr>
            <td>{t('finance.ingredients')}</td>
            <td className="mono num">{signedMoney(sumLedger(r, ['ingredients']))}</td>
          </tr>
          <tr className="muted">
            <td>
              {t('finance.wages')} · {t('finance.atClose')}
            </td>
            <td className="mono num">{signedMoney(-r.staff.reduce((a, x) => a + x.wage, 0))}</td>
          </tr>
          <tr className="muted">
            <td>
              {t('finance.rent')} · {t('finance.atClose')}
            </td>
            <td className="mono num">{signedMoney(-NEIGHBORHOODS[r.neighborhood].rentPerDay)}</td>
          </tr>
          <tr className="muted">
            <td>
              {t('finance.marketing')} · {t('finance.atClose')}
            </td>
            <td className="mono num">{signedMoney(-r.marketingPerDay)}</td>
          </tr>
          <tr className="total">
            <td>{t('finance.profit')}</td>
            <td className={`mono num ${todayProfit(r) >= 0 ? 'pos' : 'neg'}`}>{signedMoney(todayProfit(r))}</td>
          </tr>
        </tbody>
      </table>

      <h3>{t('finance.marketingPerDay')}</h3>
      <p className="hint subtle">{t('finance.marketingHint')}</p>
      <span className="price-input">
        <input
          id="marketing"
          aria-label={t('finance.marketingPerDay')}
          value={mkt}
          inputMode="decimal"
          onChange={(e) => setMkt(e.target.value)}
          onBlur={() => {
            const v = inputToCents(mkt);
            if (Number.isFinite(v)) dispatch({ type: 'setMarketing', perDay: v });
            else setMkt(centsToInput(r.marketingPerDay));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
          }}
        />
        <span>€</span>
      </span>

      <h3>{t('finance.cleanliness')}</h3>
      <Meter value={r.cleanliness} warnBelow={0.6} />
      <p className="hint subtle">{t('finance.cleanHint')}</p>

      <h3>{t('finance.market')}</h3>
      <div className="kv">
        <span>{t('finance.share')}</span>
        <span className="mono">{num(share.share, 2)}×</span>
      </div>
      <div className="tool-group-label">{t('finance.rivals')}</div>
      <ul className="list compact">
        {r.rivals.map((rv) => {
          const def = RIVALS.find((d) => d.id === rv.id)!;
          return (
            <li key={rv.id} className="row">
              <div className="grow">
                <div className="name">{def.name}</div>
                <div className="meta">
                  {t(`cuisine.${def.cuisine}`)} · {t('finance.rivalPrice', { pct: `${Math.round(rv.priceLevel * 100)}%` })}
                </div>
              </div>
              <Stars value={def.reputation} />
            </li>
          );
        })}
      </ul>

      <h3>{t('finance.stats')}</h3>
      <dl className="stats">
        <dt>{t('finance.arrived')}</dt>
        <dd className="mono">{s.arrivedGuests}</dd>
        <dt>{t('finance.served')}</dt>
        <dd className="mono">{s.servedGuests}</dd>
        <dt>{t('finance.happy')}</dt>
        <dd className="mono">{s.happyGuests}</dd>
        <dt>{t('finance.leftPatience')}</dt>
        <dd className="mono">{s.leftPatience}</dd>
        <dt>{t('finance.leftPrice')}</dt>
        <dd className="mono">{s.leftPrice}</dd>
        <dt>{t('finance.avgRating')}</dt>
        <dd className="mono">{s.ratingCount ? num(s.ratingSum / s.ratingCount) : '–'}</dd>
      </dl>
      <h3>{t('finance.history')}</h3>
      {r.history.length === 0 ? (
        <p className="muted">{t('finance.noHistory')}</p>
      ) : (
        <table className="pl">
          <tbody>
            {[...r.history]
              .reverse()
              .slice(0, 7)
              .map((h) => (
                <tr key={h.day}>
                  <td>{t('top.day', { day: h.day })}</td>
                  <td className={`mono num ${h.profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(h.profit)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </>
  );
}

function Meter({ value, warnBelow }: { value: number; warnBelow: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="meter">
      <span className={`meter-fill ${value < warnBelow ? 'warn' : ''}`} style={{ width: `${pct}%` }} />
      <span className="meter-label mono">{pct}%</span>
    </div>
  );
}

function EmpireTab() {
  const g = useGame();
  const dispatch = useApp((s) => s.dispatch);
  const missing = NEIGHBORHOOD_ORDER.filter((n) => !g.restaurants.some((r) => r.neighborhood === n));
  return (
    <>
      <h3>{t('empire.title')}</h3>
      <ul className="list">
        {g.restaurants.map((r) => (
          <li key={r.id} className={`row empire-row ${r.id === g.active ? 'current' : ''}`}>
            <div className="grow">
              <div className="name">{r.name}</div>
              <div className="meta">
                {t(`city.${r.neighborhood}`)} · {t('empire.today')} {signedMoney(todayProfit(r))}
              </div>
              <div className="meta">
                <Stars value={r.reputation} /> · {t('finance.cleanliness')} {Math.round(r.cleanliness * 100)}%
              </div>
            </div>
            {r.id === g.active ? (
              <span className="pill">{t('empire.active')}</span>
            ) : (
              <button className="btn small primary" onClick={() => dispatch({ type: 'switch', restaurant: r.id })}>
                {t('empire.show')}
              </button>
            )}
          </li>
        ))}
      </ul>
      {missing.length > 0 && g.restaurants.length < B.economy.maxRestaurants && (
        <>
          <h3>{t('empire.openTitle')}</h3>
          <ul className="list">
            {missing.map((n) => {
              const nb = NEIGHBORHOODS[n];
              return (
                <li key={n} className="row">
                  <div className="grow">
                    <div className="name">{t(`city.${n}`)}</div>
                    <div className="meta">
                      {t(`cuisine.${nb.favoriteCuisine}`)} · {t('finance.rent')} {money(nb.rentPerDay)}
                    </div>
                  </div>
                  <button className="btn small primary" disabled={g.cash < nb.openCost} onClick={() => dispatch({ type: 'open', neighborhood: n })}>
                    {t('empire.open', { cost: money(nb.openCost) })}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}

// --- Nyitási ellenőrzőlista -------------------------------------------------------

function Checklist({ compact = false }: { compact?: boolean }) {
  const r = useRest();
  const x = isServiceReady(r);
  const items: [string, boolean][] = [
    ['checklist.table', x.tables > 0 && x.chairs > 0],
    ['checklist.stove', x.stoves > 0],
    ['checklist.counter', x.counters > 0],
    ['checklist.chef', x.chefs > 0],
    ['checklist.waiter', x.waiters > 0],
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
  const tabs: DockTab[] = ['build', 'staff', 'menu', 'finance', 'empire'];
  const label = (k: DockTab) => (k === 'build' ? t('build.title') : t(`tab.${k}`));
  const toggle = (k: DockTab) => {
    if (k !== 'build') setTool(null);
    setOpen(open === k ? null : k);
  };
  return (
    <>
      {open === null || open === 'build' ? <Checklist compact /> : null}
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
          <div className="sheet-body">{open === 'build' ? <BuildTools withStyle /> : <TabContent tab={open} />}</div>
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
  const e = g.lastReport;
  const r = activeRestaurant(g);
  const rep = e.restaurants.find((x) => x.id === r.id)?.report ?? e.restaurants[0]!.report;
  const tips: string[] = [];
  if (rep.stats.servedGuests === 0) tips.push(t('dayEnd.tips.empty'));
  else {
    if (rep.stats.leftPatience > rep.stats.arrivedGuests * 0.25) tips.push(t('dayEnd.tips.patience'));
    if (rep.stats.leftPrice > rep.stats.servedGuests * 0.3) tips.push(t('dayEnd.tips.price'));
    if (rep.cleanliness < 0.6) tips.push(t('dayEnd.tips.dirty'));
  }
  if (rep.stats.ruinedDishes > 0) tips.push(t('dayEnd.tips.ruined', { n: rep.stats.ruinedDishes }));
  const lines: [string, number][] = [
    ['finance.revenue', rep.revenue],
    ['finance.ingredients', -rep.ingredients],
    ['finance.wages', -rep.wages],
    ['finance.rent', -rep.rent],
    ['finance.maintenance', -rep.maintenance],
  ];
  if (rep.marketing) lines.push(['finance.marketing', -rep.marketing]);
  const result = g.campaign.lastResult;
  const doneDef = result?.success ? CHAPTERS[result.chapter] : undefined;
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className={`eyebrow ${e.profit >= 0 ? 'pos' : 'neg'}`}>{e.profit >= 0 ? t('dayEnd.profitPos') : t('dayEnd.profitNeg')}</div>
        <h2>{t('dayEnd.title', { Article: capitalize(article(e.day)), day: e.day })}</h2>
        {result && (
          <div className={`result-box ${result.success ? 'good' : 'bad'}`}>
            <strong>{result.success ? t('mission.done') : t('mission.failed')}</strong>
            <span>{result.success ? t(`ch.${CHAPTERS[result.chapter]!.id}.title`) : t('mission.failedText')}</span>
            {doneDef?.unlocks?.map((id) => <span key={id}>{t('dayEnd.unlocked', { name: t(`recipe.${id}`) })}</span>)}
            {doneDef?.cash ? <span>{t('dayEnd.reward', { cash: money(doneDef.cash) })}</span> : null}
          </div>
        )}
        {e.restaurants.length > 1 && (
          <table className="pl empire-table">
            <tbody>
              {e.restaurants.map((x) => (
                <tr key={x.id}>
                  <td>{g.restaurants.find((rr) => rr.id === x.id)?.name}</td>
                  <td className={`mono num ${x.report.profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(x.report.profit)}</td>
                </tr>
              ))}
              <tr className="total">
                <td>{t('dayEnd.empire')}</td>
                <td className={`mono num ${e.profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(e.profit)}</td>
              </tr>
            </tbody>
          </table>
        )}
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
                <td className={`mono num ${rep.profit >= 0 ? 'pos' : 'neg'}`}>{signedMoney(rep.profit)}</td>
              </tr>
            </tbody>
          </table>
          <dl className="stats">
            <dt>{t('finance.arrived')}</dt>
            <dd className="mono">{rep.stats.arrivedGuests}</dd>
            <dt>{t('finance.served')}</dt>
            <dd className="mono">{rep.stats.servedGuests}</dd>
            <dt>{t('finance.happy')}</dt>
            <dd className="mono">{rep.stats.happyGuests}</dd>
            <dt>{t('finance.leftPatience')}</dt>
            <dd className="mono">{rep.stats.leftPatience}</dd>
            <dt>{t('finance.leftPrice')}</dt>
            <dd className="mono">{rep.stats.leftPrice}</dd>
            <dt>{t('finance.avgRating')}</dt>
            <dd className="mono">{rep.avgRating ? num(rep.avgRating) : '–'}</dd>
            <dt>{t('top.reputation')}</dt>
            <dd className="mono">{num(rep.reputation, 2)}</dd>
          </dl>
        </div>
        {tips.map((k) => (
          <p key={k} className="tip">
            {k}
          </p>
        ))}
        <button className="btn primary wide" onClick={() => dispatch({ type: 'continue' })}>
          {t('dayEnd.continue')}
        </button>
      </div>
    </div>
  );
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
