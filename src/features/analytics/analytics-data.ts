import type { ApiDefinition } from '@/apis/api-registry';
import { parseOpenApiSpec, type EndpointDef } from '@/lib/spec-parser';

export type AnalyticsPoint = {
  date: string;
  calls: number;
  errors: number;
  latencyMs: number;
};

export type EndpointMetric = {
  endpointId: string;
  method: string;
  path: string;
  calls: number;
  errorRate: number;
  averageLatencyMs: number;
};

export type UsageAnalytics = {
  totalCalls: number;
  errorRate: number;
  averageLatencyMs: number;
  series: AnalyticsPoint[];
  endpoints: EndpointMetric[];
};

function hashText(value: string): number {
  return value.split('').reduce((hash, char) => hash + char.charCodeAt(0), 0);
}

function buildEndpointMetric(endpoint: EndpointDef, index: number): EndpointMetric {
  const base = hashText(endpoint.id) + index * 97;
  const calls = 120 + (base % 820);
  const errorRate = Number((((base % 11) + 1) / 100).toFixed(2));
  const averageLatencyMs = 90 + (base % 280);

  return {
    endpointId: endpoint.id,
    method: endpoint.method.toUpperCase(),
    path: endpoint.path,
    calls,
    errorRate,
    averageLatencyMs,
  };
}

export function buildMockUsageAnalytics(api: ApiDefinition): UsageAnalytics {
  const endpoints = parseOpenApiSpec(api.spec).map(buildEndpointMetric);
  const totalCalls = endpoints.reduce((total, endpoint) => total + endpoint.calls, 0);
  const weightedErrorTotal = endpoints.reduce(
    (total, endpoint) => total + endpoint.calls * endpoint.errorRate,
    0,
  );
  const weightedLatencyTotal = endpoints.reduce(
    (total, endpoint) => total + endpoint.calls * endpoint.averageLatencyMs,
    0,
  );
  const series = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dailyBase = totalCalls / 7;
    const calls = Math.round(dailyBase * (0.78 + index * 0.07));

    return {
      date: date.toISOString().slice(0, 10),
      calls,
      errors: Math.round(calls * (weightedErrorTotal / Math.max(totalCalls, 1))),
      latencyMs: Math.round(weightedLatencyTotal / Math.max(totalCalls, 1) + index * 8),
    };
  });

  return {
    totalCalls,
    errorRate: Number((weightedErrorTotal / Math.max(totalCalls, 1)).toFixed(3)),
    averageLatencyMs: Math.round(weightedLatencyTotal / Math.max(totalCalls, 1)),
    series,
    endpoints,
  };
}
