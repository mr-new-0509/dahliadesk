import React, { useEffect, useState } from 'react'
import { Box, Stack, TextField, Icon as MuiIcon, FormControlLabel, Checkbox, Button } from '@mui/material'
import { Icon } from '@iconify/react'
import algosdk from 'algosdk'
import DialogCreateAsset from './DialogCreateAsset'
import NoData from '../../../../components/NoData'
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_TOKEN, ALGOD_SERVER_TESTNET } from '../../../../utils/constants'
import useConnectWallet from '../../../../hooks/useConnectWallet'

export default function TabCreatedAssets() {
  const { network, currentUser, setBalanceAct } = useConnectWallet()

  const [hideZeroBalance, setHideZeroBalance] = useState<boolean>(false)
  const [dialogOpened, setDialogOpened] = useState<boolean>(false)
  const [createdAssets, setCreatedAssets] = useState([])

  useEffect(() => {
    let algodServer = ''
    if (network === 'MainNet') {
      algodServer = ALGOD_SERVER_MAINNET;
    } else {
      algodServer = ALGOD_SERVER_TESTNET;
    }
    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);

    (async () => {
      const accountInfo = await algodClient.accountInformation(currentUser).do();
      setBalanceAct(accountInfo.amount)
      setCreatedAssets(accountInfo['created-assets'])
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
      <Box>
        <NoData text="This account doesn't have any created assets" />
      </Box>
      <DialogCreateAsset
        dialogOpened={dialogOpened}
        setDialogOpened={setDialogOpened}
      />
    </Box>
  )
}