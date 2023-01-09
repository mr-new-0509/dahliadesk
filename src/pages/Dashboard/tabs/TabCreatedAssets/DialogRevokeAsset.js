/* global AlgoSigner */
import React from 'react';
import { Dialog, DialogContent, DialogTitle, Icon, IconButton, Stack, TextField, Typography, DialogActions, Button } from '@mui/material';
import { useFormik } from "formik";
import WAValidator from 'multicoin-address-validator';
import algosdk from 'algosdk';
import * as yup from 'yup';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, MSG_INVAILD_ADDRESS, MSG_REQUIRED, SUCCESS } from '../../../../utils/constants';
import useLoading from '../../../../hooks/useLoading';
import useAlertMessage from '../../../../hooks/useAlertMessage';

const validSchema = yup.object().shape({
  revocationTarget: yup.string().required(MSG_REQUIRED),
  recipient: yup.string().required(MSG_REQUIRED),
  amount: yup.number().min(1, 'Minimum value is 1.').required(MSG_REQUIRED),
});

export default function DialogRevokeAsset({ dialogOpened, setDialogOpened, asset, setDesireReload }) {
  const { currentUser, network, myAlgoWallet, walletName, peraWallet } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const formik = useFormik({
    initialValues: {
      revocationTarget: '',
      recipient: '',
      amount: 1,
      note: ''
    },
    validationSchema: validSchema,
    onSubmit: async (values) => {
      const { revocationTarget, recipient, amount, note } = values;

      const isValidRevocationTarget = WAValidator.validate(revocationTarget, 'algo');
      const isValidRecipient = WAValidator.validate(recipient, 'algo');

      if (!isValidRevocationTarget) {
        formik.setFieldError('revocationTarget', MSG_INVAILD_ADDRESS);
        return;
      }

      if (!isValidRecipient) {
        formik.setFieldError('recipient', MSG_INVAILD_ADDRESS);
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

        const txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
          currentUser,
          recipient,
          undefined,
          revocationTarget,
          amount * 10 ** asset['params']['decimals'],
          encodedNote,
          asset['index'],
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
          await algodClient.sendRawTransaction(signedTxn).do();
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
        console.log('>>>>>>>>> error of DialogRevokeAsset => ', error.message);
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
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          Revoke Assets
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
        <Stack spacing={2}>
          <TextField
            name="revocationTarget"
            label="Target address *"
            value={formik.values.revocationTarget}
            onChange={formik.handleChange}
            error={formik.touched.revocationTarget && Boolean(formik.errors.revocationTarget)}
            helperText={formik.touched.revocationTarget && formik.errors.revocationTarget}
            multiline
            fullWidth
          />

          <TextField
            name="recipient"
            label="Receiver address *"
            value={formik.values.recipient}
            onChange={formik.handleChange}
            error={formik.touched.recipient && Boolean(formik.errors.recipient)}
            helperText={formik.touched.recipient && formik.errors.recipient}
            multiline
            fullWidth
          />

          <TextField
            type="number"
            label="Amount *"
            name="amount"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
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
        <Button variant="contained" onClick={() => formik.handleSubmit()}>Revoke</Button>
      </DialogActions>
    </Dialog>
  );
}