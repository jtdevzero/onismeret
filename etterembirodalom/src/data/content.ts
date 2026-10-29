// Játéktartalom: berendezés, receptek, környékek. A szövegek a hu.json-ban élnek,
// itt csak azonosítók és számok vannak.

export type ItemKind = 'table' | 'chair' | 'stove' | 'counter';
export type CuisineId = 'italian' | 'hungarian' | 'french';
export type NeighborhoodId = 'suburb' | 'university' | 'downtown';
export type IngredientQuality = 'cheap' | 'normal' | 'premium';

export interface ItemDef {
  kind: ItemKind;
  price: number;
  /** A vendégek és a személyzet átmehet-e rajta. */
  walkable: boolean;
}

export const ITEMS: Record<ItemKind, ItemDef> = {
  table: { kind: 'table', price: 30000, walkable: false },
  chair: { kind: 'chair', price: 8000, walkable: false },
  stove: { kind: 'stove', price: 250000, walkable: false },
  counter: { kind: 'counter', price: 60000, walkable: false },
};

export const ITEM_ORDER: ItemKind[] = ['table', 'chair', 'stove', 'counter'];

export interface RecipeDef {
  id: string;
  cuisine: CuisineId;
  /** Alapanyag-költség normál minőségen, Ft/adag. */
  baseCost: number;
  /** Referenciaár szorzó nélkül, Ft. A környék szorzójával adja a P_ref-et. */
  refPrice: number;
  /** Főzési alapidő játékpercben. */
  cookMinutes: number;
}

export const RECIPES: RecipeDef[] = [
  { id: 'margherita', cuisine: 'italian', baseCost: 700, refPrice: 2900, cookMinutes: 12 },
  { id: 'carbonara', cuisine: 'italian', baseCost: 800, refPrice: 3200, cookMinutes: 10 },
  { id: 'lasagne', cuisine: 'italian', baseCost: 1000, refPrice: 3600, cookMinutes: 14 },
  { id: 'minestrone', cuisine: 'italian', baseCost: 450, refPrice: 1900, cookMinutes: 8 },
  { id: 'tiramisu', cuisine: 'italian', baseCost: 500, refPrice: 1800, cookMinutes: 6 },
];

export function recipeById(id: string): RecipeDef {
  const r = RECIPES.find((x) => x.id === id);
  if (!r) throw new Error(`Ismeretlen recept: ${id}`);
  return r;
}

export interface NeighborhoodDef {
  id: NeighborhoodId;
  baseGuestsPerHour: number;
  priceMultiplier: number;
  favoriteCuisine: CuisineId;
  rentPerDay: number;
}

export const NEIGHBORHOODS: Record<NeighborhoodId, NeighborhoodDef> = {
  suburb: { id: 'suburb', baseGuestsPerHour: 14, priceMultiplier: 0.8, favoriteCuisine: 'hungarian', rentPerDay: 40000 },
  university: { id: 'university', baseGuestsPerHour: 22, priceMultiplier: 0.9, favoriteCuisine: 'italian', rentPerDay: 50000 },
  downtown: { id: 'downtown', baseGuestsPerHour: 30, priceMultiplier: 1.4, favoriteCuisine: 'french', rentPerDay: 120000 },
};

export const STAFF_NAMES: string[] = [
  'Kovács Anna', 'Nagy Bence', 'Tóth Réka', 'Szabó Máté', 'Horváth Lili', 'Varga Dániel',
  'Kiss Eszter', 'Molnár Ádám', 'Farkas Zsófi', 'Balogh Levente', 'Papp Noémi', 'Takács Gergő',
  'Juhász Dóra', 'Lakatos Péter', 'Mészáros Flóra', 'Oláh Kristóf', 'Simon Petra', 'Rácz Olivér',
];
