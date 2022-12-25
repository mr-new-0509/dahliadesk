import { useRoutes } from 'react-router';
import DashbaordLayout from '../layouts/DashbaordLayout';
import LandingLayout from '../layouts/LandingLayout';
import { routesOfDashboard, routesOfLanding } from './routes';

export default function Routes() {
  return useRoutes([
    {
      element: <LandingLayout />,
      children: routesOfLanding
    },
    {
      element: <DashbaordLayout />,
      children: routesOfDashboard
    }
  ])
}