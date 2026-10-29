import { describe, expect, it } from 'vitest';
import {
  B,
  costPerServing,
  dailyWage,
  decorScore,
  dishQuality,
  dishUtility,
  guestsPerHour,
  hourMultiplier,
  marketingFactor,
  referencePrice,
  reputationFactor,
  satisfaction,
  skillTimeFactor,
  stars,
  totalPatienceSec,
  updateReputation,
  valueScore,
} from '../src/sim/formulas';

describe('kereslet', () => {
  it('napszakszorzó a PLAN.md sávjai szerint', () => {
    expect(hourMultiplier(0)).toBe(0.4); // 10:00
    expect(hourMultiplier(2.5 * 3600)).toBe(1.6); // 12:30
    expect(hourMultiplier(5 * 3600)).toBe(0.6); // 15:00
    expect(hourMultiplier(9 * 3600)).toBe(1.8); // 19:00
    expect(hourMultiplier(11.5 * 3600)).toBe(0.5); // 21:30
    expect(hourMultiplier(12 * 3600)).toBe(0); // zárás
  });

  it('hírnév-szorzó 0,5 és 1,5 között', () => {
    expect(reputationFactor(0)).toBeCloseTo(0.5);
    expect(reputationFactor(5)).toBeCloseTo(1.5);
  });

  it('marketing csökkenő hozammal, legfeljebb 1,6', () => {
    expect(marketingFactor(0)).toBe(1);
    expect(marketingFactor(10000)).toBeCloseTo(1 + 0.25 * Math.log(2));
    expect(marketingFactor(1e9)).toBe(1.6);
  });

  it('λ = B_k × N × H_f × M_f', () => {
    expect(guestsPerHour('paris', 9 * 3600, 2.5, 0)).toBeCloseTo(22 * 1.8 * 1.0);
  });
});

describe('étel és vendégdöntés', () => {
  it('minőség képlete', () => {
    expect(dishQuality(5, 'premium', 100)).toBeCloseTo(1);
    expect(dishQuality(1, 'normal', 50)).toBeCloseTo(0.35 * 0.2 + 0.35 * 0.7 + 0.3 * 0.5);
  });

  it('referenciaáron a vendég rendel, 2,5-szeresén nem', () => {
    const q = dishQuality(1, 'normal', 50);
    expect(dishUtility(q, 1000, 1000, true, 0)).toBeGreaterThan(0);
    expect(dishUtility(q, 2500, 1000, true, B.choice.noise)).toBeLessThan(0);
  });

  it('referenciaár a környék szorzójával', () => {
    expect(referencePrice('coq_au_vin', 'paris')).toBe(Math.round(4400 * 0.9));
  });

  it('adagköltség az alapanyag-minőséggel', () => {
    expect(costPerServing('lasagne', 'cheap')).toBe(700);
    expect(costPerServing('lasagne', 'premium')).toBe(1500);
  });

  it('képességszorzó: 1,5 − S/100', () => {
    expect(skillTimeFactor(50)).toBeCloseTo(1);
    expect(skillTimeFactor(100)).toBeCloseTo(0.5);
  });
});

describe('elégedettség és hírnév', () => {
  it('tökéletes élmény = 100 pont = 5 csillag', () => {
    const s = satisfaction(1, 0, 1, 1, 1);
    expect(s).toBe(100);
    expect(stars(s)).toBe(5);
  });

  it('a várakozás a türelemkerethez mérve csökkent', () => {
    const full = satisfaction(1, 0, 1, 1, 1);
    const half = satisfaction(1, totalPatienceSec() / 2, 1, 1, 1);
    expect(full - half).toBeCloseTo(10);
  });

  it('ár-érték legfeljebb 1', () => {
    expect(valueScore(0.5, 1000, 1000)).toBe(0.5);
    expect(valueScore(1, 500, 1000)).toBe(1);
  });

  it('hírnév lassan követi az értékeléseket', () => {
    expect(updateReputation(2.5, 5)).toBeCloseTo(2.55);
    expect(updateReputation(5, 5)).toBe(5);
  });

  it('dekorpontszám 0,3-tól 1-ig', () => {
    expect(decorScore(0)).toBeCloseTo(0.3);
    expect(decorScore(1e9)).toBe(1);
  });

  it('bér a képességgel nő', () => {
    expect(dailyWage('waiter', 0)).toBe(18000);
    expect(dailyWage('chef', 50)).toBe(Math.round(28000 * 1.15));
  });
});
