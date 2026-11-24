// Sorting helper to ensure consistent ordering everywhere projects are shown.
// Order: featured first, then by year (desc), then by sortOrder (asc), then by title as tiebreaker.
export const compareProjects = (a: any, b: any) => {
  const featDiff = Number(b?.isFeatured ? 1 : 0) - Number(a?.isFeatured ? 1 : 0);
  if (featDiff !== 0) return featDiff;

  const yearA = Number(a?.year) || 0;
  const yearB = Number(b?.year) || 0;
  const yearDiff = yearB - yearA;
  if (yearDiff !== 0) return yearDiff;

  const orderA = Number(a?.sortOrder) || 0;
  const orderB = Number(b?.sortOrder) || 0;
  const orderDiff = orderA - orderB;
  if (orderDiff !== 0) return orderDiff;

  const titleA = (a?.titleEn || a?.titleAr || '').toString();
  const titleB = (b?.titleEn || b?.titleAr || '').toString();
  return titleA.localeCompare(titleB);
};
