/* global AlgoSigner */

import React, { useState } from 'react';
import { Icon as MuiIcon, Dialog, DialogContent, IconButton, Stack, Typography, List, ListItem, ListItemIcon, Avatar, ListItemAvatar, ListItemText, ListItemButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { grey } from '@mui/material/colors';
import MyAlgoConnect from '@randlabs/myalgo-connect';
import { PeraWalletConnect } from "@perawallet/connect";
import useAlertMessage from '../hooks/useAlertMessage';
import { MSG_NO_ACCOUNT, MSG_NO_ALGO_SIGNER, WALLET_ALGO_SIGNER, WALLET_MY_ALGO, WALLET_PERA, WARNING } from '../utils/constants';
import useConnectWallet from '../hooks/useConnectWallet';
import { getBalanceOfCurrentUser } from '../utils/functions';
import DialogSelectWalletAccount from './DialogSelectWalletAccount';

const myAlgoWallet = new MyAlgoConnect();

export default function DialogConnectWallet({ dialogOpened, setDialogOpened, network }) {
  const { openAlert } = useAlertMessage();
  const { connectAct, disconnectAct } = useConnectWallet();

  const [accounts, setAccounts] = useState([]);
  const [dialogSelectAccountOpened, setDialogSelectAccountOpened] = useState(false);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  /** 
   * Connect wallet by AlgoSigner
   */
  const connectByAlgoSigner = async () => {
    if (typeof AlgoSigner !== 'undefined') {
      await AlgoSigner.connect();
      let walletAccounts = await AlgoSigner.accounts({
        ledger: network
      });
      setAccounts(walletAccounts);
      if (walletAccounts.length > 0) {
        if (walletAccounts.length > 1) {
          setDialogSelectAccountOpened(true);
        } else {
          connectAct(network, walletAccounts[0].address, WALLET_ALGO_SIGNER);
        }
        closeDialog();
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
    let walletAccounts = await myAlgoWallet.connect();
    setAccounts(walletAccounts);
    if (walletAccounts.length > 0) {
      connectAct(network, walletAccounts[0].address, WALLET_MY_ALGO, myAlgoWallet);
      getBalanceOfCurrentUser(walletAccounts[0].address, network);
      closeDialog();
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
    let peraWallet = new PeraWalletConnect({
      network: network === 'MainNet' ? 'mainnet' : 'testnet'
    });

    peraWallet
      .connect()
      .then(walletAccounts => {
        setAccounts(walletAccounts);
        // Setup the disconnect event listener
        peraWallet.connector?.on("disconnect", () => {
          peraWallet.disconnect();
          disconnectAct();
        });
        connectAct(network, walletAccounts[0], WALLET_PERA, undefined, peraWallet);
        closeDialog();
      })
      .catch(error => {
        if (error.message === 'Session currently connected') {
          peraWallet.reconnectSession().then((walletAccounts) => {
            console.log('>>>>>>> walletAccounts => ', walletAccounts);
            // Setup the disconnect event listener
            peraWallet.connector?.on("disconnect", () => {
              peraWallet.disconnect();
              disconnectAct();
            });

            if (peraWallet.isConnected && walletAccounts.length) {
              setAccounts(walletAccounts);
              connectAct(network, walletAccounts[0], WALLET_PERA, undefined, peraWallet);
              closeDialog();
            }
          });
        }
      });
  };

  return (
    <>
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
      <DialogSelectWalletAccount
        accounts={accounts}
        dialogOpened={dialogSelectAccountOpened}
        setDialogOpened={setDialogSelectAccountOpened}
        network={network}
      />
    </>
  );
}