import React, { useMemo, useState } from 'react'
import { Box, Button, ButtonGroup, Dialog, DialogContent, Icon as MuiIcon, IconButton, Stack, TextField, Typography } from '@mui/material'
import { Icon } from '@iconify/react';

type TKeywordKind = 'name' | 'id'

interface IProps {
  dialogOpened: boolean;
  setDialogOpened: Function;
}

export default function DialogOptInAsset({ dialogOpened, setDialogOpened }: IProps) {
  const [keywordKind, setKeywordKind] = useState<TKeywordKind>('name')

  const placeholderOfSearchInput = useMemo(() => {
    if (keywordKind === 'name') {
      return 'Planet watch'
    } else {
      return '87234773'
    }
  }, [keywordKind])

  const closeDialog = () => {
    setDialogOpened(false)
  }

  const changeKeywordKind = (kind: TKeywordKind) => {
    setKeywordKind(kind)
  }

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="end" px={2} pt={2}>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogContent>
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
            endAdornment: <MuiIcon component={Icon} icon="material-symbols:search-rounded" color="primary" />
          }}
          sx={{ mt: 2 }}
          fullWidth
        />

        <Box minHeight={450}>
          <Stack minHeight="inherit" alignItems="center" justifyContent="center">
            <Typography>No results found</Typography>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog >
  )
}