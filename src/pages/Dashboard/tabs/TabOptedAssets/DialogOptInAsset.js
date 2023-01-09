/* global AlgoSigner */

import React, { useMemo, useState } from 'react';
import { Box, Button, ButtonGroup, Dialog, DialogContent, DialogTitle, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import algosdk from 'algosdk';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, SUCCESS } from '../../../../utils/constants';
import useLoading from '../../../../hooks/useLoading';
import useAlertMessage from '../../../../hooks/useAlertMessage';

export default function DialogOptInAsset({ dialogOpened, setDialogOpened, algoIndexerClient }) {
  const { network, currentUser, walletName, myAlgoWallet, peraWallet } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const [keywordKind, setKeywordKind] = useState('name');
  const [keyword, setKeyword] = useState('');
  const [assets, setAssets] = useState([]);

  const placeholderOfSearchInput = useMemo(() => {
    if (keywordKind === 'name') {
      return 'Planet watch';
    } else {
      return '87234773';
    }
  }, [keywordKind]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const changeKeywordKind = (kind) => {
    setKeywordKind(kind);
    setKeyword('');
    setAssets([]);
  };

  const changeKeyword = async (newKeyword) => {
    setKeyword(newKeyword);
  };

  const searchAssets = async () => {
    if (keyword) {
      openLoading();
      let searchResult = null;
      if (keywordKind === 'name') {
        searchResult = await algoIndexerClient.searchForAssets().name(keyword).do();
      } else {
        searchResult = await algoIndexerClient.searchForAssets().index(keyword).do();
      }
      setAssets(searchResult.assets);
      closeLoading();
    } else {
      setAssets([]);
    }
  };

  const optInAsset = async (assetIndex) => {
    try {
      let algodServer = '';
      if (network === 'MainNet') {
        algodServer = ALGOD_SERVER_MAINNET;
      } else {
        algodServer = ALGOD_SERVER_TESTNET;
      }

      const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);
      const params = await algodClient.getTransactionParams().do();

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: currentUser,
        suggestedParams: params,
        to: currentUser,
        amount: 0,
        assetIndex
      });
      const txId = txn.txID().toString();
      console.log('>>>>>>>> txId => ', txId);

      if (walletName === 'MyAlgo') {
        const signedTxn = await myAlgoWallet.signTransaction(txn.toByte());

        await algodClient.sendRawTransaction(signedTxn.blob).do();
      } else if (walletName === 'AlgoSigner') {
        const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());
        const signedTxns = await AlgoSigner.signTxn([{ txn: txn_b64 }]);
        const binarySignedTxn = await AlgoSigner.encoding.base64ToMsgpack(signedTxns[0].blob);
        await algodClient.sendRawTransaction(binarySignedTxn).do();
      } else {
        /* ----------------- Need test -------------------- */
        const singleTxnGroups = [{ txn, signers: [currentUser] }];
        const signedTxn = await peraWallet.signTransaction([singleTxnGroups]);
        await algodClient.sendRawTransaction(signedTxn).do();
      }

      await algosdk.waitForConfirmation(algodClient, txId, 4);

      const txnResponse = await algodClient.pendingTransactionInformation(txId).do();
      console.log('>>>>>>>>> txnResponse => ', txnResponse);
      closeLoading();
      closeDialog();
      openAlert({
        severity: SUCCESS,
        message: `Transaction ${txId} confirmed in round ${txnResponse['confirmed-round']}. The asset id is ${txnResponse['asset-index']}`
      });
      closeLoading();
    } catch (error) {
      console.log('>>>>>>>>> error of DialogMintNft => ', error);
      openAlert({
        severity: ERROR,
        message: error.message
      });
      closeLoading();
    }
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="end" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogTitle>
        <ButtonGroup fullWidth>
          <Button
            variant={keywordKind === 'name' ? 'contained' : 'outlined'}
            onClick={() => changeKeywordKind('name')}
          >Asset Name</Button>
          <Button
            variant={keywordKind === 'name' ? 'outlined' : 'contained'}
            onClick={() => changeKeywordKind('id')}
          >Asset Id</Button>
        </ButtonGroup>

        <TextField
          name="search"
          placeholder={placeholderOfSearchInput}
          InputProps={{
            endAdornment: <IconButton onClick={() => searchAssets()} color="primary">
              <Icon icon="material-symbols:search-rounded" />
            </IconButton>
          }}
          sx={{ mt: 2 }}
          value={keyword}
          onChange={(e) => changeKeyword(e.target.value)}
          fullWidth
        />
      </DialogTitle>

      <DialogContent>
        {assets.length === 0 ? (
          <Box minHeight={450}>
            <Stack minHeight="inherit" alignItems="center" justifyContent="center">
              <Typography>No results found</Typography>
            </Stack>
          </Box>
        ) : (
          <MenuList>
            {assets.map(assetItem => (
              <MenuItem key={assetItem?.index} onClick={() => optInAsset(assetItem?.index)}>
                <ListItemText>
                  {assetItem.params.name}
                </ListItemText>
                <ListItemIcon color="primary">
                  <Icon icon="material-symbols:add-circle-rounded" />
                </ListItemIcon>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </DialogContent>
    </Dialog >
  );
}