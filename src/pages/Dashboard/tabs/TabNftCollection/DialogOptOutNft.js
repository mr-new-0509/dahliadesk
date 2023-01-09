/* global AlgoSigner */
import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { useFormik } from "formik";
import algosdk from 'algosdk';
import WAValidator from 'multicoin-address-validator';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, MSG_INVAILD_ADDRESS, MSG_REQUIRED, SUCCESS } from '../../../../utils/constants';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import useLoading from '../../../../hooks/useLoading';
import useAlertMessage from '../../../../hooks/useAlertMessage';

const validSchema = yup.object().shape({
  closeRemainder: yup.string().required(MSG_REQUIRED),
});

export default function DialogOptOutNft({ asset, dialogOpened, setDialogOpened, setDesireReload }) {
  const { network, currentUser, walletName, myAlgoWallet, peraWallet } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const balanceToView = useMemo(() => {
    return asset['params']['total'] / 10 ** asset['params']['decimals'];
  }, [asset]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const formik = useFormik({
    initialValues: {
      closeRemainder: '',
      note: ''
    },
    validationSchema: validSchema,
    onSubmit: async (values) => {
      console.log('>>>>>> values => ', values);
      const { closeRemainder, note } = values;
      const isValidCloseRemainder = WAValidator.validate(closeRemainder, 'algo');

      console.log('>>>>>>>>> isValidCloseRemainder => ', isValidCloseRemainder);

      //  Validate whether the close remainder has a valid address
      if (!isValidCloseRemainder) {
        formik.setFieldError('closeRemainder', MSG_INVAILD_ADDRESS);
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

          console.log(">>>>>> asset['index'] => ", asset['index']);

          const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: currentUser,
            to: currentUser,
            closeRemainderTo: closeRemainder,
            assetIndex: asset['index'],
            note: encodedNote,
            amount: 0,
            suggestedParams: params,
          });
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
            await algodClient.sendRawTransaction(signedTxn).do();
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
          Opt out NFT
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
            name="closeRemainder"
            label="Close remainder address *"
            value={formik.values.closeRemainder}
            onChange={formik.handleChange}
            error={formik.touched.closeRemainder && Boolean(formik.errors.closeRemainder)}
            helperText={formik.touched.closeRemainder && formik.errors.closeRemainder}
            multiline
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