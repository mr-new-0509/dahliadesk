import React from 'react'
import { Dialog, IconButton, Stack } from '@mui/material'
import { Icon } from '@iconify/react';

interface IProps {
  dialogOpened: boolean;
  setDialogOpened: Function;
}

export default function DialogConnectWallet({ dialogOpened, setDialogOpened }: IProps) {

  const closeDialog = () => {
    setDialogOpened(false)
  }

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="xs" fullWidth>
      <Stack direction="row" justifyContent="end" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>
    </Dialog>
  )
}