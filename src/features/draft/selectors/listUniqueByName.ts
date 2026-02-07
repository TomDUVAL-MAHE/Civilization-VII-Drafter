export const listUniqueByName = <T extends { name: string }>(items: T[]) =>
  Array.from(new Map(items.map((item) => [item.name, item])).values());
