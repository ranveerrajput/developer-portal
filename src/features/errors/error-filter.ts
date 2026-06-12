import type { ErrorCatalogueEntry } from '@/apis/api-registry';

function normalize(value: string) {
  return value.trim().toLowerCase();
}

export function filterErrorCatalogue(entries: ErrorCatalogueEntry[], query: string) {
  const normalizedQuery = normalize(query);

  if (!normalizedQuery) {
    return entries;
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);

  return entries.filter((entry) => {
    const searchableText = normalize(
      [entry.code, entry.description, entry.resolution, ...entry.causes].join(' '),
    );

    return terms.every((term) => searchableText.includes(term));
  });
}
