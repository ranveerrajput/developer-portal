import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { LoadingState } from '@/components/feedback/LoadingState';
import { useAuth } from '@/features/auth/useAuth';

export function ProtectedRoute() {
  const location = useLocation();
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingState label="Checking authentication" />;
  }

  if (status !== 'authenticated') {
    return <Navigate to="/sign-in" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
