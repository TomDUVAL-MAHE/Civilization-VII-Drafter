export type Rng = () => number;

const xmur3 = (value: string) => {
  let h = 1779033703 ^ value.length;
  for (let i = 0; i < value.length; i += 1) {
    h = Math.imul(h ^ value.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
};

const mulberry32 = (seed: number): Rng => {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let result = Math.imul(t ^ (t >>> 15), t | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

export const createRng = (seed: string): Rng => {
  const seedFn = xmur3(seed);
  return mulberry32(seedFn());
};

export const pickRandom = <T,>(pool: T[], rng: Rng): T => pool[Math.floor(rng() * pool.length)];

export const pickUnique = <T extends { id: string }>(pool: T[], count: number, rng: Rng, usedIds: Set<string>): T[] => {
  const picks: T[] = [];
  const bag = pool.filter((item) => !usedIds.has(item.id));
  while (bag.length > 0 && picks.length < count) {
    const choice = pickRandom(bag, rng);
    picks.push(choice);
    usedIds.add(choice.id);
    bag.splice(bag.indexOf(choice), 1);
  }
  return picks;
};
