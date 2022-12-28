import React, { useMemo } from 'react'
import { Box, FormLabel, Paper, Stack, Typography, Icon as MuiIcon, Link } from '@mui/material'
import { Icon } from '@iconify/react';
import useConnectWallet from '../../../../../hooks/useConnectWallet';
import { BASE_URL_OF_MAINNET_EXPLORER, BASE_URL_OF_TESTNET_EXPLORER } from '../../../../../utils/constants';

interface IProps {
  label: string;
  address?: string;
}

export default function PaperAccount({ label, address }: IProps) {
  const { network } = useConnectWallet()
  const addressToView = useMemo(() => {
    if (address) {
      return `${address.slice(0, 10)}...${address.slice(-10)}`
    } else {
      return '- None -'
    }
  }, [address])

  const baseUrlOfExplorer = useMemo(() => {
    if (network === 'MainNet') {
      return BASE_URL_OF_MAINNET_EXPLORER
    } else {
      return BASE_URL_OF_TESTNET_EXPLORER
    }
  }, [network])

  return (
    <Box>
      <FormLabel>{label}</FormLabel>
      <Paper sx={{ px: 2, py: 1, mt: 1 }}>
        {address ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={3}>
            <Link
              target="_blank"
              href={`${baseUrlOfExplorer}/${address}`}
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