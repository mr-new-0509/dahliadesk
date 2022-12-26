/* global AlgoSigner */

import React, { useEffect } from 'react';
import { Icon as MuiIcon, Dialog, DialogContent, IconButton, Stack, Typography, List, ListItem, ListItemIcon, Avatar, ListItemAvatar, ListItemText, ListItemButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { grey } from '@mui/material/colors';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import useAlertMessage from '../../hooks/useAlertMessage';
import { MSG_NO_ACCOUNT, MSG_NO_ALGO_SIGNER, WARNING } from '../../utils/constants';
import useConnectWallet from '../../hooks/useConnectWallet';

const myAlgoWallet = new MyAlgoConnect();

export default function DialogConnectWallet({ dialogOpened, setDialogOpened, network }) {
  const { openAlert } = useAlertMessage();
  const { connectAct } = useConnectWallet();

  const closeDialog = () => {
    setDialogOpened(false);
  };

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

  const connectByPera = () => {

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