import React, { useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button } from '@mui/material'
import { Icon } from '@iconify/react'
import DialogCreateAsset from './DialogCreateAsset'

export default function CreatedAssetsTab() {
  const [hideZeroBalance, setHideZeroBalance] = useState<boolean>(false)
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)

  const handleCheck = () => {
    setHideZeroBalance(!hideZeroBalance)
  }

  const openDialog = () => {
    setDialogOpened(true)
  }
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            name="searchKeyword"
            label="Search asset"
            placeholder="Name"
            InputProps={{
              startAdornment: <MuiIcon component={Icon} icon="material-symbols:search-rounded" />
            }}
          />
          <FormControlLabel
            control={<Checkbox checked={hideZeroBalance} onChange={() => handleCheck()} />}
            label="Hide 0 balance"
          />
        </Stack>

        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => openDialog()}
        >Create asset</Button>
      </Stack>
      <DialogCreateAsset
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
      />
    </Box>
  )
}