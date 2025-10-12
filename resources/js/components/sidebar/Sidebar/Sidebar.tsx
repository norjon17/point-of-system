import { AppShell } from "@mantine/core"
import SidebarContents from "../SidebarContents/SidebarContents"

export default function Sidebar() {
  return (
    <AppShell.Navbar p="xs">
      <SidebarContents />
    </AppShell.Navbar>
  )
}
