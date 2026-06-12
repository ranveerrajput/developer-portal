import { createBrowserRouter } from 'react-router-dom';

import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { SignInPage } from '@/features/auth/SignInPage';
import { SignUpPage } from '@/features/auth/SignUpPage';
import { RootLayout } from '@/layouts/RootLayout';
import { HomePage } from '@/routes/HomePage';
import { PortalSectionPage } from '@/routes/PortalSectionPage';

export const router = createBrowserRouter([
  {
    path: '/sign-in',
    element: <SignInPage />,
  },
  {
    path: '/sign-up',
    element: <SignUpPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <RootLayout />,
        children: [
          {
            index: true,
            element: <HomePage />,
          },
          {
            path: 'apis/:apiId/:section',
            element: <PortalSectionPage />,
          },
        ],
      },
    ],
  },
]);
