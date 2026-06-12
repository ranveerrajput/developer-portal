import { Navigate } from 'react-router-dom';

import { getDefaultApiId } from '@/layouts/portal-navigation';

export function HomePage() {
  return <Navigate to={`/apis/${getDefaultApiId()}/documentation`} replace />;
}
