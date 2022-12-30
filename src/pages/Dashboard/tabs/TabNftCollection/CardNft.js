import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardActions, CardContent, CardMedia, IconButton, Link, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import { BASE_URL_OF_IPFS, BASE_URL_OF_MAINNET_EXPLORER, BASE_URL_OF_TESTNET_EXPLORER, DEFAULT_NFT_IMAGE } from '../../../../utils/constants';
import { Icon } from '@iconify/react';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import PopupState, { bindMenu, bindTrigger } from 'material-ui-popup-state';

export default function CardNft({
  nft,
  setDialogSendNftOpened,
  setDialogOptOutOpened,
  setDialogMetadataOpened,
  setDialogBurnOpened,
  setSelectedNft
}) {
  const { network } = useConnectWallet();
  const [metadata, setMetadata] = useState(null);
  const [standard, setStandard] = useState('');

  useEffect(() => {
    (async () => {
      let metadataUrl = '';
      if (nft['params']['url'].slice(0, 7) === 'ipfs://') {
        metadataUrl = `${BASE_URL_OF_IPFS}/${nft['params']['url'].slice(7).split('#')[0]}`;
      } else {
        metadataUrl = nft['params']['url'];
      }
      const data = await (await fetch(metadataUrl)).json();
      setMetadata(data);
    })();
  }, [nft]);

  useEffect(() => {
    if (metadata) {
      if (metadata['standard'] === 'arc69') {
        setStandard('arc69');
      } else {
        setStandard('arc3');
      }
    }
  }, [metadata]);

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
    setSelectedNft(nft);
    setDialogSendNftOpened(true);
    popupState.close();
  };

  const openDialogOptOut = (popupState) => {
    setSelectedNft(nft);
    setDialogOptOutOpened(true);
    popupState.close();
  };

  const openDialogMetadata = (popupState) => {
    setSelectedNft(nft);
    setDialogMetadataOpened(true);
    popupState.close();
  };

  const openDialogBurn = (popupState) => {
    setSelectedNft(nft);
    setDialogBurnOpened(true);
    popupState.close();
  };

  return (
    <Card>
      <CardMedia
        component="img"
        src={imageUrlToVisible || DEFAULT_NFT_IMAGE}
        sx={{ height: 300, objectFit: 'cover' }}
      />
      <CardContent>
        <Typography component="h6" fontWeight={700}>ID: {nft['index']}</Typography>
        <Typography>Name: {nft['params']['name']}</Typography>
        <Typography>Balance: {nft['params']['total']} {nft['params']['unit-name']}</Typography>
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
        <IconButton color="primary" component={Link} target="_blank" href={`${baseUrlOfExplorer}/asset/${nft['index']}`}>
          <Icon icon="ph:arrow-square-out-fill" />
        </IconButton>
        <PopupState variant="popover" popupId={`popup-${nft['index']}`}>
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
                {/* <MenuItem onClick={() => openDialogOptOut(popupState)}>
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
                </MenuItem> */}
              </Menu>
            </>
          )}
        </PopupState>
      </CardActions>
    </Card>
  );
}