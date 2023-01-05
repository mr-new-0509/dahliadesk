import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button, Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import algosdk from 'algosdk'
import DialogCreateAsset from './DialogCreateAsset'
import NoData from '../../../../components/NoData'
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_TOKEN, ALGOD_SERVER_TESTNET, ERROR, MSG_ERROR_OCCURED } from '../../../../utils/constants'
import useConnectWallet from '../../../../hooks/useConnectWallet'
import CardAsset from './CardAsset'
import useLoading from '../../../../hooks/useLoading'
import DialogSendAssets from '../../../../components/DialogSendAssets'
import DialogModifyAsset from './DialogModifyAsset'
import DialogFreezeAsset from './DialogFreezeAsset'
import DialogRevokeAsset from './DialogRevokeAsset'
import DialogDeleteAsset from './DialogDeleteAsset'
import DialogBurnAsset from '../../../../components/DialogBurnAsset'
import useAlertMessage from '../../../../hooks/useAlertMessage'

export default function TabCreatedAssets() {
  const { network, currentUser, setBalanceAct } = useConnectWallet()
  const { openLoading, closeLoading } = useLoading()
  const { openAlert } = useAlertMessage()

  const [hideZeroBalance, setHideZeroBalance] = useState<boolean>(false)
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)
  const [createdAssets, setCreatedAssets] = useState<Array<any>>([])
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [dialogSendAssetsOpened, setDialogSendAssetsOpened] = useState<boolean>(false)
  const [dialogModifyAssetOpened, setDialogModifyAssetOpened] = useState<boolean>(false)
  const [dialogFreezeOpened, setDialogFreezeOpened] = useState<boolean>(false)
  const [dialogRevokeAssetsOpened, setDialogRevokeAssetsOpened] = useState<boolean>(false)
  const [dialogDeleteAssetOpened, setDialogDeleteAssetOpened] = useState<boolean>(false)
  const [dialogDeployOpened, setDialogDeployOpened] = useState<boolean>(false)
  const [dialogBurnAssetOpened, setDialogBurnAssetOpened] = useState<boolean>(false)
  const [desireReload, setDesireReload] = useState<boolean>(false)

  useEffect(() => {
    getAssets()
  }, [network])

  useEffect(() => {
    if (desireReload) {
      getAssets()
      setDesireReload(false)
    }
  }, [desireReload])

  const getAssets = async () => {
    try {
      openLoading()
      let algodServer = ''
      if (network === 'MainNet') {
        algodServer = ALGOD_SERVER_MAINNET;
      } else {
        algodServer = ALGOD_SERVER_TESTNET;
      }
      const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);

      const accountInfo = await algodClient.accountInformation(currentUser).do();
      console.log('>>>>>>>> accountInfo => ', accountInfo)
      setBalanceAct(accountInfo.amount)
      setCreatedAssets(accountInfo['created-assets'])
      closeLoading()
    } catch (error) {
      console.log('>>>>>>> error of getAssets => ', error)
      openAlert({
        severity: ERROR,
        message: MSG_ERROR_OCCURED
      })
      closeLoading()
    }
  }

  const handleCheck = () => {
    setHideZeroBalance(!hideZeroBalance)
  }

  const openDialog = () => {
    setDialogOpened(true)
  }

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
          createdAssets.length > 0 ? (
            <Grid container spacing={4}>
              {
                createdAssets.map(assetItem => (
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
  )
}