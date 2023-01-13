/* global AlgoSigner */
import React, { useState } from 'react';
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import WAValidator from 'multicoin-address-validator';
import algosdk from 'algosdk';
import useLoading from '../../../../hooks/useLoading';
import { REVOKE, FREEZE, SEND, EXCEL_FIELD_NAME_OF_WALLET_ADDRESS, EXCEL_FIELD_NAME_OF_RESULT, MSG_FAILED, ALGOD_SERVER_MAINNET, ALGOD_SERVER_TESTNET, ALGOD_TOKEN, ALGOD_PORT, EXCEL_FIELD_NAME_OF_QUANTITY, EXCEL_FIELD_NAME_OF_NOTE, EXCEL_FIELD_NAME_OF_ASSET_ID, INDEXER_SERVER_MAINNET, INDEXER_SERVER_TESTNET, WALLET_MY_ALGO, WALLET_ALGO_SIGNER, MSG_SUCCESS } from '../../../../utils/constants';
import useConnectWallet from '../../../../hooks/useConnectWallet';

export default function TabDistributeToken() {
  const { openLoading, closeLoading } = useLoading();
  const { network, currentUser, walletName, myAlgoWallet, peraWallet } = useConnectWallet();

  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);

  /* Load excel file and show table */
  const loadFile = () => {
    let _excelData = [];
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      openLoading();
      /* Parse data */
      const bstr = e.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      /* Get sheets */
      const { SheetNames } = wb;

      for (let i = 0; i < SheetNames.length; i += 1) {
        let data = { sheetName: SheetNames[i] };
        let ws = wb.Sheets[SheetNames[i]];
        let dataOfArray = XLSX.utils.sheet_to_json(ws, { header: 1 });
        data.columnFields = [...dataOfArray[0], 'Result'];
        data.columnValues = [];

        for (let j = 1; j < dataOfArray.length; j += 1) {
          let columnItem = {};

          for (let k = 0; k <= dataOfArray[j].length; k += 1) {
            columnItem[data['columnFields'][k]] = dataOfArray[j][k];
            if (k === dataOfArray[j].length) {
              columnItem[data['columnFields'][k]] = '';
            }
          }
          data.columnValues.push(columnItem);
        }
        _excelData.push(data);
      }
      console.log('>>>>>>>> _excelData => ', _excelData);
      closeLoading();
      setExcelData(_excelData);
    };
    fileReader.readAsBinaryString(file);
  };

  /* handle tokens */
  const handleAssets = async (handleType) => {
    openLoading();
    let txn = null;
    const enc = new TextEncoder();
    let encodedNote = null;
    let _excelData = [...excelData];
    let algodServer = '';
    if (network === 'MainNet') {
      algodServer = ALGOD_SERVER_MAINNET;
    } else {
      algodServer = ALGOD_SERVER_TESTNET;
    }

    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, algodServer, ALGOD_PORT);
    const params = await algodClient.getTransactionParams().do();

    let indexerServer = '';
    if (network === 'MainNet') {
      indexerServer = INDEXER_SERVER_MAINNET;
    } else {
      indexerServer = INDEXER_SERVER_TESTNET;
    }
    const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, indexerServer, ALGOD_PORT);

    for (let i = 0; i < _excelData.length; i += 1) {
      let { columnValues } = _excelData[i];
      let arrOfTxIdAndColumnValueIndex = [];
      let txGroupsForPeraWallet = [];
      let txGroupsForMyAlgo = [];
      let txGroupsForAlgoSigner = [];

      for (let j = 0; j < columnValues.length; j += 1) {
        //  Validate the address in excel file
        let isValidWalletAddress = WAValidator.validate(columnValues[j][EXCEL_FIELD_NAME_OF_WALLET_ADDRESS], 'algo');
        if (isValidWalletAddress) {
          try {
            //  Check whether the asset that has the ID in excel file is existed
            let searchedResult = await indexerClient
              .searchForAssets()
              .index(Number(columnValues[j][EXCEL_FIELD_NAME_OF_ASSET_ID])).do();
            let asset = searchedResult.assets[0];

            if (asset) {
              let objectOfTxIdAndColumnValueIndex = {};

              if (columnValues[j][EXCEL_FIELD_NAME_OF_NOTE]) {
                encodedNote = enc.encode(columnValues[j][EXCEL_FIELD_NAME_OF_NOTE]);
              }

              if (handleType === SEND) {
                //  Send asset
                txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                  currentUser,
                  columnValues[j][EXCEL_FIELD_NAME_OF_WALLET_ADDRESS],
                  undefined,
                  undefined,
                  Number(columnValues[j][EXCEL_FIELD_NAME_OF_QUANTITY]),
                  encodedNote || undefined,
                  Number(columnValues[j][EXCEL_FIELD_NAME_OF_ASSET_ID]),
                  params
                );
              } else if (handleType === FREEZE) {
                //  Freeze asset
                txn = algosdk.makeAssetFreezeTxnWithSuggestedParams(
                  currentUser,
                  encodedNote || undefined,
                  Number(columnValues[j][EXCEL_FIELD_NAME_OF_ASSET_ID]),
                  columnValues[j][EXCEL_FIELD_NAME_OF_WALLET_ADDRESS],
                  true,
                  params
                );
              } else {
                //  Revoke asset
                txn = algosdk.makeAssetTransferTxnWithSuggestedParams(
                  currentUser,
                  asset['params']['reserve'],
                  undefined,
                  columnValues[j][EXCEL_FIELD_NAME_OF_WALLET_ADDRESS],
                  Number(columnValues[j][EXCEL_FIELD_NAME_OF_QUANTITY]),
                  encodedNote || undefined,
                  Number(columnValues[j][EXCEL_FIELD_NAME_OF_ASSET_ID]),
                  params
                );
              }

              let txId = txn.txID().toString();
              objectOfTxIdAndColumnValueIndex.txId = txId;
              objectOfTxIdAndColumnValueIndex.columnValueIndex = j;

              let txn_b64 = await AlgoSigner.encoding.msgpackToBase64(txn.toByte());
              txGroupsForAlgoSigner.push({ txn: txn_b64 });
              txGroupsForMyAlgo.push({ txn: txn.toByte(), signers: [currentUser] });
              txGroupsForPeraWallet.push({ txn, signers: [currentUser] });
            } else {
              columnValues[j][EXCEL_FIELD_NAME_OF_RESULT] = MSG_FAILED;
              continue;
            }
          } catch (error) {
            console.log('>>>>>>>>>>>> error => ', error);
            columnValues[j][EXCEL_FIELD_NAME_OF_RESULT] = MSG_FAILED;
            continue;
          }
        } else {
          columnValues[j][EXCEL_FIELD_NAME_OF_RESULT] = MSG_FAILED;
          continue;
        }
      }

      try {
        if (walletName === WALLET_MY_ALGO) {
          //  MyAlgo Wallet
          let signedTxn = await myAlgoWallet.signTxns(txGroupsForMyAlgo);
          await algodClient.sendRawTransaction(signedTxn.blob).do();
        } else if (walletName === WALLET_ALGO_SIGNER) {
          //  AlgoSigner
          let signedTxns = await AlgoSigner.signTxn(txGroupsForAlgoSigner);
          let binarySignedTxn = await AlgoSigner.encoding.base64ToMsgpack(signedTxns[0].blob);
          await algodClient.sendRawTransaction(binarySignedTxn).do();
        } else {
          console.log('>>> txGroupsForPeraWallet => ', txGroupsForPeraWallet);
          //  PeraWallet
          let signedTxn = await peraWallet.signTransaction([txGroupsForPeraWallet]);
          await algodClient.sendRawTransaction(signedTxn).do();
        }
        // await algosdk.waitForConfirmation(algodClient, txId, 4);
        // await algodClient.pendingTransactionInformation(txId).do();
        // columnValues[j][EXCEL_FIELD_NAME_OF_RESULT] = MSG_SUCCESS;
        // continue;
      } catch (error) {
        console.log(error);
      }
    }
    closeLoading();
  };
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Stack direction="row" alignItems="center" spacing={1}>
          <TextField
            type="file"
            label="Upload file"
            id="file"
            inputProps={{
              accept: '.xls, .xlsx'
            }}
            autoFocus
            onChange={(e) => setFile(e.target.files[0])}
          />
          <Button sx={{ mt: 20 }} variant="contained" disabled={!file} onClick={() => loadFile()}>Load</Button>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button variant="contained" onClick={() => handleAssets(REVOKE)}>Clawback</Button>
          <Button variant="contained" onClick={() => handleAssets(FREEZE)}>Freeze</Button>
          <Button variant="contained" onClick={() => handleAssets(SEND)}>Send</Button>
        </Stack>
      </Stack>
      <TableContainer sx={{ mt: 5 }} component={Paper}>
        {excelData.map((dataItem, dataItemIndex) => (
          <Table key={dataItemIndex}>
            <caption>{dataItem.sheetName}</caption>
            <TableHead>
              <TableRow>
                {dataItem.columnFields.map((columnNameItem, columnNameIndex) => (
                  <TableCell sx={{ fontWeight: 700 }} key={columnNameIndex}>{columnNameItem}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataItem.columnValues.map((columnValuesItem, columnValuesIndex) => {
                let columnValues = [];
                for (let propertyName in columnValuesItem) {
                  columnValues.push(columnValuesItem[propertyName]);
                }
                return (
                  <TableRow key={columnValuesIndex}>
                    {columnValues.map((columnValueItem, columnValueIndex) => (
                      <TableCell key={columnValueIndex}>{columnValueItem}</TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ))}
      </TableContainer>
    </Box>
  );
}