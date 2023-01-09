/* global AlgoSigner */
import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { useFormik } from "formik";
import algosdk from 'algosdk';
import WAValidator from 'multicoin-address-validator';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, MSG_INVAILD_ADDRESS, MSG_REQUIRED, SUCCESS } from '../utils/constants';
import useConnectWallet from '../hooks/useConnectWallet';
import useLoading from '../hooks/useLoading';
import useAlertMessage from '../hooks/useAlertMessage';

export default function DialogSendAssets({ dialogTitle, dialogOpened, setDialogOpened, asset, setDesireReload }) {
  const { network, currentUser, walletName, myAlgoWallet, peraWallet } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const [validSchema, setValidSchema] = useState(null);

  const balanceToView = useMemo(() => {
    return asset['params']['total'] / 10 ** asset['params']['decimals'];
  }, [asset]);

  useEffect(() => {
    const schema = yup.object().shape({
      recipient: yup.string().required(MSG_REQUIRED),
      amount: yup.number().min(1, 'Minimum amount is 1.').max(balanceToView, `Maximum amount is ${balanceToView}`).required(MSG_REQUIRED),
    });
    setValidSchema(schema);
  }, [balanceToView]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const setAmountAsMax = () => {
    formik.setFieldValue('amount', balanceToView);
  };

  const formik = useFormik({
    initialValues: {
      recipient: '',
      amount: 1,
      note: ''
    },
    validationSchema: validSchema,
    onSubmit: async (values) => {
      console.log('>>>>>> values => ', values);
      const { recipient, amount, note } = values;
      const isValidRecipient = WAValidator.validate(recipient, 'algo');

      //  Validate whether the recipient has a valid address
      if (!isValidRecipient) {
        formik.setFieldError('recipient', MSG_INVAILD_ADDRESS);
        return;
      } else {
        try {
          openLoading();
          //  Encode note into Uint8Array
          const enc = new TextEncoder();
          const encodedNote = enc.encode(note);

          let algodServer = '';
          if (network === 'MainNet') {
            algodServer = ALGOD_SERVER_MAINNET;
          } else {
            algodServer = ALGOD_SERVER_TESTNET;
          }

          const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);
          const params = await algodClient.getTransactionParams().do();

          const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
            currentUser,
            recipient,
            undefined,
            undefined,
            amount * 10 ** asset['params']['decimals'],
            encodedNote,
            asset['index'],
            params
          );
          const txId = txn.txID().toString();

          if (walletName === 'MyAlgo') {
            let signedTxn = await myAlgoWallet.signTransaction(txn.toByte());
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

          let confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
          console.log('>>>>>>>> confirmedTxn => ', confirmedTxn);

          let txnResponse = await algodClient.pendingTransactionInformation(txId).do();
          console.log('>>>>>>>>> txnResponse => ', txnResponse);
          formik.setTouched(false);
          formik.setValues({
            recipient: '',
            amount: 1,
            note: ''
          });
          closeLoading();
          closeDialog();
          openAlert({
            severity: SUCCESS,
            message: `Transaction ${txId} confirmed in round ${txnResponse['confirmed-round']}. The asset id is ${txnResponse['asset-index']}`
          });
          setDesireReload(true);
        } catch (error) {
          console.log('>>>>>>>>> error => ', error.message);
          openAlert({
            severity: ERROR,
            message: error.message
          });
          closeLoading();
        }
      }
    }
  });

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          {dialogTitle}
        </DialogTitle>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogTitle component={Typography} variant="h5" textAlign="center" sx={{ pb: 0 }}>
        {asset['params']['name']}
      </DialogTitle>
      <Typography textAlign="center" sx={{ pt: 0 }}>
        Balance: {balanceToView} {asset['params']['unit-name']}
      </Typography>

      <DialogContent>
        <Stack spacing={2}>
          <TextField
            name="recipient"
            label="To address *"
            value={formik.values.recipient}
            onChange={formik.handleChange}
            error={formik.touched.recipient && Boolean(formik.errors.recipient)}
            helperText={formik.touched.recipient && formik.errors.recipient}
            multiline
            fullWidth
          />
          <TextField
            type="number"
            name="amount"
            label="Amount *"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            InputProps={{
              endAdornment: <Button variant="outlined" onClick={() => setAmountAsMax()}>
                Max
              </Button>
            }}
            fullWidth
          />
          <TextField
            name="note"
            label="Note"
            value={formik.values.note}
            onChange={formik.handleChange}
            error={formik.touched.note && Boolean(formik.errors.note)}
            helperText={formik.touched.note && formik.errors.note}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}