import { API_REGISTRY } from '@/apis/api-registry';

export type PortalSection = {
  label: string;
  segment: string;
};

export const portalSections = [
  { label: 'Documentation', segment: 'documentation' },
  { label: 'Sandbox', segment: 'sandbox' },
  { label: 'API Keys', segment: 'api-keys' },
  { label: 'Analytics', segment: 'analytics' },
  { label: 'Status', segment: 'status' },
  { label: 'Changelog', segment: 'changelog' },
] satisfies PortalSection[];

export function getDefaultApiId() {
  return API_REGISTRY[0]?.id ?? '';
}
