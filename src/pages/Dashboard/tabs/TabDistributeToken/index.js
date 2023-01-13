import React, { Fragment, useState } from 'react';
import { Box, Button, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import * as XLSX from 'xlsx';
import useLoading from '../../../../hooks/useLoading';

export default function TabDistributeToken() {
  const { openLoading, closeLoading } = useLoading();

  const [file, setFile] = useState(null);
  const [excelData, setExcelData] = useState([]);

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
        let ws = wb.Sheets[SheetNames[i]];
        let data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        _excelData.push({
          sheetName: SheetNames[i],
          data
        });
      }
      closeLoading();
      setExcelData(_excelData);
    };
    fileReader.readAsBinaryString(file);
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
          <Button variant="contained">Clawback</Button>
          <Button variant="contained">Freeze</Button>
          <Button variant="contained">Send</Button>
        </Stack>
      </Stack>
      <TableContainer sx={{ mt: 5 }} component={Paper}>
        {excelData.map((dataItem, dataItemIndex) => (
          <Table key={dataItemIndex}>
            <caption>{dataItem.sheetName}</caption>
            <TableHead>
              <TableRow>
                {dataItem.data[0].map((column, columnIndex) => (
                  <TableCell key={columnIndex}>{column}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {dataItem.data.map((row, rowIndex) => {
                if (rowIndex > 0) {
                  return <TableRow key={rowIndex}>
                    {row.map((column, columnIndex) => (
                      <TableCell key={columnIndex}>{column}</TableCell>
                    ))}
                  </TableRow>;
                } else {
                  return <Fragment key={rowIndex} />;
                }
              })}
            </TableBody>
          </Table>
        ))}

      </TableContainer>
    </Box>
  );
}