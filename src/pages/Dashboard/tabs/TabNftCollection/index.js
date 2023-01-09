import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Icon as MuiIcon, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import algosdk from 'algosdk';
import DialogMintNft from './DialogMintNft';
import NoData from '../../../../components/NoData';
import useLoading from '../../../../hooks/useLoading';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, INDEXER_SERVER_MAINNET, INDEXER_SERVER_TESTNET, MSG_ERROR_OCCURED, BASE_URL_OF_IPFS } from '../../../../utils/constants';
import CardNft from './CardNft';
import useAlertMessage from '../../../../hooks/useAlertMessage';
import DialogSendAssets from '../../../../components/DialogSendAssets';
import DialogMetadata from './DialogMetadata';
import DialogBurnAsset from '../../../../components/DialogBurnAsset';
import DialogOptOutNft from './DialogOptOutNft';

export default function TabNftCollection() {
  const { openLoading, closeLoading } = useLoading();
  const { network, currentUser, setBalanceAct } = useConnectWallet();
  const { openAlert } = useAlertMessage();

  const [dialogOpened, setDialogOpened] = useState(false);
  const [desireReload, setDesireReload] = useState(false);
  const [dialogSendNftOpened, setDialogSendNftOpened] = useState(false);
  const [dialogOptOutOpened, setDialogOptOutOpened] = useState(false);
  const [dialogMetadataOpened, setDialogMetadataOpened] = useState(false);
  const [dialogBurnOpened, setDialogBurnOpened] = useState(false);
  const [selectedNft, setSelectedNft] = useState(null);
  const [metadataOfSelectedNft, setMetadataOfSelectedNft] = useState(null);
  const [assets, setAssets] = useState([]);
  const [visibleAssets, setVisibleAssets] = useState([]);
  const [algoIndexerClient, setAlgoIndexerClient] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    getAllAssets();
  }, [network]);

  useEffect(() => {
    if (desireReload) {
      getAllAssets();
      setDesireReload(false);
    }
  }, [desireReload]);

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
      console.log('>>>>>>>> accountInfo => ', accountInfo);
      const assetDetails = await getAssetDetailsFromInfos(accountInfo['assets']);

      setAssets(assetDetails);
      setVisibleAssets(assetDetails);
      setBalanceAct(accountInfo.amount);
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
      if (searchedResult['assets'][0]['params']['url']) {
        if (searchedResult['assets'][0]['params']['url'].slice(0, 20) === BASE_URL_OF_IPFS) {
          _assets.push(searchedResult['assets'][0]);
        } else if (searchedResult['assets'][0]['params']['url'].slice(0, 7) === 'ipfs://') {
          _assets.push(searchedResult['assets'][0]);
        }
      }
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

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <TextField
          name="searchKeyword"
          label="Search NFT"
          placeholder="Name"
          InputProps={{
            startAdornment: <MuiIcon component={Icon} icon="material-symbols:search-rounded" />
          }}
          value={searchKeyword}
          onChange={(e) => searchAssetsByName(e?.target?.value)}
        />

        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => openDialog()}
        >Mint NFT</Button>
      </Stack>
      <Box mt={5}>
        {visibleAssets.length > 0 ? (
          <Grid container spacing={2}>
            {visibleAssets.map(assetItem => (
              <CardNft
                key={assetItem['index']}
                asset={assetItem}
                setDialogSendNftOpened={setDialogSendNftOpened}
                setDialogOptOutOpened={setDialogOptOutOpened}
                setDialogMetadataOpened={setDialogMetadataOpened}
                setDialogBurnOpened={setDialogBurnOpened}
                setSelectedNft={setSelectedNft}
                setMetadataOfSelectedNft={setMetadataOfSelectedNft}
              />
            ))}
          </Grid>
        ) : (
          <NoData text="This account doesn't have any created assets" />
        )}

      </Box>
      <DialogMintNft
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
        setDesireReload={setDesireReload}
      />
      {selectedNft && (
        <>
          <DialogSendAssets
            dialogTitle="Send NFT"
            dialogOpened={dialogSendNftOpened}
            setDialogOpened={setDialogSendNftOpened}
            asset={selectedNft}
            setDesireReload={setDesireReload}
          />
          <DialogOptOutNft
            asset={selectedNft}
            dialogOpened={dialogOptOutOpened}
            setDialogOpened={setDialogOptOutOpened}
            setDesireReload={setDesireReload}
          />
          <DialogMetadata
            dialogOpened={dialogMetadataOpened}
            setDialogOpened={setDialogMetadataOpened}
            asset={selectedNft}
            metadata={metadataOfSelectedNft}
          />
          <DialogBurnAsset
            dialogTitle="Burn NFT"
            dialogOpened={dialogBurnOpened}
            setDialogOpened={setDialogBurnOpened}
            asset={selectedNft}
            setDesireReload={setDesireReload}
          />
        </>
      )}
    </Box>
  );
}