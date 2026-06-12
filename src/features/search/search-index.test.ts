import { API_REGISTRY } from '@/apis/api-registry';
import { buildEndpointSearchIndex, searchEndpoints } from '@/features/search/search-index';

describe('endpoint search', () => {
  it('indexes endpoints from every registered API', () => {
    const index = buildEndpointSearchIndex(API_REGISTRY);

    expect(index.some((item) => item.apiId === 'pokeapi' && item.endpoint.id === 'getPokemonByName'))
      .toBe(true);
    expect(
      index.some((item) => item.apiId === 'stub-payments' && item.endpoint.id === 'createPayment'),
    ).toBe(true);
  });

  it('searches endpoint descriptions and names', () => {
    const index = buildEndpointSearchIndex(API_REGISTRY);
    const results = searchEndpoints(index, 'single payment');

    expect(results).toHaveLength(1);
    expect(results[0]?.endpoint.id).toBe('getPayment');
  });

  it('searches parameter names and descriptions', () => {
    const index = buildEndpointSearchIndex(API_REGISTRY);
    const results = searchEndpoints(index, 'paymentId');

    expect(results).toHaveLength(1);
    expect(results[0]?.endpoint.id).toBe('getPayment');
  });
});
