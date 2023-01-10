import React, { useEffect, useMemo, useState } from 'react';
import { Box, Card, CardActions, CardContent, CardMedia, Grid, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';
import { BASE_URL_OF_IPFS, BASE_URL_OF_MAINNET_EXPLORER, BASE_URL_OF_MAINNET_INDEX_EXPLORER, BASE_URL_OF_TESTNET_INDEX_EXPLORER, BASE_URL_OF_TESTNET_EXPLORER, UNEXPECTED_TOKEN } from '../../../../utils/constants';
import { Icon } from '@iconify/react';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { Arc69 } from '../../../../utils/classes';

export default function CardNft({
  asset,
  setDialogSendNftOpened,
  setDialogOptOutOpened,
  setDialogMetadataOpened,
  setDialogBurnOpened,
  setSelectedNft,
  setMetadataOfSelectedNft
}) {
  const { network } = useConnectWallet();

  const [metadata, setMetadata] = useState(null);
  // const [standard, setStandard] = useState('');

  useEffect(() => {
    if (asset) {
      (async () => {
        try {
          let metadataUrl = '';
          if (asset['params']['url'].slice(0, 7) === 'ipfs://') {
            metadataUrl = `${BASE_URL_OF_IPFS}/${asset['params']['url'].slice(7).split('#')[0]}`;
          } else {
            metadataUrl = asset['params']['url'];
          }
          const data = await (await fetch(metadataUrl)).json();
          setMetadata(data);
        } catch (error) {
          console.log('>>>>>>> error of getting metadata => ', error.message);

          if (error.message.slice(0, 16) === UNEXPECTED_TOKEN) {
            let arc69 = null;
            if (network === 'MainNet') {
              arc69 = new Arc69(BASE_URL_OF_MAINNET_INDEX_EXPLORER);
            } else {
              arc69 = new Arc69(BASE_URL_OF_TESTNET_INDEX_EXPLORER);
            }
            const _metadata = await arc69.fetch(asset['index']);
            setMetadata({
              ..._metadata,
              media_url: `${BASE_URL_OF_IPFS}/${asset['params']['url'].slice(7)}`
            });
          }
        }
      })();
    }
  }, [asset]);

  // useEffect(() => {
  //   if (metadata) {
  //     if (metadata['standard'] === 'arc69') {
  //       setStandard('arc69');
  //     } else {
  //       setStandard('arc3');
  //     }
  //   }
  // }, [metadata]);

  const baseUrlOfExplorer = useMemo(() => {
    if (network === 'MainNet') {
      return BASE_URL_OF_MAINNET_EXPLORER;
    } else {
      return BASE_URL_OF_TESTNET_EXPLORER;
    }
  }, [network]);

  const imageUrlToVisible = useMemo(() => {
    if (metadata) {
      if (metadata['image']) {
        if (metadata['image'].slice(0, 7) === 'ipfs://') {
          return `${BASE_URL_OF_IPFS}/${metadata['image'].slice(7)}`;
        } else {
          return `${metadata['image']}`;
        }
      } else if (metadata['media_url']) {
        if (metadata['media_url'].slice(0, 7) === 'ipfs://') {
          return `${BASE_URL_OF_IPFS}/${metadata['media_url'].slice(7)}`;
        } else {
          return `${metadata['media_url']}`;
        }
      }
    } else {
      return '';
    }
  }, [metadata]);

  const openDialogSendNft = (popupState) => {
    setSelectedNft(asset);
    setDialogSendNftOpened(true);
    popupState.close();
  };

  const openDialogOptOut = (popupState) => {
    setSelectedNft(asset);
    setDialogOptOutOpened(true);
    popupState.close();
  };

  const openDialogMetadata = (popupState) => {
    setSelectedNft(asset);
    setMetadataOfSelectedNft(metadata);
    setDialogMetadataOpened(true);
    popupState.close();
  };

  const openDialogBurn = (popupState) => {
    setSelectedNft(asset);
    setDialogBurnOpened(true);
    popupState.close();
  };

  if (asset) {
    return (
      <Grid item xs={12} md={3}>
        <Card>
          {imageUrlToVisible ? (
            <CardMedia
              component="img"
              src={imageUrlToVisible}
              sx={{ height: 300, objectFit: 'cover' }}
            />
          ) : (
            <CardMedia
              component={Box}
              height={300}
            />
          )}

          <CardContent>
            <Typography component="h6" fontWeight={700}>ID: {asset['index']}</Typography>
            <Typography>Name: {asset['params']['name']}</Typography>
            <Typography>Balance: {asset['params']['total']} {asset['params']['unit-name']}</Typography>
          </CardContent>
          <CardActions>
            <IconButton
              color="primary"
              component={Link}
              target="_blank"
              href={imageUrlToVisible}
              disabled={!imageUrlToVisible}
            >
              <Icon icon="simple-icons:ipfs" />
            </IconButton>
            <IconButton color="primary" component={Link} target="_blank" href={`${baseUrlOfExplorer}/asset/${asset['index']}`}>
              <Icon icon="ph:arrow-square-out-fill" />
            </IconButton>
            <PopupState variant="popover" popupId={`popup-${asset['index']}`}>
              {popupState => (
                <>
                  <IconButton color="primary" {...bindTrigger(popupState)}>
                    <Icon icon="material-symbols:more-vert" />
                  </IconButton>
                  <Menu {...bindMenu(popupState)}>
                    <MenuItem onClick={() => openDialogSendNft(popupState)}>
                      <ListItemIcon><Icon icon="ic:outline-send" /></ListItemIcon>
                      <ListItemText>Send NFT</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => openDialogOptOut(popupState)}>
                      <ListItemIcon><Icon icon="mdi:minus-circle-outline" /></ListItemIcon>
                      <ListItemText>Opt-Out</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => openDialogMetadata(popupState)}>
                      <ListItemIcon><Icon icon="ic:baseline-remove-red-eye" /></ListItemIcon>
                      <ListItemText>View metadata</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => openDialogBurn(popupState)}>
                      <ListItemIcon><Icon icon="cil:burn" /></ListItemIcon>
                      <ListItemText>Burn supply</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
              )}
            </PopupState>
          </CardActions>
        </Card>
      </Grid>
    );
  } else {
    return <></>;
  }
}