import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import algosdk from 'algosdk';
import DialogOptInAsset from './DialogOptInAsset';
import NoData from '../../../../components/NoData';
import useLoading from '../../../../hooks/useLoading';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, INDEXER_SERVER_MAINNET, INDEXER_SERVER_TESTNET, MSG_ERROR_OCCURED } from '../../../../utils/constants';
import useAlertMessage from '../../../../hooks/useAlertMessage';
import CardOptedInAsset from './CardOptedInAsset';
import DialogBurnAsset from '../../../../components/DialogBurnAsset';
import DialogSendAssets from '../../../../components/DialogSendAssets';
import DialogOptOutAsset from './DialogOptOutAsset';

export default function TabOptedAssets() {
  const { openLoading, closeLoading } = useLoading();
  const { network, currentUser, setBalanceAct } = useConnectWallet();
  const { openAlert } = useAlertMessage();

  const [hideZeroBalance, setHideZeroBalance] = useState(false);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [assets, setAssets] = useState([]);
  const [visibleAssets, setVisibleAssets] = useState([]);
  const [desireReload, setDesireReload] = useState(false);
  const [algoIndexerClient, setAlgoIndexerClient] = useState(null);
  const [dialogSendAssetsOpened, setDialogSendAssetsOpened] = useState(false);
  const [dialogOptOutOpened, setDialogOptOutOpened] = useState(false);
  const [dialogBurnOpened, setDialogBurnOpened] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    getAllAssets();
    getAlgoIndexerClient();
  }, [network]);

  useEffect(() => {

  }, [network]);

  useEffect(() => {
    if (desireReload) {
      getAllAssets();
      setDesireReload(false);
    }
  }, [desireReload]);

  const getAlgoIndexerClient = async () => {
    let indexerServer = '';
    if (network === 'MainNet') {
      indexerServer = INDEXER_SERVER_MAINNET;
    } else {
      indexerServer = INDEXER_SERVER_TESTNET;
    }
    const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, indexerServer, ALGOD_PORT);
    setAlgoIndexerClient(indexerClient);
  };

  const openDialog = () => {
    setDialogOpened(true);
  };

  const getAllAssets = async () => {
    try {
      openLoading();
      let algodServer = '';
      if (network === 'MainNet') {
        algodServer = ALGOD_SERVER_MAINNET;
      } else {
        algodServer = ALGOD_SERVER_TESTNET;
      }
      const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);

      const accountInfo = await algodClient.accountInformation(currentUser).do();
      const assetDetails = await getAssetDetailsFromInfos(accountInfo['assets']);

      setBalanceAct(accountInfo.amount);
      setAssets(assetDetails);
      setVisibleAssets(assetDetails);
      closeLoading();
    } catch (error) {
      console.log('>>>>>>> error of getAllAssets => ', error);
      openAlert({
        severity: ERROR,
        message: MSG_ERROR_OCCURED
      });
      closeLoading();
    }
  };

  const getAssetDetailsFromInfos = async (assetInfos) => {
    let indexerServer = '';
    if (network === 'MainNet') {
      indexerServer = INDEXER_SERVER_MAINNET;
    } else {
      indexerServer = INDEXER_SERVER_TESTNET;
    }
    const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, indexerServer, ALGOD_PORT);
    const _assets = [];

    for (let i = 0; i < assetInfos.length; i += 1) {
      let searchedResult = await indexerClient.searchForAssets().index(assetInfos[i]['asset-id']).do();
      _assets.push(searchedResult.assets[0]);
    }
    return _assets;
  };

  const searchAssetsByName = (newKeyword) => {
    setSearchKeyword(newKeyword);
    if (newKeyword) {
      const regExpOfKeyword = new RegExp(newKeyword);
      const searchedAssets = assets.filter(assetItem => {
        if (assetItem['params']['name'].match(regExpOfKeyword)) {
          return true;
        }
        return false;
      });
      setVisibleAssets(searchedAssets);
    } else {
      setVisibleAssets(assets);
    }
  };

  const handleCheck = () => {
    setHideZeroBalance(!hideZeroBalance);
    if (!hideZeroBalance) {
      const searchedAssets = assets.filter(assetItem => assetItem['params']['total'] !== 0);
      console.log('>>>>>>>> searchedAssets => ', searchedAssets);
      setVisibleAssets(searchedAssets);
    } else {
      setVisibleAssets(assets);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={2}>
          <TextField
            name="searchKeyword"
            label="Search asset"
            placeholder="Name"
            InputProps={{
              startAdornment: <MuiIcon component={Icon} icon="material-symbols:search-rounded" />
            }}
            value={searchKeyword}
            onChange={(e) => searchAssetsByName(e?.target?.value)}
          />
          <FormControlLabel
            control={<Checkbox checked={hideZeroBalance} onChange={() => handleCheck()} />}
            label="Hide 0 balance"
          />
        </Stack>

        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => openDialog()}
        >Opt-in asset</Button>
      </Stack>
      <Box mt={5}>
        {visibleAssets.length > 0 ? (
          <Grid container spacing={3}>
            {visibleAssets.map(assetItem => (
              <Grid item xs={12} md={4} key={assetItem['index']}>
                <CardOptedInAsset
                  setSelectedAsset={setSelectedAsset}
                  setDialogSendAssetsOpened={setDialogSendAssetsOpened}
                  setDialogOptOutOpened={setDialogOptOutOpened}
                  setDialogBurnOpened={setDialogBurnOpened}
                  asset={assetItem}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <NoData text="This account doesn't have any created assets" />
        )}
      </Box>
      <DialogOptInAsset
        algoIndexerClient={algoIndexerClient}
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
      />
      {selectedAsset && (
        <>
          <DialogSendAssets
            dialogTitle="Send Assets"
            dialogOpened={dialogSendAssetsOpened}
            setDialogOpened={setDialogSendAssetsOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
          <DialogOptOutAsset
            asset={selectedAsset}
            dialogOpened={dialogOptOutOpened}
            setDialogOpened={setDialogOptOutOpened}
            setDesireReload={setDesireReload}
          />
          <DialogBurnAsset
            dialogTitle="Burn asset"
            dialogOpened={dialogBurnOpened}
            setDialogOpened={setDialogBurnOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
        </>

      )}
    </Box>
  );
}