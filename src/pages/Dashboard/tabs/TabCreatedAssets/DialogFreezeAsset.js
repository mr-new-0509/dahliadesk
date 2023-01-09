/* global AlgoSigner */

import React, { useMemo, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { useFormik } from "formik";
import WAValidator from 'multicoin-address-validator';
import algosdk from 'algosdk';
import { Icon } from '@iconify/react';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, MSG_INVAILD_ADDRESS, MSG_REQUIRED, SUCCESS } from '../../../../utils/constants';
import useLoading from '../../../../hooks/useLoading';
import useAlertMessage from '../../../../hooks/useAlertMessage';
import useConnectWallet from '../../../../hooks/useConnectWallet';

const validSchema = yup.object().shape({
  freezeTarget: yup.string().required(MSG_REQUIRED),
});

export default function DialogFreezeAsset({ dialogOpened, setDialogOpened, asset, setDesireReload }) {
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();
  const { network, currentUser, walletName, myAlgoWallet, peraWallet } = useConnectWallet();

  const [freezeState, setFreezeState] = useState(true);

  const textOfSubmitButton = useMemo(() => {
    if (freezeState) {
      return 'Freeze';
    } else {
      return 'Unfreeze';
    }
  }, [freezeState]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const handleRadio = (value) => {
    if (value === 'true') {
      setFreezeState(true);
    } else {
      setFreezeState(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      freezeTarget: '',
      note: ''
    },
    validationSchema: validSchema,
    onSubmit: async (values) => {
      const { freezeTarget, note } = values;
      const isValidAddress = WAValidator.validate(freezeTarget, 'algo');

      if (!isValidAddress) {
        formik.setFieldError('freezeTarget', MSG_INVAILD_ADDRESS);
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

        console.log('>>>>>>>> freezeState => ', freezeState);

        const txn = algosdk.makeAssetFreezeTxnWithSuggestedParams(
          currentUser,
          encodedNote,
          asset['index'],
          freezeTarget,
          freezeState,
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
        console.log('>>>>>>>>> error of DialogFreezeAsset => ', error.message);
        openAlert({
          severity: ERROR,
          message: error.message
        });
        closeLoading();
      }

    }
  });

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} pt={2}>
        <DialogTitle fontWeight={700}>
          Freeze/Unfreeze asset
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
        <Stack spacing={2} alignItems="center">
          <RadioGroup row value={freezeState} onChange={(e) => handleRadio(e.target.value)}>
            <FormControlLabel value={true} control={<Radio />} label="Freeze" />
            <FormControlLabel value={false} control={<Radio />} label="Unfreeze" />
          </RadioGroup>

          <TextField
            name="freezeTarget"
            label="Address *"
            multiline
            value={formik.values.freezeTarget}
            onChange={formik.handleChange}
            error={formik.touched.freezeTarget && Boolean(formik.errors.freezeTarget)}
            helperText={formik.touched.freezeTarget && formik.errors.freezeTarget}
            fullWidth
          />

          <TextField
            name="note"
            label="Note"
            multiline
            minRows={2}
            value={formik.values.note}
            onChange={formik.handleChange}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>{textOfSubmitButton}</Button>
      </DialogActions>
    </Dialog>
  );
}