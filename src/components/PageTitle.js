/* global AlgoSigner */
import React from 'react';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { PeraWalletConnect } from "@perawallet/connect";
import useConnectWallet from '../hooks/useConnectWallet';
import { MSG_NO_ACCOUNT, MSG_NO_ALGO_SIGNER, WALLET_ALGO_SIGNER, WALLET_PERA, WARNING } from '../utils/constants';
import useAlertMessage from '../hooks/useAlertMessage';

export default function PageTitle() {
  const { network, walletName, connectAct, disconnectAct } = useConnectWallet();
  const { openAlert } = useAlertMessage();

  const switchNetwork = async (network) => {
    if (walletName === WALLET_ALGO_SIGNER) {
      if (typeof AlgoSigner !== 'undefined') {
        await AlgoSigner.connect();
        let accounts = await AlgoSigner.accounts({
          ledger: network
        });
        if (accounts.length > 0) {
          connectAct(network, accounts[0].address, WALLET_ALGO_SIGNER);
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
    } else if (walletName === WALLET_PERA) {
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
          connectAct(network, accounts[0].address, WALLET_PERA);
        });
    }

  };

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mt={4}>
      <Typography component="h2" fontSize={28} fontWeight={600}>
        Dashboard
      </Typography>
      <ButtonGroup>
        <Button onClick={() => switchNetwork('TestNet')} variant={network === 'TestNet' ? 'contained' : 'outlined'}>
          TestNet
        </Button>
        <Button onClick={() => switchNetwork('MainNet')} variant={network === 'MainNet' ? 'contained' : 'outlined'}>
          MainNet
        </Button>
      </ButtonGroup>
    </Stack>
  );
}