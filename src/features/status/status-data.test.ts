import { API_REGISTRY } from '@/apis/api-registry';
import { buildMockStatusData, getActiveIncidents } from '@/features/status/status-data';

describe('status data', () => {
  it('builds status records for registered APIs', () => {
    const statuses = buildMockStatusData(API_REGISTRY);

    expect(statuses).toHaveLength(API_REGISTRY.length);
    expect(statuses[0]?.uptimePercent).toBeGreaterThan(0);
  });

  it('returns active incidents for global banners', () => {
    const incidents = getActiveIncidents(buildMockStatusData(API_REGISTRY));

    expect(incidents.length).toBeGreaterThan(0);
    expect(incidents[0]?.resolvedAt).toBeNull();
  });
});
