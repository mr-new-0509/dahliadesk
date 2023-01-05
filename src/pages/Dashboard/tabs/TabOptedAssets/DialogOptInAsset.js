/* global AlgoSigner */

import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, ButtonGroup, Dialog, DialogContent, DialogTitle, Icon as MuiIcon, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Menu, MenuItem, MenuList, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import algosdk from 'algosdk';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import { ALGOD_PORT, ALGOD_TOKEN, INDEXER_SERVER_MAINNET, INDEXER_SERVER_TESTNET } from '../../../../utils/constants';
import useLoading from '../../../../hooks/useLoading';

export default function DialogOptInAsset({ dialogOpened, setDialogOpened }) {
  const { network, currentUser } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();

  const [keywordKind, setKeywordKind] = useState('name');
  const [keyword, setKeyword] = useState('');
  const [assets, setAssets] = useState([]);
  const [algoIndexerClient, setAlgoIndexerClient] = useState(null);

  useEffect(() => {
    let indexerServer = '';
    if (network === 'MainNet') {
      indexerServer = INDEXER_SERVER_MAINNET;
    } else {
      indexerServer = INDEXER_SERVER_TESTNET;
    }
    const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, indexerServer, ALGOD_PORT);
    setAlgoIndexerClient(indexerClient);
  }, [network]);

  const placeholderOfSearchInput = useMemo(() => {
    if (keywordKind === 'name') {
      return 'Planet watch';
    } else {
      return '87234773';
    }
  }, [keywordKind]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const changeKeywordKind = (kind) => {
    setKeywordKind(kind);
    setKeyword('');
    setAssets([]);
  };

  const changeKeyword = async (newKeyword) => {
    setKeyword(newKeyword);
  };

  const searchAssets = async () => {
    if (keyword) {
      openLoading();
      let searchResult = null;
      if (keywordKind === 'name') {
        searchResult = await algoIndexerClient.searchForAssets().name(keyword).do();
      } else {
        searchResult = await algoIndexerClient.searchForAssets().index(keyword).do();
      }
      setAssets(searchResult.assets);
      closeLoading();
    } else {
      setAssets([]);
    }
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="end" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogTitle>
        <ButtonGroup fullWidth>
          <Button
            variant={keywordKind === 'name' ? 'contained' : 'outlined'}
            onClick={() => changeKeywordKind('name')}
          >Asset Name</Button>
          <Button
            variant={keywordKind === 'name' ? 'outlined' : 'contained'}
            onClick={() => changeKeywordKind('id')}
          >Asset Id</Button>
        </ButtonGroup>

        <TextField
          name="search"
          placeholder={placeholderOfSearchInput}
          InputProps={{
            endAdornment: <IconButton onClick={() => searchAssets()} color="primary">
              <Icon icon="material-symbols:search-rounded" />
            </IconButton>
          }}
          sx={{ mt: 2 }}
          value={keyword}
          onChange={(e) => changeKeyword(e.target.value)}
          fullWidth
        />
      </DialogTitle>

      <DialogContent>
        {assets.length === 0 ? (
          <Box minHeight={450}>
            <Stack minHeight="inherit" alignItems="center" justifyContent="center">
              <Typography>No results found</Typography>
            </Stack>
          </Box>
        ) : (
          <MenuList>
            {assets.map(assetItem => (
              <MenuItem key={assetItem?.index}>
                <ListItemText>
                  {assetItem.params.name}
                </ListItemText>
                <ListItemIcon color="primary">
                  <Icon icon="material-symbols:add-circle-rounded" />
                </ListItemIcon>
              </MenuItem>
            ))}
          </MenuList>
        )}
      </DialogContent>
    </Dialog >
  );
}