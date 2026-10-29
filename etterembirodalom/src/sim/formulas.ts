// A PLAN.md „Gazdasági és szimulációs modell” fejezetének képletei.
// Minden konstans a balance.json-ból jön.

import balance from '../data/balance.json';
import { NEIGHBORHOODS, recipeById, type IngredientQuality, type NeighborhoodId } from '../data/content';
import type { Role } from './types';

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

/** D: hangulatpontszám a berendezés értékéből. */
export function decorScore(furnitureValue: number): number {
  const s = B.satisfaction;
  return Math.min(1, s.decorBase + (1 - s.decorBase) * (furnitureValue / s.decorFullValueFt));
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
