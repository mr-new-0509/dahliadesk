import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, Button, Grid } from '@mui/material'
import { Icon } from '@iconify/react'
import DialogMintNft from './DialogMintNft'
import NoData from '../../../../components/NoData'
import useLoading from '../../../../hooks/useLoading'
import useConnectWallet from '../../../../hooks/useConnectWallet'
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, BASE_URL_OF_IPFS, ERROR, MSG_ERROR_OCCURED } from '../../../../utils/constants'
import algosdk from 'algosdk'
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
  const [nfts, setNfts] = useState<Array<any>>([])
  const [dialogSendNftOpened, setDialogSendNftOpened] = useState<boolean>(false)
  const [dialogOptOutOpened, setDialogOptOutOpened] = useState<boolean>(false)
  const [dialogMetadataOpened, setDialogMetadataOpened] = useState<boolean>(false)
  const [dialogBurnOpened, setDialogBurnOpened] = useState<boolean>(false)
  const [selectedNft, setSelectedNft] = useState(null)
  const [metadataOfSelectedNft, setMetadataOfSelectedNft] = useState(null)

  useEffect(() => {
    getNfts()
  }, [network])

  useEffect(() => {
    if (desireReload) {
      getNfts()
      setDesireReload(false)
    }
  }, [desireReload])

  const openDialog = () => {
    setDialogOpened(true)
  }

  const getNfts = async () => {
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

      const _nfts = accountInfo['created-assets'].filter(
        (assetItem: any) => {
          if (assetItem['params']['url']) {
            if (assetItem['params']['url'].slice(0, 20) === BASE_URL_OF_IPFS) {
              return true;
            }
            if (assetItem['params']['url'].slice(0, 7) === 'ipfs://') {
              return true;
            }
          }
        }
      )
      console.log('>>>>>>>>> nfts => ', _nfts)
      setNfts(_nfts)
      closeLoading()
    } catch (error) {
      console.log('>>>>>>> error of getNfts => ', error)
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
        {nfts.length > 0 ? (
          <Grid container spacing={2}>
            {nfts.map(nftItem => (
              <Grid item xs={12} md={3} key={nftItem['index']}>
                <CardNft
                  nft={nftItem}
                  key={nftItem['index']}
                  setDialogSendNftOpened={setDialogSendNftOpened}
                  setDialogOptOutOpened={setDialogOptOutOpened}
                  setDialogMetadataOpened={setDialogMetadataOpened}
                  setDialogBurnOpened={setDialogBurnOpened}
                  setSelectedNft={setSelectedNft}
                  setMetadataOfSelectedNft={setMetadataOfSelectedNft}
                />
              </Grid>
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
            dialotTitle="Burn NFT"
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