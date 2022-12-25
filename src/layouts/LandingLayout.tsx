import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export default function LandingLayout() {
  return (
    <Box minHeight="100vh">
      <Outlet />
    </Box>
  )
}