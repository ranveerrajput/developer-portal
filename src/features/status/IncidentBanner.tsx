import { API_REGISTRY } from '@/apis/api-registry';
import { buildMockStatusData, getActiveIncidents } from '@/features/status/status-data';

export function IncidentBanner() {
  const incidents = getActiveIncidents(buildMockStatusData(API_REGISTRY));

  if (incidents.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-950 lg:px-10">
      <p className="font-medium">
        Active incident: {incidents[0]?.title}. {incidents.length.toString()} API issue
        {incidents.length === 1 ? '' : 's'} currently being monitored.
      </p>
    </div>
  );
}
