import React, { useEffect } from 'react';
import { Box, Dialog, IconButton, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import * as QRCode from 'algorand-qrcode';
import useConnectWallet from '../hooks/useConnectWallet';

export default function DialogQrCode({ dialogOpened, setDialogOpened }) {
  const { currentUser } = useConnectWallet();

  useEffect(() => {
    // QRCode.toDataURL({
    //   wallet: currentUser,
    //   label: 'mr.new0509@gmail.com'
    // }).then((res) => {
    //   console.log('>>>>>>>>>> res => ', res);
    //   // console.log('>>>>>>>>>> algorandURI => ', algorandURI);
    // }).catch((error) => {
    //   console.log('>>>>>>>>> error => ', error);
    // });
    QRCode.toCanvas(document.getElementById('qr-code'), { wallet: currentUser, label: 'emg110@gmail.com' }, (error) => {
      if (error) {
        console.log('>>>>>>>>>>> error => ', error);
      } else {
        console.log('>>>>>>>>>>> success');
      }

    });
  }, [currentUser]);

  const closeDialog = () => {
    setDialogOpened(false);
  };
  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()}>
      {/* Header */}
      <Stack direction="row" justifyContent="end" alignItems="center" px={2} py={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>
      <Box>
        <canvas height="250" width="250" style={{ height: '250px', width: '250px' }} id="qr-code"></canvas>
      </Box>
    </Dialog>
  );
}