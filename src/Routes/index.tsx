import React from 'react';
import { Navigate, useRoutes } from 'react-router-dom';
import useConnectWallet from '../hooks/useConnectWallet';
import DashbaordLayout from '../layouts/DashbaordLayout';
import LandingLayout from '../layouts/LandingLayout';
import ConnectWallet from '../pages/ConnectWallet';
import Dashboard from '../pages/Dashboard';

export default function Routes() {
  const { currentUser } = useConnectWallet()

  return useRoutes([
    {
      element: <LandingLayout />,
      children: [
        {
          path: '/connect-wallet',
          element: currentUser ? <Navigate to="/dashboard" /> : <ConnectWallet />
        }
      ]
    },
    {
      element: <DashbaordLayout />,
      children: [
        {
          path: '/dashboard',
          element: <Dashboard />
        }
      ]
    },
    {
      path: '*',
      element: <Navigate to="/" />
    },
    {
      path: '/',
      element: currentUser ? <Navigate to="/dashboard" /> : <Navigate to="/connect-wallet" />
    }
  ])
}