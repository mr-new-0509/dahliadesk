import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Icon } from "@iconify/react"
import { Avatar, Box, Button, Divider, Fab, Grid, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Stack, Typography } from "@mui/material"
import { Outlet, useNavigate } from "react-router"
import copy from 'copy-to-clipboard'
import ScrollFab from "../components/ScrollFab"
import useConnectWallet from '../hooks/useConnectWallet'
import DialogQrCode from './DialogQrCode'
import useAlertMessage from '../hooks/useAlertMessage'
import { SUCCESS } from '../utils/constants'
import DialogConnectWallet from '../components/DialogConnectWallet'

export default function DashboardLayout() {
  const navigate = useNavigate()
  const { currentUser, disconnectAct, network, balance } = useConnectWallet()
  const { openAlert } = useAlertMessage()

  const [dialogOrCodeOpened, setDialogQrCodeOpened] = useState<boolean>(false)
  const [dialogConnectWalletOpened, setDialogConnectWalletOpened] = useState<boolean>(false)

  const handleDisconnectWallet = () => {
    disconnectAct()
    navigate('/')
  }

  const openDialogQrCode = () => {
    setDialogQrCodeOpened(true)
  }

  const openDialogConnectWallet = () => {
    setDialogConnectWalletOpened(true)
  }

  const copyCurrentUser = () => {
    copy(currentUser)
    openAlert({
      severity: SUCCESS,
      message: 'Copied.'
    })
  }

  return (
    <Box>
      <Grid container>
        <Grid item md={2}>
          <Box height="100vh" bgcolor="#4fa7ef">
            <Stack direction="row" justifyContent="center" bgcolor="#316db7" py={3}>
              <Box component="img" src="/assets/images/logo.png" alt="logo" width={148} />
            </Stack>

            {/* Wallet data */}
            <Stack alignItems="center" justifyContent="center" spacing={2} mt={4}>
              {/* avatar */}
              <Avatar src="/assets/images/default-avatar.png" alt="" sx={{ width: 84, height: 84 }} />

              {/* wallet address */}
              <Box width="100%">
                <Typography textAlign="center" px={2} color="white" sx={{ overflowWrap: 'break-word' }} fontSize={12}>
                  {currentUser}
                </Typography>
              </Box>

              {/* functional buttons */}
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
                {/* Copy */}
                <Fab size="small" sx={{ fontSize: 18 }} onClick={() => copyCurrentUser()}>
                  <Icon icon="ic:outline-file-copy" />
                </Fab>
                {/* QR code */}
                <Fab size="small" sx={{ fontSize: 18 }} onClick={() => openDialogQrCode()}>
                  <Icon icon="mdi:data-matrix-scan" />
                </Fab>
                {/* Switch wallet */}
                <Fab size="small" sx={{ fontSize: 18 }} onClick={() => openDialogConnectWallet()}>
                  <Icon icon="system-uicons:swap" />
                </Fab>
              </Stack>

              {/* explore button */}
              <Button startIcon={<Icon icon="ph:arrow-square-out" />}>
                View in explorer
              </Button>

              {/* balance */}
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
                <Typography component="span">
                  Balance: {balance}
                </Typography>
                <Box component="img" src="/assets/images/algo.png" alt="" width={13} />
              </Stack>

              {/* disconnect button */}
              <Button variant="contained" onClick={() => handleDisconnectWallet()}>
                Disconnect
              </Button>
            </Stack>

            <Divider sx={{ mt: 3 }} />

            <List>
              <ListItem>
                <ListItemButton component={RouterLink} to="/dashboard">
                  <ListItemIcon sx={{ fontSize: 20 }}>
                    <Icon icon="material-symbols:dashboard" />
                  </ListItemIcon>

                  <ListItemText>
                    Dashboard
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            </List>
          </Box>
        </Grid>

        <Grid item md={10}>
          <Outlet />
          <ScrollFab />
        </Grid>
      </Grid>
      <DialogQrCode
        dialogOpened={dialogOrCodeOpened}
        setDialogOpened={setDialogQrCodeOpened}
      />
      <DialogConnectWallet
        dialogOpened={dialogConnectWalletOpened}
        setDialogOpened={setDialogConnectWalletOpened}
        network={network}
      />
    </Box >
  )
}