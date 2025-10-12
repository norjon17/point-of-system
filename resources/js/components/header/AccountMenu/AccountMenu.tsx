import { useState } from "react"
import { Button, Group, LoadingOverlay, Menu, Modal } from "@mantine/core"
import { MdAccountCircle } from "react-icons/md"
import { FiLogOut } from "react-icons/fi"
import { MdManageAccounts } from "react-icons/md"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_NAME } from "../../../constants/constants"
import { useAuth } from "../../../hooks/auth"
import { LINKS } from "../../../routes"
import { useNavigate } from "react-router"

export default function AccountMenu() {
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)

  const { user, logout } = useAuth()

  //dialog logout
  const [open, setOpen] = useState(false)
  const handleCloseDialog = () => {
    setOpen(false)
  }
  //handle user logout
  const handleLogout = async () => {
    setLoading(true)
    try {
      const res = await logout()

      if (res) {
        await queryClient.setQueryData([QUERY_NAME.USER], null)
        setOpen(false)
        // window.location.reload();
      }
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <>
      <Menu shadow="md">
        <Menu.Target>
          <Button
            variant="subtle"
            color="inherit"
            leftSection={<MdAccountCircle size={20} />}
          >
            {user?.name}
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<MdManageAccounts size={20} />}
            onClick={() => navigate(LINKS.ACCOUNT_SETTING)}
          >
            Account Setting
          </Menu.Item>
          <Menu.Item
            leftSection={<FiLogOut size={20} />}
            onClick={() => setOpen(true)}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={open}
        onClose={handleCloseDialog}
        title="Logout"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        pos="relative"
      >
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: "sm", blur: 2 }}
        />
        <Modal.Body>Are your sure?</Modal.Body>
        <Group justify="flex-end">
          <Button onClick={handleLogout}>Yes</Button>
          <Button onClick={handleCloseDialog} variant="outline">
            No
          </Button>
        </Group>
      </Modal>
    </>
  )
}
