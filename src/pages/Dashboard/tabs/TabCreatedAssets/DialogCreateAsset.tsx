import React, { useState } from 'react'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Grid, Icon as MuiIcon, IconButton, MenuItem, Stack, Switch, TextField, Tooltip } from '@mui/material'
import { Icon } from '@iconify/react'
import * as yup from 'yup'
import { useFormik } from "formik";
import { MSG_REQUIRED } from '../../../../utils/constants';
import useConnectWallet from '../../../../hooks/useConnectWallet';

interface IProps {
  dialogOpened: boolean;
  setDialogOpened: Function;
}

const validSchema = yup.object().shape({
  assetName: yup.string().required(MSG_REQUIRED),
  unitName: yup.string().required(MSG_REQUIRED),
  totalIssuance: yup.number().min(1, 'Minimum value is 1.').required(MSG_REQUIRED),
  assetUrl: yup.string().required(MSG_REQUIRED),
  assetMetadataHash: yup.string().required(MSG_REQUIRED).length(32, 'Required length is 32.'),
  manager: yup.string().required(MSG_REQUIRED),
  reserve: yup.string().required(MSG_REQUIRED),
  freeze: yup.string().required(MSG_REQUIRED),
  clawback: yup.string().required(MSG_REQUIRED)
})

export default function DialogCreateAsset({ dialogOpened, setDialogOpened }: IProps) {
  const { currentUser } = useConnectWallet()

  const [managerEnabled, setManagerEnabled] = useState<boolean>(false)
  const [reserveEnabled, setReserveEnabled] = useState<boolean>(false)
  const [freezeEnabled, setFreezeEnabled] = useState<boolean>(false)
  const [clawbackEnabled, setClawbackEnabled] = useState<boolean>(false)

  const closeDialog = () => {
    setDialogOpened(false)
  }

  const formik = useFormik({
    initialValues: {
      assetName: '',
      unitName: '',
      totalIssuance: 1,
      decimals: 0,
      assetUrl: '',
      assetMetadataHash: '',
      manager: currentUser,
      reserve: currentUser,
      freeze: currentUser,
      clawback: currentUser,
      note: ''
    },
    validationSchema: validSchema,
    onSubmit: (values) => {
      console.log('>>>>>>>>>> values => ', values)
      let { assetName, unitName, totalIssuance, decimals, assetUrl, assetMetadataHash, manager, reserve, freeze, clawback, note } = values
    }
  })

  const switchManager = (enabled: boolean) => {
    setManagerEnabled(enabled)
    formik.setFieldValue('manager', currentUser)
  }

  const switchReserve = (enabled: boolean) => {
    setReserveEnabled(enabled)
    formik.setFieldValue('reserve', currentUser)
  }

  const switchFreeze = (enabled: boolean) => {
    setFreezeEnabled(enabled)
    formik.setFieldValue('freeze', currentUser)
  }

  const switchClawback = (enabled: boolean) => {
    setClawbackEnabled(enabled)
    formik.setFieldValue('clawback', currentUser)
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
            {/* Name */}
            <TextField
              label="Name"
              name="assetName"
              value={formik.values.assetName}
              onChange={formik.handleChange}
              error={formik.touched.assetName && Boolean(formik.errors.assetName)}
              helperText={formik.touched.assetName && formik.errors.assetName}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Unit name */}
            <TextField
              label="Unit name"
              name="unitName"
              value={formik.values.unitName}
              onChange={formik.handleChange}
              error={formik.touched.unitName && Boolean(formik.errors.unitName)}
              helperText={formik.touched.unitName && formik.errors.unitName}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Total Supply */}
            <TextField
              type="number"
              label="Total supply"
              name="totalIssuance"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={formik.values.totalIssuance}
              onChange={formik.handleChange}
              error={formik.touched.totalIssuance && Boolean(formik.errors.totalIssuance)}
              helperText={formik.touched.totalIssuance && formik.errors.totalIssuance}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Decimals */}
            <TextField
              select
              label="Decimals"
              name="decimals"
              value={formik.values.decimals}
              onChange={formik.handleChange}
              error={formik.touched.decimals && Boolean(formik.errors.decimals)}
              helperText={formik.touched.decimals && formik.errors.decimals}
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
            {/* Url */}
            <TextField
              label="Url"
              name="assetUrl"
              multiline
              minRows={2}
              value={formik.values.assetUrl}
              onChange={formik.handleChange}
              error={formik.touched.assetUrl && Boolean(formik.errors.assetUrl)}
              helperText={formik.touched.assetUrl && formik.errors.assetUrl}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            {/* Metadata hash */}
            <TextField
              label="Metadata hash"
              name="assetMetadataHash"
              multiline
              minRows={2}
              value={formik.values.assetMetadataHash}
              onChange={formik.handleChange}
              error={formik.touched.assetMetadataHash && Boolean(formik.errors.assetMetadataHash)}
              helperText={formik.touched.assetMetadataHash && formik.errors.assetMetadataHash}
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
          {/* Manager */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={managerEnabled} onChange={() => switchManager(!managerEnabled)} />}
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
              value={formik.values.manager}
              onChange={formik.handleChange}
              error={formik.touched.manager && Boolean(formik.errors.manager)}
              helperText={formik.touched.manager && formik.errors.manager}
              fullWidth
            />
          </Grid>

          {/* Reserve */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={reserveEnabled} onChange={() => switchReserve(!reserveEnabled)} />}
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
              value={formik.values.reserve}
              onChange={formik.handleChange}
              error={formik.touched.reserve && Boolean(formik.errors.reserve)}
              helperText={formik.touched.reserve && formik.errors.reserve}
              fullWidth
            />
          </Grid>

          {/* Freeze */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={freezeEnabled} onChange={() => switchFreeze(!freezeEnabled)} />}
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
              value={formik.values.freeze}
              onChange={formik.handleChange}
              error={formik.touched.freeze && Boolean(formik.errors.freeze)}
              helperText={formik.touched.freeze && formik.errors.freeze}
              fullWidth
            />
          </Grid>

          {/* Clawback */}
          <Grid item xs={12} md={6}>
            <FormControlLabel
              control={<Switch checked={clawbackEnabled} onChange={() => switchClawback(!clawbackEnabled)} />}
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
              value={formik.values.clawback}
              onChange={formik.handleChange}
              error={formik.touched.clawback && Boolean(formik.errors.clawback)}
              helperText={formik.touched.clawback && formik.errors.clawback}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={12}>
            {/* Note */}
            <TextField
              name="note"
              label="Note"
              multiline
              minRows={2}
              value={formik.values.note}
              onChange={formik.handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>Create</Button>
      </DialogActions>
    </Dialog >
  )
}