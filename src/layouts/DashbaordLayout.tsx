import { Box, Stack } from "@mui/material"
import { Outlet } from "react-router"
import ScrollFab from "../components/ScrollFab"
import Navbar from "./Navbar"

export default function DashboardLayout() {
  return (
    <Stack direction="row">
      <Navbar />
      <Box flexGrow={1} p={5}>
        <Outlet />
        <ScrollFab />
      </Box>
    </Stack>
  )
}