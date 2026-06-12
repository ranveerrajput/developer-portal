import { API_REGISTRY } from '@/apis/api-registry';
import { buildChangelogItems, filterChangelogItems } from '@/features/changelog/changelog-utils';

describe('changelog utils', () => {
  it('builds changelog items from registered APIs', () => {
    const items = buildChangelogItems(API_REGISTRY);

    expect(items.length).toBeGreaterThan(0);
    expect(items.some((item) => item.apiId === 'pokeapi')).toBe(true);
    expect(items.some((item) => item.apiId === 'stub-payments')).toBe(true);
  });

  it('filters changelog items by API and type', () => {
    const items = buildChangelogItems(API_REGISTRY);
    const filtered = filterChangelogItems(items, 'stub-payments', 'feature');

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((item) => item.apiId === 'stub-payments')).toBe(true);
    expect(filtered.every((item) => item.type === 'feature')).toBe(true);
  });
});
