import type { ApiDefinition, ChangelogEntry } from '@/apis/api-registry';

export type ChangelogTypeFilter = 'all' | ChangelogEntry['type'];

export type ChangelogApiFilter = string;

export type ChangelogItem = ChangelogEntry & {
  apiId: string;
  apiName: string;
};

export function buildChangelogItems(apis: ApiDefinition[]): ChangelogItem[] {
  return apis
    .flatMap((api) =>
      (api.changelog ?? []).map((entry) => ({
        ...entry,
        apiId: api.id,
        apiName: api.name,
      })),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function filterChangelogItems(
  items: ChangelogItem[],
  apiFilter: ChangelogApiFilter,
  typeFilter: ChangelogTypeFilter,
): ChangelogItem[] {
  return items.filter((item) => {
    const matchesApi = apiFilter === 'all' || item.apiId === apiFilter;
    const matchesType = typeFilter === 'all' || item.type === typeFilter;

    return matchesApi && matchesType;
  });
}
