import type { ApiDefinition } from '@/apis/api-registry';

export type ApiHealthState = 'operational' | 'degraded' | 'outage';

export type Incident = {
  id: string;
  apiId: string;
  title: string;
  state: ApiHealthState;
  startedAt: string;
  resolvedAt: string | null;
  resolutionNotes: string;
};

export type ApiStatus = {
  apiId: string;
  apiName: string;
  state: ApiHealthState;
  uptimePercent: number;
  incidents: Incident[];
};

export function buildMockStatusData(apis: ApiDefinition[]): ApiStatus[] {
  return apis.map((api, index) => {
    const state: ApiHealthState = index === 1 ? 'degraded' : 'operational';
    const activeIncident =
      state === 'operational'
        ? []
        : [
            {
              id: `${api.id}-active-incident`,
              apiId: api.id,
              title: 'Elevated error rate detected',
              state,
              startedAt: '2026-06-09T00:30:00.000Z',
              resolvedAt: null,
              resolutionNotes:
                'Engineering is monitoring request retries and upstream dependency latency.',
            },
          ];

    return {
      apiId: api.id,
      apiName: api.name,
      state,
      uptimePercent: state === 'operational' ? 99.98 : 98.72,
      incidents: [
        ...activeIncident,
        {
          id: `${api.id}-resolved-incident`,
          apiId: api.id,
          title: 'Scheduled sandbox maintenance',
          state: 'degraded',
          startedAt: '2026-06-01T02:00:00.000Z',
          resolvedAt: '2026-06-01T02:45:00.000Z',
          resolutionNotes: 'Maintenance completed and all health checks returned to normal.',
        },
      ],
    };
  });
}

export function getActiveIncidents(statuses: ApiStatus[]): Incident[] {
  return statuses.flatMap((status) => status.incidents.filter((incident) => !incident.resolvedAt));
}
