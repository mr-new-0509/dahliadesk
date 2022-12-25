import React, { useState } from 'react'
import { Container, Box, Tab } from '@mui/material'
import PageTitle from '../../components/PageTitle'
import { TabContext, TabList, TabPanel } from '@mui/lab'

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
          <TabList onChange={(e, newValue) => handleSwitchTab(newValue)}>
            <Tab label="Created assets" value="0" />
            <Tab label="Opted assets" value="1" />
            <Tab label="NFT collection" value="2" />
          </TabList>
          <TabPanel value="0"></TabPanel>
          <TabPanel value="1"></TabPanel>
          <TabPanel value="2"></TabPanel>
        </TabContext>
      </Box>
    </Container>
  )
}