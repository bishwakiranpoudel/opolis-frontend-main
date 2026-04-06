/** Map WordPress category slug to display name and hex color (matches BLOG_CAT_COLORS) */
export const CATEGORY_MAP: Record<string, { name: string; color: string }> = {
  "entity-creation": { name: "Entity Creation", color: "#a78bfa" },
  entity: { name: "Entity Creation", color: "#a78bfa" },
  benefits: { name: "Benefits", color: "#4ade80" },
  taxes: { name: "Taxes", color: "#f5c842" },
  payroll: { name: "Payroll", color: "#E8432D" },
  rewards: { name: "Rewards", color: "#38bdf8" },
};

export const DEFAULT_CATEGORY = { name: "Blog", color: "#777" };

export function getCategoryFromId(
  categoryId: number,
  categoriesMap: Map<number, { name: string; slug: string }>
): { name: string; color: string } {
  const cat = categoriesMap.get(categoryId);
  if (!cat) return DEFAULT_CATEGORY;
  const bySlug = cat.slug && CATEGORY_MAP[cat.slug.toLowerCase()];
  if (bySlug) return bySlug;
  const byName = Object.values(CATEGORY_MAP).find(
    (v) => v.name.toLowerCase() === cat.name?.toLowerCase()
  );
  if (byName) return byName;
  return { name: cat.name || "Blog", color: DEFAULT_CATEGORY.color };
}
