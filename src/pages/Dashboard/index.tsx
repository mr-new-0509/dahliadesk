import React, { useState } from 'react'
import { Container, Box, Tab } from '@mui/material'
import PageTitle from '../../components/PageTitle'
import { TabContext, TabList, TabPanel } from '@mui/lab'
import TabCreatedAssets from './tabs/TabCreatedAssets'
import TabOptedAssets from './tabs/TabOptedAssets'

export default function Dashboard() {
  const [currentTab, setCurrentTab] = useState<string>("0")

  const handleSwitchTab = (newValue: string) => {
    setCurrentTab(newValue)
  }
  return (
    <Container maxWidth="xl">
      <PageTitle />

      <Box mt={3}>
        <TabContext value={currentTab}>
          <Box borderBottom={1} borderColor="divider">
            <TabList onChange={(e, newValue) => handleSwitchTab(newValue)}>
              <Tab label="Created assets" value="0" />
              <Tab label="Opted assets" value="1" />
              <Tab label="NFT collection" value="2" />
            </TabList>
          </Box>
          <Box mt={3}>
            <TabPanel value="0"><TabCreatedAssets /></TabPanel>
            <TabPanel value="1"><TabOptedAssets /></TabPanel>
            <TabPanel value="2"></TabPanel>
          </Box>
        </TabContext>
      </Box>
    </Container>
  )
}