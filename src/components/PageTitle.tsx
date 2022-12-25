import React from 'react'
import { Button, ButtonGroup, Stack, Typography } from '@mui/material'
import useConnectWallet from '../hooks/useConnectWallet'
import { TNetwork } from '../utils/types'

export default function PageTitle() {
  const { network, switchNetworkAct } = useConnectWallet()

  const handleSwitchNetwork = (network: TNetwork) => {
    switchNetworkAct(network)
  }

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4}>
      <Typography component="h2" fontSize={28} fontWeight={600}>
        Dashboard
      </Typography>
      <ButtonGroup>
        <Button onClick={() => handleSwitchNetwork('testnet')} variant={network === 'testnet' ? 'contained' : 'outlined'}>
          Testnet
        </Button>
        <Button onClick={() => handleSwitchNetwork('mainnet')} variant={network === 'mainnet' ? 'contained' : 'outlined'}>
          Mainnet
        </Button>
      </ButtonGroup>
    </Stack>
  )
}