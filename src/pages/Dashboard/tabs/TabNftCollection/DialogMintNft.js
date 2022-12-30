/* global AlgoSigner */
import React, { useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { MSG_REQUIRED } from '../../../../utils/constants';

const validSchema = yup.object().shape({
  name: yup.string().required(MSG_REQUIRED),
  unitName: yup.string().required(MSG_REQUIRED),
  description: yup.string().required(MSG_REQUIRED),
  totalIssuance: yup.number().min(1, 'Minimum value is 1.').required(MSG_REQUIRED),
  file: yup.mixed().required(MSG_REQUIRED)
});

const validSchemaOfProperties = yup.object().shape({
  propertyKey: yup.string().required(MSG_REQUIRED),
  propertyValue: yup.string().required(MSG_REQUIRED)
});

export default function DialogMintNft({ dialogOpened, setDialogOpened }) {
  const [nftStandard, setNftStandard] = useState('arc69');
  // const [uploadEnabled, setUploadEnabled] = useState(false);
  const [properties, setProperties] = useState({});

  const propertyKeys = useMemo(() => {
    return Object.keys(properties);
  }, [properties]);

  const closeDialog = () => {
    setDialogOpened(false);
  };

  const changeNftStandard = (standard) => {
    setNftStandard(standard);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      unitName: '',
      description: '',
      totalIssuance: 1,
      file: null
    },
    validationSchema: validSchema,
    onSubmit: (values) => {
      const { name, unitName, description, totalIssuance, file } = values;
      console.log('>>>>>> values => ', values);
    }
  });

  const formikOfProperties = useFormik({
    initialValues: {
      propertyKey: '',
      propertyValue: ''
    },
    validationSchema: validSchemaOfProperties,
    onSubmit: (values) => {
      const { propertyKey, propertyValue } = values;
      if (Object.hasOwn(properties, propertyKey)) {
        formikOfProperties.setFieldError('propertyKey', 'Already existed key.');
      } else {
        setProperties({
          ...properties,
          [propertyKey]: propertyValue
        });
      }
    }
  });

  const deleteProperty = (key) => {
    let cloneProperties = { ...properties };
    delete cloneProperties[key];
    setProperties(cloneProperties);
  };

  return (
    <Dialog open={dialogOpened} onClose={() => closeDialog()} maxWidth="sm" fullWidth>
      <Stack direction="row" justifyContent="space-between" alignItems="center" pr={2} py={2}>
        <DialogTitle fontWeight={700}>
          Mint NFT
        </DialogTitle>
        <IconButton onClick={() => closeDialog()}>
          <Icon icon="material-symbols:close-rounded" />
        </IconButton>
      </Stack>

      <DialogContent>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel htmlFor="nft-standard">NFT standard</FormLabel>
            <RadioGroup id="nft-standard" row value={nftStandard} onChange={(e) => changeNftStandard(e.target.value)}>
              <FormControlLabel value="arc69" control={<Radio />} label="ARC69" />
              <FormControlLabel value="arc3" control={<Radio />} label="ARC3" />
            </RadioGroup>
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="file">File *</FormLabel>
            <TextField
              name="file"
              type="file"
              // InputProps={{
              //   endAdornment: <Button
              //     variant="outlined"
              //     startIcon={<Icon icon="material-symbols:cloud-upload" />}
              //   >Upload</Button>
              // }}
              inputProps={{
                accept: 'image/*, audio/*, video/*'
              }}
              value={formik.values.file}
              onChange={formik.handleChange}
              error={formik.touched.file && Boolean(formik.errors.file)}
              helperText={formik.touched.file && formik.errors.file}
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="name">Name *</FormLabel>
            <TextField
              name="name"
              placeholder="CryptoKittie #99"
              value={formik.values.name}
              onChange={formik.handleChange}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="unit-name">Unit name *</FormLabel>
            <TextField
              name="unitName"
              placeholder="Kittie"
              value={formik.values.unitName}
              onChange={formik.handleChange}
              error={formik.touched.unitName && Boolean(formik.errors.unitName)}
              helperText={formik.touched.unitName && formik.errors.unitName}
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="description">Description *</FormLabel>
            <TextField
              name="description"
              placeholder="Describe your NFT in few words"
              multiline
              minRows={4}
              value={formik.values.description}
              onChange={formik.handleChange}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              fullWidth
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="properties">Properties</FormLabel>
            <Stack spacing={2} id="properties">
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box width="45%">
                  <TextField
                    name="propertyKey"
                    placeholder="Key"
                    value={formikOfProperties.values.propertyKey}
                    onChange={formikOfProperties.handleChange}
                    error={formikOfProperties.touched.propertyKey && Boolean(formikOfProperties.errors.propertyKey)}
                    helperText={formikOfProperties.touched.propertyKey && formikOfProperties.errors.propertyKey}
                    fullWidth
                  />
                </Box>
                <Box width="45%">
                  <TextField
                    name="propertyValue"
                    placeholder="Value"
                    value={formikOfProperties.values.propertyValue}
                    onChange={formikOfProperties.handleChange}
                    error={formikOfProperties.touched.propertyValue && Boolean(formikOfProperties.errors.propertyValue)}
                    helperText={formikOfProperties.touched.propertyValue && formikOfProperties.errors.propertyValue}
                    fullWidth
                  />
                </Box>
                <Box>
                  <IconButton color="primary" onClick={() => formikOfProperties.handleSubmit()}>
                    <Icon icon="material-symbols:add" />
                  </IconButton>
                </Box>
              </Stack>

              {propertyKeys.map(key => (
                <Stack direction="row" justifyContent="space-between" alignItems="center" key={key}>
                  <Box width="45%">
                    <Typography>{key}</Typography>
                  </Box>
                  <Box width="45%">
                    <Typography>{properties[key]}</Typography>
                  </Box>
                  <Box>
                    <IconButton color="error" onClick={() => deleteProperty(key)}>
                      <Icon icon="material-symbols:close" />
                    </IconButton>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={() => formik.handleSubmit()}>Mint</Button>
      </DialogActions>
    </Dialog>
  );
}