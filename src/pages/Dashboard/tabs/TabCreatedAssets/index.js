import React, { useEffect, useState } from 'react';
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import algosdk from 'algosdk';
import DialogCreateAsset from './DialogCreateAsset';
import NoData from '../../../../components/NoData';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_TOKEN, ALGOD_SERVER_TESTNET, ERROR, MSG_ERROR_OCCURED } from '../../../../utils/constants';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import CardAsset from './CardAsset';
import useLoading from '../../../../hooks/useLoading';
import DialogSendAssets from '../../../../components/DialogSendAssets';
import DialogModifyAsset from './DialogModifyAsset';
import DialogFreezeAsset from './DialogFreezeAsset';
import DialogRevokeAsset from './DialogRevokeAsset';
import DialogDeleteAsset from './DialogDeleteAsset';
import DialogBurnAsset from '../../../../components/DialogBurnAsset';
import useAlertMessage from '../../../../hooks/useAlertMessage';

export default function TabCreatedAssets() {
  const { network, currentUser, setBalanceAct } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const [hideZeroBalance, setHideZeroBalance] = useState(false);
  const [dialogOpened, setDialogOpened] = useState(false);
  const [assets, setAssets] = useState([]);
  const [visibleAssets, setVisibleAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [dialogSendAssetsOpened, setDialogSendAssetsOpened] = useState(false);
  const [dialogModifyAssetOpened, setDialogModifyAssetOpened] = useState(false);
  const [dialogFreezeOpened, setDialogFreezeOpened] = useState(false);
  const [dialogRevokeAssetsOpened, setDialogRevokeAssetsOpened] = useState(false);
  const [dialogDeleteAssetOpened, setDialogDeleteAssetOpened] = useState(false);
  const [dialogDeployOpened, setDialogDeployOpened] = useState(false);
  const [dialogBurnAssetOpened, setDialogBurnAssetOpened] = useState(false);
  const [desireReload, setDesireReload] = useState(false);
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
      setBalanceAct(accountInfo.amount);
      setAssets(accountInfo['created-assets']);
      setVisibleAssets(accountInfo['created-assets']);
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

  const openDialog = () => {
    setDialogOpened(true);
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
        >Create asset</Button>
      </Stack>
      <Box mt={5}>
        {
          visibleAssets.length > 0 ? (
            <Grid container spacing={4}>
              {
                visibleAssets.map(assetItem => (
                  <Grid item xs={12} md={6} key={assetItem['index']}>
                    <CardAsset
                      assetItem={assetItem}
                      setSelectedAsset={setSelectedAsset}
                      setDialogSendAssetsOpened={setDialogSendAssetsOpened}
                      setDialogModifyAssetOpened={setDialogModifyAssetOpened}
                      setDialogFreezeOpened={setDialogFreezeOpened}
                      setDialogRevokeAssetsOpened={setDialogRevokeAssetsOpened}
                      setDialogDeleteAssetOpened={setDialogDeleteAssetOpened}
                      setDialogDeployOpened={setDialogDeployOpened}
                      setDialogBurnAssetOpened={setDialogBurnAssetOpened}
                    />
                  </Grid>
                ))
              }

            </Grid>
          ) : (<NoData text="This account doesn't have any created assets" />)
        }

      </Box>
      <DialogCreateAsset
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
        setDesireReload={setDesireReload}
      />
      {selectedAsset && (
        <>
          <DialogSendAssets
            dialogTitle="Send assets"
            dialogOpened={dialogSendAssetsOpened}
            setDialogOpened={setDialogSendAssetsOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
          <DialogModifyAsset
            dialogOpened={dialogModifyAssetOpened}
            setDialogOpened={setDialogModifyAssetOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
          <DialogFreezeAsset
            dialogOpened={dialogFreezeOpened}
            setDialogOpened={setDialogFreezeOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
          <DialogRevokeAsset
            dialogOpened={dialogRevokeAssetsOpened}
            setDialogOpened={setDialogRevokeAssetsOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
          <DialogDeleteAsset
            dialogOpened={dialogDeleteAssetOpened}
            setDialogOpened={setDialogDeleteAssetOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
          />
          <DialogBurnAsset
            dialogOpened={dialogBurnAssetOpened}
            setDialogOpened={setDialogBurnAssetOpened}
            asset={selectedAsset}
            setDesireReload={setDesireReload}
            dialogTitle="Burn assets"
          />
        </>
      )}
    </Box>
  );
}