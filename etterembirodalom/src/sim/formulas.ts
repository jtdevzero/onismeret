// A PLAN.md „Gazdasági és szimulációs modell” fejezetének képletei.
// Minden konstans a balance.json-ból jön.

import balance from '../data/balance.json';
import { ITEMS, NEIGHBORHOODS, recipeById, type IngredientQuality, type NeighborhoodId, type RivalDef } from '../data/content';
import type { MenuEntry, PlacedItem, Role } from './types';

export const B = balance;

/** N(t): napszakszorzó a nyitás óta eltelt játékmásodpercből. */
export function hourMultiplier(timeSec: number): number {
  const hour = B.time.openHour + timeSec / 3600;
  for (const band of B.demand.hourMultipliers) {
    if (hour >= band.from && hour < band.to) return band.m;
  }
  return 0;
}

/** H_f = 0,5 + 0,2 × H */
export function reputationFactor(reputation: number): number {
  return B.demand.reputationBase + B.demand.reputationPerStar * reputation;
}

/** M_f = 1 + 0,25 × ln(1 + marketing / 10 000), legfeljebb 1,6 */
export function marketingFactor(marketingPerDay: number): number {
  const f = 1 + B.demand.marketingCoef * Math.log(1 + marketingPerDay / B.demand.marketingUnitFt);
  return Math.min(B.demand.marketingMax, f);
}

/** λ(t) vendég/óra = B_k × N(t) × H_f × M_f × R_share */
export function guestsPerHour(
  neighborhood: NeighborhoodId,
  timeSec: number,
  reputation: number,
  marketingPerDay: number,
  share = 1,
): number {
  const nb = NEIGHBORHOODS[neighborhood];
  return nb.baseGuestsPerHour * hourMultiplier(timeSec) * reputationFactor(reputation) * marketingFactor(marketingPerDay) * share;
}

export function averageGroupSize(): number {
  const w = B.demand.groupSizeWeights;
  const total = w.reduce((a, b) => a + b, 0);
  return w.reduce((acc, wi, i) => acc + wi * (i + 1), 0) / total;
}

/** P_ref,k: a környék referenciaára az adott ételre. */
export function referencePrice(recipeId: string, neighborhood: NeighborhoodId): number {
  return Math.round(recipeById(recipeId).refPrice * NEIGHBORHOODS[neighborhood].priceMultiplier);
}

/** Q_i = 0,35 × L/5 + 0,35 × A_q + 0,30 × S_séf/100 */
export function dishQuality(level: number, ingredient: IngredientQuality, chefSkill: number): number {
  const q = B.quality;
  return q.recipeLevelWeight * (level / 5) + q.ingredientWeight * q.ingredient[ingredient] + q.chefWeight * (chefSkill / 100);
}

/**
 * U_i = U_0 + 0,6 × Q − 0,4 × P/P_ref + K + ε
 * U_0 (alap-hajlandóság) kalibrációs tag: nélküle referenciaáron sem rendelne senki (lásd PLAN.md).
 */
export function dishUtility(quality: number, price: number, refPrice: number, favorite: boolean, noise: number): number {
  const c = B.choice;
  return c.baseWillingness + c.qualityWeight * quality - c.priceWeight * (price / refPrice) + (favorite ? c.cuisineBonus : 0) + noise;
}

/** Képességszorzó a kiszolgálási és főzési időkhöz: 1,5 − S/100 */
export function skillTimeFactor(skill: number): number {
  return B.service.skillFactorBase - skill / 100;
}

/** Adagonkénti alapanyag-költség. */
export function costPerServing(recipeId: string, ingredient: IngredientQuality): number {
  return Math.round(recipeById(recipeId).baseCost * B.quality.ingredientCostMult[ingredient]);
}

/** Napi bér: alapbér × (1 + 0,003 × képesség) */
export function dailyWage(role: Role, skill: number): number {
  return Math.round(B.economy.baseWage[role] * (1 + B.economy.wageSkillPctPerPoint * skill));
}

/** Teljes türelemkeret játékmásodpercben (W_max). */
export function totalPatienceSec(): number {
  const p = B.patience;
  return (p.seatMinutes + p.orderMinutes + p.foodMinutes + p.payMinutes) * 60;
}

/** V = min(1, Q × P_ref / P) */
export function valueScore(quality: number, price: number, refPrice: number): number {
  return Math.min(1, (quality * refPrice) / price);
}

/** A hangulathoz számított berendezésérték: a dekoráció háromszoros súllyal. */
export function decorValue(items: PlacedItem[]): number {
  return items.reduce((a, i) => a + ITEMS[i.kind].price * (ITEMS[i.kind].decor ? B.satisfaction.decorItemWeight : 1), 0);
}

/** D: hangulatpontszám a berendezés értékéből; 60% tisztaság alatt a felére esik. */
export function decorScore(value: number, cleanliness = 1): number {
  const s = B.satisfaction;
  const d = Math.min(1, s.decorBase + (1 - s.decorBase) * (value / s.decorFullValueFt));
  return cleanliness < B.cleaning.decorPenaltyBelow ? d * B.cleaning.decorPenaltyFactor : d;
}

// --- Riválisok és piaci részesedés -------------------------------------------------

function reputationTerm(reputation: number): number {
  return B.rivals.reputationWeight * (reputation - B.rivals.reputationPivot);
}

/** Ū a játékos étterménél: az étlap átlagos, zaj nélküli hasznossága + hírnévtag. */
export function playerAppeal(menu: MenuEntry[], neighborhood: NeighborhoodId, chefSkill: number, reputation: number): number {
  const on = menu.filter((m) => m.onMenu);
  if (on.length === 0) return -Infinity;
  const fav = NEIGHBORHOODS[neighborhood].favoriteCuisine;
  const total = on.reduce((a, m) => {
    const q = dishQuality(m.level, m.ingredient, chefSkill);
    return a + dishUtility(q, m.price, referencePrice(m.recipeId, neighborhood), recipeById(m.recipeId).cuisine === fav, 0);
  }, 0);
  return total / on.length + reputationTerm(reputation);
}

/** Ū egy riválisnál. */
export function rivalAppeal(def: RivalDef, priceLevel: number): number {
  const c = B.choice;
  const fav = NEIGHBORHOODS[def.neighborhood].favoriteCuisine === def.cuisine;
  return c.baseWillingness + c.qualityWeight * def.quality - c.priceWeight * priceLevel + (fav ? c.cuisineBonus : 0) + reputationTerm(def.reputation);
}

/**
 * R_share = e^(kŪ_j) / (e^(kŪ_j) + Σ e^(kŪ_r)) × (1 + n_rivális).
 * A nyers részesedés (szorzó nélkül) adja a riválisok reakcióját.
 */
export function marketShare(player: number, rivals: number[]): { raw: number; share: number } {
  if (!Number.isFinite(player)) return { raw: 0, share: 0 };
  const k = B.rivals.temperature;
  const ep = Math.exp(k * player);
  const raw = ep / (ep + rivals.reduce((a, u) => a + Math.exp(k * u), 0));
  return { raw, share: raw * (1 + rivals.length) };
}

/** S = 35Q + 20(1 − W/W_max) + 15C + 15V + 15D, 0–100 */
export function satisfaction(quality: number, waitSec: number, clean: number, value: number, decor: number): number {
  const s = B.satisfaction;
  const waitPart = Math.max(0, 1 - waitSec / totalPatienceSec());
  const raw = s.quality * quality + s.wait * waitPart + s.clean * clean + s.value * value + s.decor * decor;
  return Math.max(0, Math.min(100, raw));
}

/** Csillag = S / 20 */
export function stars(sat: number): number {
  return sat / 20;
}

/** H ← H + 0,02 × (csillag − H) */
export function updateReputation(reputation: number, star: number): number {
  const next = reputation + B.satisfaction.reputationLearningRate * (star - reputation);
  return Math.max(0, Math.min(5, next));
}
