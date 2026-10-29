// Játéktartalom: berendezés, receptek, városok, riválisok, nevek.
// A felületi szövegek a hu.json-ban élnek; itt azonosítók, számok és tulajdonnevek vannak.

export type ItemKind = 'table' | 'chair' | 'stove' | 'counter' | 'plant' | 'lamp' | 'aquarium' | 'wine' | 'piano';
export type CuisineId = 'french' | 'mediterranean' | 'italian';
export type NeighborhoodId = 'paris' | 'riviera' | 'roma';
export type IngredientQuality = 'cheap' | 'normal' | 'premium';

export interface ItemDef {
  kind: ItemKind;
  price: number;
  /** A vendégek és a személyzet átmehet-e rajta. */
  walkable: boolean;
  /** Dekoráció: nem kell megközelíteni, a hangulatpontszámba háromszoros súllyal számít. */
  decor: boolean;
}

export const ITEMS: Record<ItemKind, ItemDef> = {
  table: { kind: 'table', price: 30000, walkable: false, decor: false },
  chair: { kind: 'chair', price: 8000, walkable: false, decor: false },
  stove: { kind: 'stove', price: 250000, walkable: false, decor: false },
  counter: { kind: 'counter', price: 60000, walkable: false, decor: false },
  plant: { kind: 'plant', price: 25000, walkable: false, decor: true },
  lamp: { kind: 'lamp', price: 45000, walkable: false, decor: true },
  wine: { kind: 'wine', price: 90000, walkable: false, decor: true },
  aquarium: { kind: 'aquarium', price: 180000, walkable: false, decor: true },
  piano: { kind: 'piano', price: 320000, walkable: false, decor: true },
};

export const ITEM_ORDER: ItemKind[] = ['table', 'chair', 'stove', 'counter', 'plant', 'lamp', 'wine', 'aquarium', 'piano'];

// --- Stílus -----------------------------------------------------------------------

export type FloorStyle = 'parquet' | 'marble' | 'terracotta';
export type WallStyle = 'emerald' | 'bordeaux' | 'navy' | 'olive';

export const FLOOR_STYLES: Record<FloorStyle, { price: number }> = {
  parquet: { price: 0 },
  marble: { price: 220000 },
  terracotta: { price: 160000 },
};
export const WALL_STYLES: Record<WallStyle, { price: number }> = {
  emerald: { price: 0 },
  bordeaux: { price: 120000 },
  navy: { price: 120000 },
  olive: { price: 120000 },
};

// --- Receptek -----------------------------------------------------------------------

export interface RecipeDef {
  id: string;
  cuisine: CuisineId;
  /** Alapanyag-költség normál minőségen, Ft/adag. */
  baseCost: number;
  /** Referenciaár szorzó nélkül, Ft. A város szorzójával adja a P_ref-et. */
  refPrice: number;
  /** Főzési alapidő játékpercben. */
  cookMinutes: number;
  /** Gaston elveszett receptje: csak a kampányban megtalálva kerül az étlapra, 5-ös szinten. */
  lost?: boolean;
}

export const RECIPES: RecipeDef[] = [
  { id: 'onion_soup', cuisine: 'french', baseCost: 450, refPrice: 2200, cookMinutes: 8 },
  { id: 'quiche', cuisine: 'french', baseCost: 600, refPrice: 2600, cookMinutes: 9 },
  { id: 'ratatouille', cuisine: 'french', baseCost: 550, refPrice: 2600, cookMinutes: 9 },
  { id: 'coq_au_vin', cuisine: 'french', baseCost: 1300, refPrice: 4400, cookMinutes: 14 },
  { id: 'bourguignon', cuisine: 'french', baseCost: 1500, refPrice: 4800, cookMinutes: 15 },
  { id: 'creme_brulee', cuisine: 'french', baseCost: 400, refPrice: 1900, cookMinutes: 5 },

  { id: 'nicoise', cuisine: 'mediterranean', baseCost: 700, refPrice: 3000, cookMinutes: 6 },
  { id: 'pissaladiere', cuisine: 'mediterranean', baseCost: 500, refPrice: 2400, cookMinutes: 9 },
  { id: 'bouillabaisse', cuisine: 'mediterranean', baseCost: 1800, refPrice: 5600, cookMinutes: 16 },
  { id: 'socca', cuisine: 'mediterranean', baseCost: 300, refPrice: 1500, cookMinutes: 5 },

  { id: 'margherita', cuisine: 'italian', baseCost: 700, refPrice: 2900, cookMinutes: 12 },
  { id: 'carbonara', cuisine: 'italian', baseCost: 800, refPrice: 3200, cookMinutes: 10 },
  { id: 'lasagne', cuisine: 'italian', baseCost: 1000, refPrice: 3600, cookMinutes: 14 },
  { id: 'minestrone', cuisine: 'italian', baseCost: 450, refPrice: 1900, cookMinutes: 8 },
  { id: 'tiramisu', cuisine: 'italian', baseCost: 500, refPrice: 1800, cookMinutes: 6 },
  { id: 'risotto', cuisine: 'italian', baseCost: 900, refPrice: 3400, cookMinutes: 16 },
  { id: 'gnocchi', cuisine: 'italian', baseCost: 650, refPrice: 2800, cookMinutes: 10 },
  { id: 'saltimbocca', cuisine: 'italian', baseCost: 1300, refPrice: 4200, cookMinutes: 15 },
  { id: 'ossobuco', cuisine: 'italian', baseCost: 1600, refPrice: 4800, cookMinutes: 20 },

  { id: 'gaston_potaufeu', cuisine: 'french', baseCost: 900, refPrice: 4600, cookMinutes: 14, lost: true },
  { id: 'fisher_bouillabaisse', cuisine: 'mediterranean', baseCost: 1600, refPrice: 6400, cookMinutes: 16, lost: true },
  { id: 'nonna_cacio', cuisine: 'italian', baseCost: 600, refPrice: 3800, cookMinutes: 10, lost: true },
  { id: 'bouillon_dor', cuisine: 'french', baseCost: 2500, refPrice: 9000, cookMinutes: 20, lost: true },
];

export function recipeById(id: string): RecipeDef {
  const r = RECIPES.find((x) => x.id === id);
  if (!r) throw new Error(`Ismeretlen recept: ${id}`);
  return r;
}

// --- Városok -------------------------------------------------------------------------

export interface NeighborhoodDef {
  id: NeighborhoodId;
  baseGuestsPerHour: number;
  priceMultiplier: number;
  favoriteCuisine: CuisineId;
  rentPerDay: number;
  /** Étteremnyitás ára (a berendezés nélkül). */
  openCost: number;
}

export const NEIGHBORHOODS: Record<NeighborhoodId, NeighborhoodDef> = {
  paris: { id: 'paris', baseGuestsPerHour: 22, priceMultiplier: 0.9, favoriteCuisine: 'french', rentPerDay: 50000, openCost: 0 },
  riviera: { id: 'riviera', baseGuestsPerHour: 20, priceMultiplier: 1.15, favoriteCuisine: 'mediterranean', rentPerDay: 70000, openCost: 1500000 },
  roma: { id: 'roma', baseGuestsPerHour: 28, priceMultiplier: 1.05, favoriteCuisine: 'italian', rentPerDay: 90000, openCost: 2500000 },
};

export const NEIGHBORHOOD_ORDER: NeighborhoodId[] = ['paris', 'riviera', 'roma'];

/** A játékos éttermének neve városonként. */
export const RESTAURANT_NAMES: Record<NeighborhoodId, string> = {
  paris: 'Chez Gaston',
  riviera: 'Le Petit Port',
  roma: 'Trattoria Bella Vita',
};

export interface RivalDef {
  id: string;
  name: string;
  neighborhood: NeighborhoodId;
  cuisine: CuisineId;
  quality: number;
  /** Árszint a referenciaárhoz képest. */
  priceLevel: number;
  reputation: number;
}

export const RIVALS: RivalDef[] = [
  { id: 'coin', name: 'Bistrot du Coin', neighborhood: 'paris', cuisine: 'french', quality: 0.5, priceLevel: 0.95, reputation: 2.8 },
  { id: 'gg_paris', name: 'Gourmet Global Express', neighborhood: 'paris', cuisine: 'french', quality: 0.35, priceLevel: 0.7, reputation: 2.4 },
  { id: 'mouette', name: 'La Mouette', neighborhood: 'riviera', cuisine: 'mediterranean', quality: 0.55, priceLevel: 0.9, reputation: 3.0 },
  { id: 'gg_plage', name: 'Gourmet Global Plage', neighborhood: 'riviera', cuisine: 'mediterranean', quality: 0.4, priceLevel: 0.8, reputation: 2.5 },
  { id: 'nonna', name: 'Trattoria Nonna Rosa', neighborhood: 'roma', cuisine: 'italian', quality: 0.6, priceLevel: 0.9, reputation: 3.2 },
  { id: 'gg_roma', name: 'Gourmet Global Roma', neighborhood: 'roma', cuisine: 'italian', quality: 0.45, priceLevel: 0.85, reputation: 2.7 },
];

// --- Nevek és hangok -------------------------------------------------------------------

export const STAFF_NAMES: Record<'fr' | 'it', string[]> = {
  fr: [
    'Antoine Dubois', 'Camille Laurent', 'Hugo Moreau', 'Chloé Lefèvre', 'Julien Girard', 'Manon Rousseau',
    'Lucas Fontaine', 'Inès Mercier', 'Théo Lambert', 'Léa Bonnet', 'Mathis Garnier', 'Zoé Faure',
    'Nicolas Chevalier', 'Sarah Blanc', 'Maxime Perrin', 'Juliette Roux', 'Bastien Morel', 'Élodie Vidal',
  ],
  it: [
    'Giovanni Rossi', 'Chiara Bianchi', 'Marco Esposito', 'Giulia Romano', 'Luca Colombo', 'Francesca Ricci',
    'Matteo Greco', 'Sofia Marino', 'Alessandro Bruno', 'Elena Gallo', 'Lorenzo Conti', 'Valentina De Luca',
    'Davide Mancini', 'Martina Costa', 'Riccardo Giordano', 'Alessia Rizzo', 'Federico Lombardi', 'Beatrice Moretti',
  ],
};

export function nameRegion(n: NeighborhoodId): 'fr' | 'it' {
  return n === 'roma' ? 'it' : 'fr';
}

/** Rövid felkiáltások a vendégek szájából; tulajdonnév-szerű hangulatelem, nem fordítandó. */
export const PHRASES: Record<'fr' | 'it', { happy: string[]; ok: string[]; angry: string[]; greet: string[] }> = {
  fr: {
    happy: ['Délicieux !', 'Magnifique !', 'Oh là là !', 'Bravo, chef !', 'Formidable !', 'Un régal !'],
    ok: ['Pas mal.', 'Correct.', 'Bon.'],
    angry: ['C’est trop lent…', 'Ça suffit !', 'On s’en va.', 'Quelle attente…'],
    greet: ['Bonsoir !', 'Bonjour !', 'Une table, s’il vous plaît ?', 'Salut !'],
  },
  it: {
    happy: ['Buonissimo!', 'Delizioso!', 'Che bontà!', 'Mamma mia!', 'Bravo, chef!', 'Squisito!'],
    ok: ['Non male.', 'Buono.', 'Va bene.'],
    angry: ['Che lento…', 'Basta!', 'Andiamo via.', 'Ma dai…'],
    greet: ['Buonasera!', 'Ciao!', 'Un tavolo per noi?', 'Buongiorno!'],
  },
};
