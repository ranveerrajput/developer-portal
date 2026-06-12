import { API_REGISTRY } from '@/apis/api-registry';
import { buildMockUsageAnalytics } from '@/features/analytics/analytics-data';

describe('buildMockUsageAnalytics', () => {
  it('creates endpoint metrics from the registered OpenAPI spec', () => {
    const analytics = buildMockUsageAnalytics(API_REGISTRY[0]);

    expect(analytics.totalCalls).toBeGreaterThan(0);
    expect(analytics.averageLatencyMs).toBeGreaterThan(0);
    expect(analytics.series).toHaveLength(7);
    expect(analytics.endpoints.some((endpoint) => endpoint.path === '/pokemon/{name}')).toBe(true);
  });
});
