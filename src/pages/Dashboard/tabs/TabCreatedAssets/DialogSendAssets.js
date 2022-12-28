import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Stack, TextField, Typography } from '@mui/material';
import * as yup from 'yup';
import { useFormik } from "formik";
import { MSG_REQUIRED } from '../../../../utils/constants';

export default function DialogSendAssets({ dialogOpened, setDialogOpened, asset }) {
  const [validSchema, setValidSchema] = useState(null);

  const balanceToView = useMemo(() => {
    return asset['params']['total'] / 10 ** asset['params']['decimals'];
  }, [asset]);

  useEffect(() => {
    const schema = yup.object().shape({
      recipient: yup.string().required(MSG_REQUIRED),
      amount: yup.number().min(0.001, 'Minimum amount is 0.001.').max(balanceToView, `Maximum amount is ${balanceToView}`).required(MSG_REQUIRED),
    });
    setValidSchema(schema);
  }, [balanceToView]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const setAmountAsMax = () => {
    formik.setFieldValue('amount', balanceToView);
  };

  const formik = useFormik({
    initialValues: {
      recipient: '',
      amount: 0.001,
      note: ''
    },
    validationSchema: validSchema,
    onSubmit: async (values) => {
      console.log('>>>>>> values => ', values);
      closeDialog();
    }
  });

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          Send Assets
        </DialogTitle>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogTitle component={Typography} variant="h5" textAlign="center" sx={{ pb: 0 }}>
        {asset['params']['name']}
      </DialogTitle>
      <Typography textAlign="center" sx={{ pt: 0 }}>
        Balance: {balanceToView} {asset['params']['unit-name']}
      </Typography>

      <DialogContent>
        <Stack spacing={2}>
          <TextField
            name="recipient"
            label="To address *"
            value={formik.values.recipient}
            onChange={formik.handleChange}
            error={formik.touched.recipient && Boolean(formik.errors.recipient)}
            helperText={formik.touched.recipient && formik.errors.recipient}
            multiline
            fullWidth
          />
          <TextField
            type="number"
            name="amount"
            label="Amount *"
            value={formik.values.amount}
            onChange={formik.handleChange}
            error={formik.touched.amount && Boolean(formik.errors.amount)}
            helperText={formik.touched.amount && formik.errors.amount}
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
            InputProps={{
              endAdornment: <Button variant="outlined" onClick={() => setAmountAsMax()}>
                Max
              </Button>
            }}
            fullWidth
          />
          <TextField
            name="note"
            label="Note"
            value={formik.values.note}
            onChange={formik.handleChange}
            error={formik.touched.note && Boolean(formik.errors.note)}
            helperText={formik.touched.note && formik.errors.note}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}