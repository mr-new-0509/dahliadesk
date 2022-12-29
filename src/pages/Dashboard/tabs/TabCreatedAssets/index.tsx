import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button, Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import algosdk from 'algosdk'
import DialogCreateAsset from './DialogCreateAsset'
import NoData from '../../../../components/NoData'
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_TOKEN, ALGOD_SERVER_TESTNET } from '../../../../utils/constants'
import useConnectWallet from '../../../../hooks/useConnectWallet'
import CardAsset from './CardAsset'
import useLoading from '../../../../hooks/useLoading'
import DialogSendAssets from './DialogSendAssets'
import DialogModifyAsset from './DialogModifyAsset'
import DialogFreezeAsset from './DialogFreezeAsset'

export default function TabCreatedAssets() {
  const { network, currentUser, setBalanceAct } = useConnectWallet()
  const { openLoading, closeLoading } = useLoading()

  const [hideZeroBalance, setHideZeroBalance] = useState<boolean>(false)
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)
  const [createdAssets, setCreatedAssets] = useState<Array<any>>([])
  const [selectedAsset, setSelectedAsset] = useState(null)
  const [dialogSendAssetsOpened, setDialogSendAssetsOpened] = useState<boolean>(false)
  const [dialogModifyAssetOpened, setDialogModifyAssetOpened] = useState<boolean>(false)
  const [dialogFreezeOpened, setDialogFreezeOpened] = useState<boolean>(false)
  const [dialogRevokeAssetsOpened, setDialogRevokeAssetsOpened] = useState<boolean>(false)
  const [dialogDeleteAssetOpened, setDialogAssetOpened] = useState<boolean>(false)
  const [dialogDeployOpened, setDialogDeployOpened] = useState<boolean>(false)
  const [dialogBurnSupplyOpened, setDialogBurnSupplyOpened] = useState<boolean>(false)

  useEffect(() => {
    openLoading()
    let algodServer = ''
    if (network === 'MainNet') {
      algodServer = ALGOD_SERVER_MAINNET;
    } else {
      algodServer = ALGOD_SERVER_TESTNET;
    }
    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);

    (async () => {
      const accountInfo = await algodClient.accountInformation(currentUser).do();
      console.log('>>>>>>>> accountInfo => ', accountInfo)
      setBalanceAct(accountInfo.amount)
      setCreatedAssets(accountInfo['created-assets'])
      closeLoading()
    })()
  }, [network])

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
                      setDialogAssetOpened={setDialogAssetOpened}
                      setDialogDeployOpened={setDialogDeployOpened}
                      setDialogBurnSupplyOpened={setDialogBurnSupplyOpened}
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
      />
      {selectedAsset && (
        <>
          <DialogSendAssets
            dialogOpened={dialogSendAssetsOpened}
            setDialogOpened={setDialogSendAssetsOpened}
            asset={selectedAsset}
          />
          <DialogModifyAsset
            dialogOpened={dialogModifyAssetOpened}
            setDialogOpened={setDialogModifyAssetOpened}
            asset={selectedAsset}
          />
          <DialogFreezeAsset
            dialogOpened={dialogFreezeOpened}
            setDialogOpened={setDialogFreezeOpened}
            asset={selectedAsset}
          />
        </>
      )}

    </Box>
  )
}