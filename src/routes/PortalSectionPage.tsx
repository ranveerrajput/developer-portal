import { Navigate, useParams } from 'react-router-dom';

import { API_REGISTRY } from '@/apis/api-registry';
import { EmptyState } from '@/components/feedback/EmptyState';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { ChangelogPage } from '@/features/changelog/ChangelogPage';
import { DocumentationPage } from '@/features/docs/DocumentationPage';
import { ApiKeysPage } from '@/features/keys/ApiKeysPage';
import { SandboxPage } from '@/features/sandbox/SandboxPage';
import { StatusPage } from '@/features/status/StatusPage';
import { portalSections } from '@/layouts/portal-navigation';

export function PortalSectionPage() {
  const { apiId, section } = useParams();
  const api = API_REGISTRY.find((entry) => entry.id === apiId);
  const portalSection = portalSections.find((entry) => entry.segment === section);

  if (!api || !portalSection) {
    return <Navigate to="/" replace />;
  }

  if (portalSection.segment === 'documentation') {
    return <DocumentationPage api={api} />;
  }

  if (portalSection.segment === 'sandbox') {
    return <SandboxPage api={api} />;
  }

  if (portalSection.segment === 'api-keys') {
    return <ApiKeysPage />;
  }

  if (portalSection.segment === 'analytics') {
    return <AnalyticsPage api={api} />;
  }

  if (portalSection.segment === 'status') {
    return <StatusPage />;
  }

  if (portalSection.segment === 'changelog') {
    return <ChangelogPage />;
  }

  return (
    <section className="space-y-5">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-accent">{api.name}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">{portalSection.label}</h1>
      </div>
      <EmptyState
        title={`${portalSection.label} is ready for ${api.name}`}
        description="This route is connected to the registry-driven navigation shell."
      />
    </section>
  );
}
