import React, { useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, Button } from '@mui/material'
import { Icon } from '@iconify/react'
import DialogMintNft from './DialogMintNft'
import NoData from '../../../../components/NoData'

export default function TabNftCollection() {
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)

  const openDialog = () => {
    setDialogOpened(true)
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          name="searchKeyword"
          label="Search NFT"
          placeholder="Name"
          InputProps={{
            startAdornment: <MuiIcon component={Icon} icon="material-symbols:search-rounded" />
          }}
        />

        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => openDialog()}
        >Mint NFT</Button>
      </Stack>
      <Box>
        <NoData text="This account doesn't have any created assets" />
      </Box>
      <DialogMintNft
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
      />
    </Box>
  )
}