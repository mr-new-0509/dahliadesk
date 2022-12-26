import React, { useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button } from '@mui/material'
import { Icon } from '@iconify/react'
import DialogOptInAsset from './DialogOptInAsset'
import NoData from '../../../../components/NoData'

export default function TabOptedAssets() {
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
        >Opt-in asset</Button>
      </Stack>
      <Box>
        <NoData text="This account doesn't have any created assets" />
      </Box>
      <DialogOptInAsset
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
      />
    </Box>
  )
}