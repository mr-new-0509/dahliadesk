/* global AlgoSigner */

import React from 'react';
import { Icon as MuiIcon, Dialog, DialogContent, IconButton, Stack, Typography, List, ListItem, ListItemIcon, Avatar, ListItemAvatar, ListItemText, ListItemButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { grey } from '@mui/material/colors';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import { PeraWalletConnect } from "@perawallet/connect";
import useAlertMessage from '../../hooks/useAlertMessage';
import { MSG_NO_ACCOUNT, MSG_NO_ALGO_SIGNER, WARNING } from '../../utils/constants';
import useConnectWallet from '../../hooks/useConnectWallet';

const myAlgoWallet = new MyAlgoConnect();

export default function DialogConnectWallet({ dialogOpened, setDialogOpened, network }) {
  const { openAlert } = useAlertMessage();
  const { connectAct, disconnectAct } = useConnectWallet();

  const closeDialog = () => {
    setDialogOpened(false);
  };

  /** 
   * Connect wallet by AlgoSigner
   */
  const connectByAlgoSigner = async () => {
    if (typeof AlgoSigner !== 'undefined') {
      let resp = await AlgoSigner.connect();
      console.log('>>>>>>> resp => ', resp);
      let accounts = await AlgoSigner.accounts({
        ledger: network
      });
      console.log('>>>>>> accounts => ', accounts);
      if (accounts.length > 0) {
        connectAct(network, accounts[0].address);
      } else {
        openAlert({
          severity: WARNING,
          message: MSG_NO_ACCOUNT
        });
      }
    } else {
      openAlert({
        severity: WARNING,
        message: MSG_NO_ALGO_SIGNER
      });
    }
  };

  /**
   * Connect wallet by MyAlgo wallet
   */
  const connectByMyAlgo = async () => {
    let accounts = await myAlgoWallet.connect();
    if (accounts.length > 0) {
      connectAct(network, accounts[0].address);
    } else {
      openAlert({
        severity: WARNING,
        message: MSG_NO_ACCOUNT
      });
    }
  };

  /**
   * Connect wallet by Pera wallet
   */
  const connectByPera = () => {
    console.log('connectByPera');
    let peraWallet = new PeraWalletConnect({
      network
    });

    peraWallet.connect()
      .then(accounts => {
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", () => {
          peraWallet.disconnect();
          disconnectAct();
        });
        console.log('>>>>>>>> accounts => ', accounts);
        connectAct(network, accounts[0].address);
      });
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="xs" fullWidth>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" px={2} py={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <MuiIcon component={Icon} icon="material-symbols:account-balance-wallet-outline" color="primary" fontSize="large" />
          <Typography component="h2" variant="h5" fontWeight={700}>
            Connect wallet
          </Typography>
        </Stack>

        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogContent>
        <List>
          <ListItem>
            <ListItemButton onClick={() => connectByAlgoSigner()}>
              <ListItemAvatar>
                <Avatar src="/assets/images/algo-signer.jpg" alt="" />
              </ListItemAvatar>
              <ListItemText>AlgoSigner</ListItemText>
              <ListItemIcon>
                <MuiIcon
                  component={Icon}
                  icon="material-symbols:arrow-forward-ios-rounded"
                  fontSize="medium"
                  sx={{ color: 'black' }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => connectByMyAlgo()}>
              <ListItemAvatar>
                <Avatar src="/assets/images/myalgo-wallet.svg" alt="" />
              </ListItemAvatar>
              <ListItemText>MyAlgo Wallet</ListItemText>
              <ListItemIcon>
                <MuiIcon
                  component={Icon}
                  icon="material-symbols:arrow-forward-ios-rounded"
                  fontSize="medium"
                  sx={{ color: 'black' }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>

          <ListItem>
            <ListItemButton onClick={() => connectByPera()}>
              <ListItemAvatar>
                <Avatar src="/assets/images/pera-wallet.svg" alt="" />
              </ListItemAvatar>
              <ListItemText>Pera Wallet</ListItemText>
              <ListItemIcon>
                <MuiIcon
                  component={Icon}
                  icon="material-symbols:arrow-forward-ios-rounded"
                  fontSize="medium"
                  sx={{ color: 'black' }}
                />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
      </DialogContent>

      <Typography textAlign="center" mb={5} color={grey[600]} fontSize={14}>
        By connecting, I accept Dahliadesk Terms of Service
      </Typography>
    </Dialog>
  );
}