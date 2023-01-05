import React from 'react';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { Icon } from '@iconify/react';

export default function DialogMetadata({ dialogOpened, setDialogOpened, asset, metadata }) {
  const closeDialog = () => {
    setDialogOpened(false);
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} pt={2}>
        <DialogTitle fontWeight={700}>
          Metadata of NFT
        </DialogTitle>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogTitle component={Typography} variant="h5" textAlign="center" sx={{ pb: 0 }}>
        {asset['params']['name']}
      </DialogTitle>
      <Typography textAlign="center" sx={{ pt: 0 }}>
        ID: {asset['index']}
      </Typography>

      <DialogContent>
        <Box px={4} py={2} bgcolor={blue[100]} borderRadius={4}>
          <pre>
            {JSON.stringify(metadata, null, 4)}
          </pre>
        </Box>
      </DialogContent>
    </Dialog>
  );
}