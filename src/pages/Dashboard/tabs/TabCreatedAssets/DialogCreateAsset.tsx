import React, { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, Icon as MuiIcon, IconButton, MenuItem, Stack, Switch, TextField, Tooltip } from '@mui/material'
import { Icon } from '@iconify/react';

interface IProps {
  dialogOpened: boolean;
  setDialogOpened: Function;
}

export default function DialogCreateAsset({ dialogOpened, setDialogOpened }: IProps) {
  const [managerEnabled, setManagerEnabled] = useState<boolean>(true)
  const [reserveEnabled, setReserveEnabled] = useState<boolean>(true)
  const [freezeEnabled, setFreezeEnabled] = useState<boolean>(true)
  const [clawbackEnabled, setClawbackEnabled] = useState<boolean>(true)

  const closeDialog = () => {
    setDialogOpened(false)
  }

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="end" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogTitle>
        Asset Details
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ pt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Name"
              name="name"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Unit name"
              name="unitName"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Total supply"
              name="totalSupply"
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Decimals"
              defaultValue={0}
              fullWidth
            >
              {
                [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(item => (
                  <MenuItem key={item} value={item}>{item}</MenuItem>
                ))
              }
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Url"
              name="url"
              multiline
              minRows={2}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Metadata hash"
              name="metadata hash"
              multiline
              minRows={2}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogTitle>
        Asset management
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={managerEnabled} onChange={() => setManagerEnabled(!managerEnabled)} />}
              label={
                <Tooltip
                  title="The address of the account that can manage the configuration of the asset and destroy it"
                  placement="bottom-start"
                  sx={{ pt: 1 }}
                  arrow
                >
                  <MuiIcon component={Icon} icon="material-symbols:info-outline-rounded" />
                </Tooltip>
              }
              labelPlacement="start"
            />
            <TextField
              label="Manager"
              name="manager"
              multiline
              minRows={2}
              disabled={!managerEnabled}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={reserveEnabled} onChange={() => setReserveEnabled(!reserveEnabled)} />}
              label={
                <Tooltip
                  title="The address of the account that holds the reserve (non-minted) units of the asset. This address has no specific authority in the protocol itself. It is used in the case where you want to signal to holders of your asset that the non-minted units of the asset reside in an account that is different from the default creator account (the sender)"
                  placement="bottom-start"
                  sx={{ pt: 1 }}
                  arrow
                >
                  <MuiIcon component={Icon} icon="material-symbols:info-outline-rounded" />
                </Tooltip>
              }
              labelPlacement="start"
            />
            <TextField
              label="Reserve"
              name="reserve"
              multiline
              minRows={2}
              disabled={!reserveEnabled}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={freezeEnabled} onChange={() => setFreezeEnabled(!freezeEnabled)} />}
              label={
                <Tooltip
                  title="The address of the account used to freeze holdings of this asset. If empty, freezing is not permitted"
                  placement="bottom-start"
                  sx={{ pt: 1 }}
                  arrow
                >
                  <MuiIcon component={Icon} icon="material-symbols:info-outline-rounded" />
                </Tooltip>
              }
              labelPlacement="start"
            />
            <TextField
              label="Freeze"
              name="freeze"
              multiline
              minRows={2}
              disabled={!freezeEnabled}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={clawbackEnabled} onChange={() => setClawbackEnabled(!clawbackEnabled)} />}
              label={
                <Tooltip
                  title="The address of the account that can clawback holdings of this asset. If empty, clawback is not permitted."
                  placement="bottom-start"
                  sx={{ pt: 1 }}
                  arrow
                >
                  <MuiIcon component={Icon} icon="material-symbols:info-outline-rounded" />
                </Tooltip>
              }
              labelPlacement="start"
            />
            <TextField
              label="Clawback"
              name="clawback"
              multiline
              minRows={2}
              disabled={!clawbackEnabled}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={12}>
            <TextField
              name="note"
              label="Note"
              multiline
              minRows={2}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => closeDialog()}>Create</Button>
      </DialogActions>
    </Dialog >
  )
}