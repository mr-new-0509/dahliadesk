/* global AlgoSigner */
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, FormControlLabel, Grid, Icon, IconButton, Stack, Switch, TextField, Tooltip, Typography, Icon as MuiIcon, DialogActions, Button } from '@mui/material';
import { useFormik } from "formik";
import WAValidator from 'multicoin-address-validator';
import algosdk from 'algosdk';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, MSG_INVAILD_ADDRESS, SUCCESS } from '../../../../utils/constants';
import useLoading from '../../../../hooks/useLoading';
import useAlertMessage from '../../../../hooks/useAlertMessage';

export default function DialogModifyAsset({ dialogOpened, setDialogOpened, asset, setDesireReload }) {
  const { currentUser, network, myAlgoWallet, walletName, peraWallet } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const [managerEnabled, setManagerEnabled] = useState(false);
  const [reserveEnabled, setReserveEnabled] = useState(false);
  const [freezeEnabled, setFreezeEnabled] = useState(false);
  const [clawbackEnabled, setClawbackEnabled] = useState(false);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const formik = useFormik({
    initialValues: {
      manager: currentUser,
      reserve: currentUser,
      freeze: currentUser,
      clawback: currentUser
    },
    onSubmit: async (values) => {
      const { manager, reserve, freeze, clawback, note } = values;

      const isValidManager = WAValidator.validate(manager, 'algo');
      const isValidReserve = WAValidator.validate(reserve, 'algo');
      const isValidFreeze = WAValidator.validate(freeze, 'algo');
      const isValidClawback = WAValidator.validate(clawback, 'algo');

      if (!isValidManager) {
        formik.setFieldError('manager', MSG_INVAILD_ADDRESS);
        return;
      }

      if (!isValidReserve) {
        formik.setFieldError('reserve', MSG_INVAILD_ADDRESS);
        return;
      }

      if (!isValidFreeze) {
        formik.setFieldError('freeze', MSG_INVAILD_ADDRESS);
        return;
      }

      if (!isValidClawback) {
        formik.setFieldError('clawback', MSG_INVAILD_ADDRESS);
        return;
      }

      try {
        openLoading();

        let algodServer = '';
        if (network === 'MainNet') {
          algodServer = ALGOD_SERVER_MAINNET;
        } else {
          algodServer = ALGOD_SERVER_TESTNET;
        }

        //  Encode note into Uint8Array
        const enc = new TextEncoder();
        const encodedNote = enc.encode(note);

        const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);
        const params = await algodClient.getTransactionParams().do();

        const txn = algosdk.makeAssetConfigTxnWithSuggestedParams(
          currentUser,
          encodedNote,
          asset['index'],
          manager,
          reserve,
          freeze,
          clawback,
          params
        );

        const txId = txn.txID().toString();

        if (walletName === 'MyAlgo') {
          const signedTxn = await myAlgoWallet.signTransaction(txn.toByte());
          console.log('>>>>>>>>>> signedTxn => ', signedTxn);

          await algodClient.sendRawTransaction(signedTxn.blob).do();
        } else if (walletName === 'AlgoSigner') {
          const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());
          console.log('>>>>>>>> txn_b64 => ', txn_b64);
          const signedTxns = await AlgoSigner.signTxn([{ txn: txn_b64 }]);
          console.log('>>>>>>>> signedTxns => ', signedTxns);
          const binarySignedTxn = await AlgoSigner.encoding.base64ToMsgpack(signedTxns[0].blob);
          console.log('>>>>>>>> binarySignedTxn => ', binarySignedTxn);
          await algodClient.sendRawTransaction(binarySignedTxn).do();
        } else {
          /* ----------------- Need test -------------------- */
          const singleTxnGroups = [{ txn, signers: [currentUser] }];
          const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);
          await algodClient.sendRawTransaction(signedTxn.blob).do();
        }

        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log('>>>>>>>> confirmedTxn => ', confirmedTxn);

        const txnResponse = await algodClient.pendingTransactionInformation(txId).do();
        console.log('>>>>>>>>> txnResponse => ', txnResponse);
        closeLoading();
        closeDialog();
        openAlert({
          severity: SUCCESS,
          message: `Transaction ${txId} confirmed in round ${txnResponse['confirmed-round']}. The asset id is ${txnResponse['asset-index']}`
        });
        setDesireReload(true);
      } catch (error) {
        console.log('>>>>>>>>> error of DialogModifyAsset => ', error.message);
        openAlert({
          severity: ERROR,
          message: error.message
        });
        closeLoading();
      }
    }
  });

  const switchManager = (enabled) => {
    setManagerEnabled(enabled);
    formik.setFieldValue('manager', currentUser);
  };

  const switchReserve = (enabled) => {
    setReserveEnabled(enabled);
    formik.setFieldValue('reserve', currentUser);
  };

  const switchFreeze = (enabled) => {
    setFreezeEnabled(enabled);
    formik.setFieldValue('freeze', currentUser);
  };

  const switchClawback = (enabled) => {
    setClawbackEnabled(enabled);
    formik.setFieldValue('clawback', currentUser);
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          Modify Asset
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
        <Button variant="contained" onClick={() => formik.handleSubmit()}>Modify</Button>
      </DialogActions>
    </Dialog>
  );
}