import React, { useState } from 'react';
import { Box, Button, FormControlLabel, Grid, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { TNetwork } from '../../utils/types';
import DialogConnectWallet from '../../components/DialogConnectWallet';

export default function ConnectWallet() {
  const [network, setNetwork] = useState<TNetwork>('TestNet');
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)

  const openDialog = () => {
    setDialogOpened(true)
  }

  const handleChangeNetwork = (networkName: string) => {
    if (networkName === 'MainNet') {
      setNetwork('MainNet')
    } else {
      setNetwork('TestNet')
    }
  };

  return (
    <Box>
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box sx={{
            height: '100vh',
            background: 'url(/assets/images/connect-bg.jpeg) no-repeat 50%',
            backgroundSize: 'cover'
          }}>
            {/* <Typography component="h1" textAlign="center" color="white" px={4} fontSize={48} fontWeight={600} pt={24}>
              Create & Manage your Assets
            </Typography> */}
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Stack px={3} justifyContent="center" alignItems="center" spacing={16}>
            <Box component="img" src="/assets/images/logo.png" alt="logo" width={148} mt={14} />
            <Stack justifyContent="center" alignItems="center" spacing={4}>
              <Typography component="h2" textAlign="center" fontSize={24}>
                Select network
              </Typography>

              <RadioGroup row value={network} onChange={(e) => handleChangeNetwork(e.target.value)}>
                <FormControlLabel value="TestNet" control={<Radio />} label="TestNet" />
                <FormControlLabel value="MainNet" control={<Radio />} label="MainNet" />
              </RadioGroup>

              <Button variant="contained" onClick={() => openDialog()}>Connect Wallet</Button>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
      <DialogConnectWallet
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
        network={network}
      />
    </Box>
  )
}