import React, { useState } from 'react'
import { Box, Button, Dialog, DialogActions, DialogContent, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Stack, TextField } from '@mui/material'
import { Icon } from '@iconify/react';

type TNftStandard = 'arc69' | 'arc3'

interface IProps {
  dialogOpened: boolean;
  setDialogOpened: Function;
}

export default function DialogMintNft({ dialogOpened, setDialogOpened }: IProps) {
  const [nftStandard, setNftStandard] = useState<TNftStandard>('arc69')


  const closeDialog = () => {
    setDialogOpened(false)
  }

  const changeNftStandard = (standard: string) => {
    if (standard === 'arc69') {
      setNftStandard('arc69')
    } else {
      setNftStandard('arc3')
    }
  }

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="end" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogContent>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel htmlFor="nft-standard">NFT standard</FormLabel>
            <RadioGroup id="nft-standard" row value={nftStandard} onChange={(e) => changeNftStandard(e.target.value)}>
              <FormControlLabel value="arc69" control={<Radio />} label="ARC69" />
              <FormControlLabel value="arc3" control={<Radio />} label="ARC3" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="file">File</FormLabel>
            <TextField
              id="file"
              type="file"
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="name">Name</FormLabel>
            <TextField
              id="name"
              placeholder="CryptoKittie #99"
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="unit-name">Unit name</FormLabel>
            <TextField
              id="unit-name"
              placeholder="Kittie"
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="description">Description</FormLabel>
            <TextField
              id="description"
              placeholder="Describe your NFT in few words"
              multiline
              minRows={4}
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="properties">Properties</FormLabel>
            <Stack spacing={2} id="properties">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box width="45%">
                  <TextField
                    name="propertyKey"
                    placeholder="Key"
                    fullWidth
                  />
                </Box>
                <Box width="45%">
                  <TextField
                    name="propertyValue"
                    placeholder="Value"
                    fullWidth
                  />
                </Box>
                <Box>
                  <IconButton color="primary">
                    <Icon icon="material-symbols:add" />
                  </IconButton>
                </Box>
              </Stack>
            </Stack>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => closeDialog()}>Mint</Button>
      </DialogActions>
    </Dialog>
  )
}