import React, { useState } from 'react';
import { Box, Button, FormControlLabel, Grid, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import useConnectWallet from '../hooks/useConnectWallet';
import { TNetwork } from '../utils/types';

export default function ConnectWallet() {
  const { connectAct } = useConnectWallet()

  const [network, setNetwork] = useState<TNetwork>('testnet');

  const handleChangeNetwork = (networkName: string) => {
    if (networkName === 'mainnet') {
      setNetwork('mainnet')
    } else {
      setNetwork('testnet')
    }
  };

  const handleConnectWallet = () => {
    connectAct(network)
  }
  return (
    <Box>
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box sx={{
            height: '100vh',
            background: 'url(/assets/images/connect-bg.jpg) no-repeat 50%',
            backgroundSize: 'cover'
          }}>
            <Typography component="h1" textAlign="center" color="white" px={4} fontSize={48} fontWeight={600} pt={24}>
              Create & Manage your Assets
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Stack px={3} height="100vh">
            <Box component="img" src="/assets/images/logo.png" alt="logo" width={148} mt={3} />
            <Stack flexGrow={1} justifyContent="center" alignItems="center" spacing={4}>
              <Typography component="h2" textAlign="center" fontSize={24}>
                Select network
              </Typography>

              <RadioGroup row value={network} onChange={(e) => handleChangeNetwork(e.target.value)}>
                <FormControlLabel value="testnet" control={<Radio />} label="Testnet" />
                <FormControlLabel value="mainnet" control={<Radio />} label="Mainnet" />
              </RadioGroup>

              <Button variant="contained" onClick={() => handleConnectWallet()}>Connect Wallet</Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}