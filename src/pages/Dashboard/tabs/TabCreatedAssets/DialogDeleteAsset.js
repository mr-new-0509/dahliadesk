/* global AlgoSigner */
import React from 'react';
import { Button, Dialog, DialogActions, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import useAlertMessage from '../../../../hooks/useAlertMessage';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import useLoading from '../../../../hooks/useLoading';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, SUCCESS } from '../../../../utils/constants';
import algosdk from 'algosdk';
import { Icon } from '@iconify/react';

export default function DialogDeleteAsset({ dialogOpened, setDialogOpened, asset, setDesireReload }) {
  const { currentUser, network, myAlgoWallet, walletName } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const deleteAsset = async () => {
    try {
      openLoading();

      let algodServer = '';
      if (network === 'MainNet') {
        algodServer = ALGOD_SERVER_MAINNET;
      } else {
        algodServer = ALGOD_SERVER_TESTNET;
      }

      const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);
      const params = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetDestroyTxnWithSuggestedParams(
        currentUser,
        undefined,
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
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          Delete Asset
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

      <DialogActions>
        <Button variant="contained" onClick={() => deleteAsset()}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}