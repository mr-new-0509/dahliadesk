import React from 'react';
import { Dialog, DialogContent, IconButton, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import QRCode from 'react-qr-code';
import useConnectWallet from '../hooks/useConnectWallet';

export default function DialogQrCode({ dialogOpened, setDialogOpened }) {
  const { currentUser } = useConnectWallet();

  const closeDialog = () => {
    setDialogOpened(false);
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()}>
      {/* Header */}
      <Stack direction="row" justifyContent="end" alignItems="center" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>
      <DialogContent>
        <QRCode value={currentUser} />
      </DialogContent>
    </Dialog>
  );
}