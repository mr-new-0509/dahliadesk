import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button, Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import algosdk from 'algosdk'
import DialogOptInAsset from './DialogOptInAsset'
import NoData from '../../../../components/NoData'
import useLoading from '../../../../hooks/useLoading'
import useConnectWallet from '../../../../hooks/useConnectWallet'
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, INDEXER_SERVER_MAINNET, INDEXER_SERVER_TESTNET, MSG_ERROR_OCCURED } from '../../../../utils/constants'
import useAlertMessage from '../../../../hooks/useAlertMessage'
import CardOptedInAsset from './CardOptedInAsset'
import DialogBurnAsset from '../../../../components/DialogBurnAsset'

export default function TabOptedAssets() {
  const { openLoading, closeLoading } = useLoading()
  const { network, currentUser, setBalanceAct } = useConnectWallet()
  const { openAlert } = useAlertMessage()

  const [hideZeroBalance, setHideZeroBalance] = useState<boolean>(false)
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)
  const [optedInAssets, setOptedInAssets] = useState<Array<any>>([])
  const [desireReload, setDesireReload] = useState<boolean>(false)
  const [algoIndexerClient, setAlgoIndexerClient] = useState<any>(null)
  const [dialogSendAssetsOpened, setDialogSendAssetsOpened] = useState<boolean>(false)
  const [dialogOptOutOpened, setDialogOptOutOpened] = useState<boolean>(false)
  const [dialogBurnOpened, setDialogBurnOpened] = useState<boolean>(false)
  const [selectedAsset, setSelectedAsset] = useState<any>(null)

  useEffect(() => {
    getOptedInAssets()
    getAlgoIndexerClient()
  }, [network])

  useEffect(() => {

  }, [network]);

  useEffect(() => {
    if (desireReload) {
      getOptedInAssets()
      setDesireReload(false)
    }
  }, [desireReload])

  const getAlgoIndexerClient = async () => {
    let indexerServer = '';
    if (network === 'MainNet') {
      indexerServer = INDEXER_SERVER_MAINNET;
    } else {
      indexerServer = INDEXER_SERVER_TESTNET;
    }
    const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, indexerServer, ALGOD_PORT);
    setAlgoIndexerClient(indexerClient);
  }

  const handleCheck = () => {
    setHideZeroBalance(!hideZeroBalance)
  }

  const openDialog = () => {
    setDialogOpened(true)
  }

  const getOptedInAssets = async () => {
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
      setOptedInAssets(accountInfo['assets'])
      closeLoading()
    } catch (error) {
      console.log('>>>>>>> error of getOptedInAssets => ', error)
      openAlert({
        severity: ERROR,
        message: MSG_ERROR_OCCURED
      })
      closeLoading()
    }
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
        >Opt-in asset</Button>
      </Stack>
      <Box mt={5}>
        {optedInAssets.length > 0 ? (
          <Grid container spacing={3}>
            {optedInAssets.map(assetItem => (
              <Grid item xs={12} md={4} key={assetItem['asset-id']}>
                <CardOptedInAsset
                  setSelectedAsset={setSelectedAsset}
                  setDialogSendAssetsOpened={setDialogSendAssetsOpened}
                  setDialogOptOutOpened={setDialogOptOutOpened}
                  setDialogBurnOpened={setDialogBurnOpened}
                  algoIndexerClient={algoIndexerClient}
                  assetInfo={assetItem}
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
        <DialogBurnAsset
          dialogTitle="Burn asset"
          dialogOpened={dialogBurnOpened}
          setDialogOpened={setDialogBurnOpened}
          asset={selectedAsset}
          setDesireReload={setDesireReload}
        />
      )}
    </Box>
  )
}