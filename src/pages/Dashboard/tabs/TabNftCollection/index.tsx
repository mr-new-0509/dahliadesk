import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, Button, Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import algosdk from 'algosdk'
import DialogMintNft from './DialogMintNft'
import NoData from '../../../../components/NoData'
import useLoading from '../../../../hooks/useLoading'
import useConnectWallet from '../../../../hooks/useConnectWallet'
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ERROR, INDEXER_SERVER_MAINNET, INDEXER_SERVER_TESTNET, MSG_ERROR_OCCURED } from '../../../../utils/constants'
import CardNft from './CardNft'
import useAlertMessage from '../../../../hooks/useAlertMessage'
import DialogSendAssets from '../../../../components/DialogSendAssets'
import DialogMetadata from './DialogMetadata'
import DialogBurnAsset from '../../../../components/DialogBurnAsset'

export default function TabNftCollection() {
  const { openLoading, closeLoading } = useLoading()
  const { network, currentUser, setBalanceAct } = useConnectWallet()
  const { openAlert } = useAlertMessage()

  const [dialogOpened, setDialogOpened] = useState<boolean>(false)
  const [desireReload, setDesireReload] = useState<boolean>(false)
  const [dialogSendNftOpened, setDialogSendNftOpened] = useState<boolean>(false)
  const [dialogOptOutOpened, setDialogOptOutOpened] = useState<boolean>(false)
  const [dialogMetadataOpened, setDialogMetadataOpened] = useState<boolean>(false)
  const [dialogBurnOpened, setDialogBurnOpened] = useState<boolean>(false)
  const [selectedNft, setSelectedNft] = useState(null)
  const [metadataOfSelectedNft, setMetadataOfSelectedNft] = useState(null)
  const [assets, setAssets] = useState([])
  const [algoIndexerClient, setAlgoIndexerClient] = useState<any>(null)

  useEffect(() => {
    getAssets()
    getAlgoIndexerClient()
  }, [network])

  useEffect(() => {
    if (desireReload) {
      getAssets()
      setDesireReload(false)
    }
  }, [desireReload])

  const openDialog = () => {
    setDialogOpened(true)
  }

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
      setAssets(accountInfo['assets'])
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
        />

        <Button
          variant="contained"
          startIcon={<Icon icon="material-symbols:add" />}
          onClick={() => openDialog()}
        >Mint NFT</Button>
      </Stack>
      <Box mt={5}>
        {assets.length > 0 ? (
          <Grid container spacing={2}>
            {assets.map(assetItem => (
              <CardNft
                key={assetItem['asset-id']}
                assetInfo={assetItem}
                algoIndexerClient={algoIndexerClient}
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
  )
}