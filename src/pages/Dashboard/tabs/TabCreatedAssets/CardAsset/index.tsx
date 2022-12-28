import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, Grid, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography } from '@mui/material'
import { Icon } from '@iconify/react';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import PaperAccount from './PaperAccount';
import useConnectWallet from '../../../../../hooks/useConnectWallet';
import { BASE_URL_OF_MAINNET_EXPLORER, BASE_URL_OF_TESTNET_EXPLORER } from '../../../../../utils/constants';

interface IProps {
  assetItem: any;
}

export default function CardAsset({ assetItem }: IProps) {
  const { network } = useConnectWallet()

  const balanceToView = useMemo(() => {
    console.log('balanceToView')
    return assetItem['params']['total'] / 10 ** assetItem['params']['decimals']
  }, [assetItem])

  const baseUrlOfExplorer = useMemo(() => {
    if (network === 'MainNet') {
      return BASE_URL_OF_MAINNET_EXPLORER
    } else {
      return BASE_URL_OF_TESTNET_EXPLORER
    }
  }, [network])

  return (
    <Card>
      <CardHeader
        title={assetItem['params']['name']}
        action={
          <Stack direction="row" alignItems="center">
            <IconButton
              color="primary"
              component={Link}
              target="_blank"
              href={`${baseUrlOfExplorer}/asset/${assetItem['index']}`}
            >
              <Icon icon="ph:arrow-square-out-bold" />
            </IconButton>
            <PopupState variant="popover" popupId={`popup-${assetItem['index']}`}>
              {popupState => (
                <>
                  <IconButton color="primary" {...bindTrigger(popupState)}>
                    <Icon icon="material-symbols:more-vert" />
                  </IconButton>
                  <Menu {...bindMenu(popupState)}>
                    <MenuItem>
                      <ListItemIcon><Icon icon="ic:outline-send" /></ListItemIcon>
                      <ListItemText>Send assets</ListItemText>
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon><Icon icon="material-symbols:edit-outline-rounded" /></ListItemIcon>
                      <ListItemText>Modify asset</ListItemText>
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon><Icon icon="material-symbols:lock-outline" /></ListItemIcon>
                      <ListItemText>Freeze / Unfreeze</ListItemText>
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon><Icon icon="mdi:reload" /></ListItemIcon>
                      <ListItemText>Revoke assets</ListItemText>
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon><Icon icon="mdi:trash-outline" /></ListItemIcon>
                      <ListItemText>Delete asset</ListItemText>
                    </MenuItem>
                    <MenuItem>
                      <ListItemIcon><Icon icon="ic:outline-swap-horizontal-circle" /></ListItemIcon>
                      <ListItemText>Swap (Tinyman)</ListItemText>
                    </MenuItem>
                    <MenuItem>
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography component="h3" fontSize={18} fontWeight={700}>
              ID: {assetItem['index']}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography>
              Balance: {`${balanceToView} ${assetItem['params']['unit-name']}`}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <PaperAccount label="Manager" address={assetItem['params']['manager']} baseUrlOfExplorer={baseUrlOfExplorer} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaperAccount label="Reserve" address={assetItem['params']['reserve']} baseUrlOfExplorer={baseUrlOfExplorer} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaperAccount label="Freeze" address={assetItem['params']['freeze']} baseUrlOfExplorer={baseUrlOfExplorer} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PaperAccount label="Clawback" address={assetItem['params']['clawback']} baseUrlOfExplorer={baseUrlOfExplorer} />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}