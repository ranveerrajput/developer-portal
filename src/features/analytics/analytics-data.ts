import { API_REGISTRY } from "../../apis/api-registry";

export interface UsagePoint {
  day: string;
  calls: number;
  errors: number;
  latency: number;
}

export interface EndpointMetric {
  endpoint: string;
  calls: number;
  errorRate: number;
  avgLatency: number;
}

export function usageSeries(days: 7 | 30): UsagePoint[] {
  return Array.from({ length: days }, (_, index) => ({
    day: `D-${days - index - 1}`,
    calls: 180 + index * 17 + (index % 3) * 22,
    errors: 4 + (index % 5),
    latency: 90 + (index % 6) * 13,
  }));
}

export const ENDPOINT_BREAKDOWN: EndpointMetric[] = API_REGISTRY.flatMap((api) =>
  Object.keys(api.spec.paths).map((path, index) => ({
    endpoint: `${api.name} ${path}`,
    calls: 420 - index * 43,
    errorRate: 2.1 + index * 0.7,
    avgLatency: 105 + index * 18,
  })),
);
