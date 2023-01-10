import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import { blue } from '@mui/material/colors';
import { WALLET_ALGO_SIGNER, WALLET_MY_ALGO, WALLET_PERA } from '../utils/constants';
import useConnectWallet from '../hooks/useConnectWallet';

export default function DialogSelectWalletAccount({ accounts, dialogOpened, setDialogOpened, network, walletName, myAlgoWallet, peraWallet }) {
  const { connectAct } = useConnectWallet();

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const selectAccount = (account) => {
    if (walletName === WALLET_ALGO_SIGNER) {
      connectAct(network, account.address, WALLET_ALGO_SIGNER);
    } else if (walletName === WALLET_MY_ALGO && myAlgoWallet) {
      connectAct(network, account.address, WALLET_MY_ALGO, myAlgoWallet);
    } else if (walletName === WALLET_PERA && peraWallet) {
      connectAct(network, account, WALLET_PERA, undefined, peraWallet);
    }
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="xs" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          Select Account
        </DialogTitle>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogContent>
        <Stack spacing={2}>
          {accounts.map((accountItem, index) => (
            <Box
              key={index}
              sx={{ overflowWrap: 'anywhere', bgcolor: blue[100], p: 2, cursor: 'pointer' }}
              onClick={() => selectAccount(accountItem)}
            >
              {accountItem.address}
            </Box>
          ))}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}