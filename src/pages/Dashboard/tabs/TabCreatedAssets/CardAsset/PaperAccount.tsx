import React, { useMemo } from 'react'
import { Box, FormLabel, Paper, Stack, Typography, Icon as MuiIcon, Link } from '@mui/material'
import { Icon } from '@iconify/react';

interface IProps {
  label: string;
  address?: string;
  baseUrlOfExplorer: string;
}

export default function PaperAccount({ label, address, baseUrlOfExplorer }: IProps) {
  const addressToView = useMemo(() => {
    if (address) {
      return `${address.slice(0, 10)}...${address.slice(-10)}`
    } else {
      return '- None -'
    }
  }, [address])

  return (
    <Box>
      <FormLabel>{label}</FormLabel>
      <Paper sx={{ px: 2, py: 1, mt: 1 }}>
        {address ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            <Link
              target="_blank"
              href={`${baseUrlOfExplorer}/address/${address}`}
              sx={{ textDecoration: 'none' }}
            >{addressToView}</Link>
            <MuiIcon component={Icon} icon="material-symbols:check-circle-rounded" color="primary" />
          </Stack>
        ) : (
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            <Typography color="lightgrey">{addressToView}</Typography>
            <MuiIcon component={Icon} icon="fe:disabled" color="disabled" />
          </Stack>
        )}
      </Paper>
    </Box>
  )
}