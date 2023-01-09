import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { BASE_URL_OF_MAINNET_EXPLORER, BASE_URL_OF_TESTNET_EXPLORER, BASE_URL_OF_MAINNET_SWAP, BASE_URL_OF_TESTNET_SWAP } from '../../../../utils/constants';
import { Icon } from '@iconify/react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

interface IProps {
  asset: any;
  setSelectedAsset: Function;
  setDialogSendAssetsOpened: Function;
  setDialogOptOutOpened: Function;
  setDialogBurnOpened: Function;
}

export default function CardOptedInAsset({
  asset,
  setSelectedAsset,
  setDialogSendAssetsOpened,
  setDialogOptOutOpened,
  setDialogBurnOpened
}: IProps) {
  const { network, currentUser } = useConnectWallet()

  const baseUrlOfExplorer = useMemo(() => {
    if (network === 'MainNet') {
      return BASE_URL_OF_MAINNET_EXPLORER
    } else {
      return BASE_URL_OF_TESTNET_EXPLORER
    }
  }, [network])

  const baseUrlOfSwap = useMemo(() => {
    if (network === 'MainNet') {
      return BASE_URL_OF_MAINNET_SWAP
    } else {
      return BASE_URL_OF_TESTNET_SWAP
    }
  }, [network])

  const balanceToView = useMemo(() => {
    if (asset) {
      return asset['params']['total'] / 10 ** asset['params']['decimals']
    } else {
      return 0
    }
  }, [asset])

  const role = useMemo(() => {
    if (asset) {
      const { params: { clawback, creator, freeze, manager, reserve } } = asset;
      const roles = [];
      if (creator === currentUser) {
        roles.push('Creator')
      }
      if (manager === currentUser) {
        roles.push('Manager')
      }
      if (freeze === currentUser) {
        roles.push('Freeze')
      }
      if (reserve === currentUser) {
        roles.push('Reserve')
      }
      if (clawback === currentUser) {
        roles.push('Clawback')
      }
      if (roles.length > 0) {
        return roles.join(', ')
      }
    }
    return '- None -'
  }, [asset])

  const openDialogSendAssets = (popupState: any) => {
    setSelectedAsset(asset)
    setDialogSendAssetsOpened(true)
    popupState.close()
  }

  const openDialogOptOut = (popupState: any) => {
    setSelectedAsset(asset)
    setDialogOptOutOpened(true)
    popupState.close()
  }

  const openDialogBurn = (popupState: any) => {
    setSelectedAsset(asset)
    setDialogBurnOpened(true)
    popupState.close()
  }

  return (
    <Card>
      {asset && (
        <>
          <CardHeader
            title={asset['params']['name']}
            action={
              <Stack direction="row" alignItems="center">
                <IconButton
                  color="primary"
                  component={Link}
                  target="_blank"
                  href={`${baseUrlOfExplorer}/asset/${asset['index']}`}
                >
                  <Icon icon="ph:arrow-square-out-bold" />
                </IconButton>
                <PopupState variant="popover" popupId={`popup-${asset['index']}`}>
                  {popupState => (
                    <>
                      <IconButton color="primary" {...bindTrigger(popupState)}>
                        <Icon icon="material-symbols:more-vert" />
                      </IconButton>
                      <Menu {...bindMenu(popupState)}>
                        <MenuItem onClick={() => openDialogSendAssets(popupState)}>
                          <ListItemIcon><Icon icon="ic:outline-send" /></ListItemIcon>
                          <ListItemText>Send assets</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => openDialogOptOut(popupState)}>
                          <ListItemIcon><Icon icon="ic:round-remove-circle-outline" /></ListItemIcon>
                          <ListItemText>Opt-out</ListItemText>
                        </MenuItem>
                        <MenuItem
                          component={Link}
                          href={`${baseUrlOfSwap}${asset['index']}`}
                          target="_blank"
                        >
                          <ListItemIcon><Icon icon="ic:outline-swap-horizontal-circle" /></ListItemIcon>
                          <ListItemText>Swap (Tinyman)</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={() => openDialogBurn(popupState)}>
                          <ListItemIcon><Icon icon="cil:burn" /></ListItemIcon>
                          <ListItemText>Burn supply</ListItemText>
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </PopupState>
              </Stack>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography component="span">
                  Asset ID
                </Typography>
                <Typography component="span">
                  {asset['index']}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography component="span">
                  Balance
                </Typography>
                <Typography component="span">
                  {balanceToView} {asset['params']['unit-name']}
                </Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography component="span">
                  My role
                </Typography>
                <Typography component="span">
                  {role}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </>
      )}
    </Card>
  )
}