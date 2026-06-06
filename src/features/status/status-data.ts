import { API_REGISTRY } from "../../apis/api-registry";

export type HealthState = "Operational" | "Degraded" | "Outage";

export interface ApiStatus {
  apiId: string;
  state: HealthState;
  uptime90d: number;
  incidents: Array<{ id: string; timestamp: string; title: string; notes: string; resolved: boolean }>;
}

export const STATUS_DATA: ApiStatus[] = API_REGISTRY.map((api, index) => ({
  apiId: api.id,
  state: index === 1 ? "Degraded" : "Operational",
  uptime90d: index === 1 ? 98.72 : 99.98,
  incidents:
    index === 1
      ? [
          {
            id: "inc_1",
            timestamp: "2026-06-06T15:20:00Z",
            title: "Elevated latency on sandbox payment writes",
            notes: "Traffic has been shifted to a warm pool while write throughput is monitored.",
            resolved: false,
          },
        ]
      : [
          {
            id: "inc_2",
            timestamp: "2026-05-22T08:30:00Z",
            title: "Brief documentation cache delay",
            notes: "Resolved after cache invalidation completed.",
            resolved: true,
          },
        ],
}));
