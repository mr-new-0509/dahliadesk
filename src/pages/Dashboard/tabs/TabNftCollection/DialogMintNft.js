/* global AlgoSigner */

import React, { useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import * as yup from 'yup';
import { useFormik } from 'formik';
import algosdk from 'algosdk';
import { ALGOD_PORT, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, BASE_URL_OF_IPFS, ERROR, MSG_REQUIRED, SUCCESS } from '../../../../utils/constants';
import { showFirstLetters } from '../../../../utils/functions';
import api from '../../../../utils/api';
import useConnectWallet from '../../../../hooks/useConnectWallet';
import useLoading from '../../../../hooks/useLoading';
import useAlertMessage from '../../../../hooks/useAlertMessage';

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

export default function DialogMintNft({ dialogOpened, setDialogOpened, setDesireReload }) {
  const { currentUser, network, myAlgoWallet, walletName } = useConnectWallet();
  const { openLoading, closeLoading } = useLoading();
  const { openAlert } = useAlertMessage();

  const [nftStandard, setNftStandard] = useState('arc69');
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
      file: undefined
    },
    validationSchema: validSchema,
    onSubmit: async (values) => {
      const { name, unitName, description, totalIssuance, file } = values;
      let assetName = name;
      const enc = new TextEncoder();
      console.log('>>>>>> values => ', values);

      try {
        openLoading();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('unitName', unitName);
        formData.append('description', description);
        formData.append('totalIssuance', totalIssuance);
        formData.append('properties', JSON.stringify(properties));
        formData.append('nftStandard', nftStandard);
        formData.append('nftFile', file);

        const resData = (await api.post('/nftRoute/createAndUploadMetadataFile', formData))['data'];
        console.log('>>>>>>>>>>>>> resData => ', resData);

        if (nftStandard === 'arc3') {
          assetName = name.slice(-5) === '@arc3' ? name : `${name}@arc3`;
        }

        let algodServer = '';
        if (network === 'MainNet') {
          algodServer = ALGOD_SERVER_MAINNET;
        } else {
          algodServer = ALGOD_SERVER_TESTNET;
        }

        const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);
        const params = await algodClient.getTransactionParams().do();

        const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
          from: currentUser,
          total: totalIssuance,
          decimals: 0,
          assetName,
          unitName,
          assetURL: `${BASE_URL_OF_IPFS}/${resData.IpfsHash}`,
          // assetMetadataHash: resData.metadataHash,
          defaultFrozen: false,
          freeze: currentUser,
          manager: currentUser,
          clawback: currentUser,
          reserve: currentUser,
          suggestedParams: params
        });
        const txId = txn.txID().toString();
        console.log('>>>>>>>> txId => ', txId);

        if (walletName === 'MyAlgo') {
          const signedTxn = await myAlgoWallet.signTransaction(txn.toByte());
          console.log('>>>>>>>>>> signedTxn => ', signedTxn);

          await algodClient.sendRawTransaction(signedTxn.blob).do();
        } else if (walletName === 'AlgoSigner') {
          const txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());
          console.log('>>>>>>>> txn_b64 => ', txn_b64);
          const signedTxns = await AlgoSigner.signTxn([{ txn: txn_b64 }]);
          console.log('>>>>>>>> signedTxns => ', signedTxns);
          const binarySignedTxn = await AlgoSigner.encoding.base64ToMsgpack(signedTxns[0].blob);
          console.log('>>>>>>>> binarySignedTxn => ', binarySignedTxn);
          await algodClient.sendRawTransaction(binarySignedTxn).do();
        }

        const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
        console.log('>>>>>>>> confirmedTxn => ', confirmedTxn);

        const txnResponse = await algodClient.pendingTransactionInformation(txId).do();
        console.log('>>>>>>>>> txnResponse => ', txnResponse);
        closeLoading();
        closeDialog();
        openAlert({
          severity: SUCCESS,
          message: `Transaction ${txId} confirmed in round ${txnResponse['confirmed-round']}. The asset id is ${txnResponse['asset-index']}`
        });
        setDesireReload(true);
      } catch (error) {
        console.log('>>>>>>>>> error of DialogMintNft => ', error);
        openAlert({
          severity: ERROR,
          message: error.message
        });
        closeLoading();
      }
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

  const handleSelectFile = (e) => {
    console.log('>>>>>>>> e.target.files => ', e.target.files);
    formik.setFieldValue('file', e.target.files[0]);
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
                accept: 'image/*'
              }}
              onChange={(e) => handleSelectFile(e)}
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
            <FormLabel htmlFor="unit-name">Total supply *</FormLabel>
            <TextField
              type="number"
              name="totalIssuance"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={formik.values.totalIssuance}
              onChange={formik.handleChange}
              error={formik.touched.totalIssuance && Boolean(formik.errors.totalIssuance)}
              helperText={formik.touched.totalIssuance && formik.errors.totalIssuance}
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
                    <Typography>{showFirstLetters(key, 5)}</Typography>
                  </Box>
                  <Box width="45%">
                    <Typography>{showFirstLetters(properties[key], 5)}</Typography>
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