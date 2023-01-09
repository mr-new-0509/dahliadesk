import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import { blue } from '@mui/material/colors';
import { WALLET_ALGO_SIGNER } from '../utils/constants';
import useConnectWallet from '../hooks/useConnectWallet';

export default function DialogSelectWalletAccount({ accounts, dialogOpened, setDialogOpened, network }) {
  const { connectAct } = useConnectWallet();

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const selectAccount = (account) => {
    connectAct(network, account.address, WALLET_ALGO_SIGNER);
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
          {accounts.map(accountItem => (
            <Box
              key={accountItem.address}
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