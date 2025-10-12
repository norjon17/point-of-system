import { useNavigate } from "react-router"
import { WEB_APP_NAME } from "../../../constants/constants"
import AccountMenu from "../AccountMenu/AccountMenu"
import { AppShell, Burger, Button, Flex, Image } from "@mantine/core"
import { LINKS } from "../../../routes"
import { useSidebar } from "../../../context/SidebarContext"

// export default function Header({ open, setOpen }: IProps) {
export default function Header() {
  const { isSidebarOpen, setSidebarOpen } = useSidebar()

  const navigate = useNavigate()

  return (
    <>
      <AppShell.Header
        bg={"myprimary.8"}
        style={{
          // backgroundColor: "#41E2CD",
          // boxShadow: "0 4px 4px rgba(0, 0, 0, 0.1)",
          border: "none",
        }}
      >
        <Flex h="100%" w="100%" px="md" align={"center"} gap={10}>
          <Burger
            opened={isSidebarOpen}
            onClick={() => {
              setSidebarOpen(!isSidebarOpen)
            }}
            color="white"
          />

          <Button
            component="a"
            // c="darkBlue.9"
            color="white"
            variant="subtle"
            href={LINKS.HOME}
            onClick={(e) => {
              e.preventDefault()
              navigate(LINKS.HOME)
            }}
            leftSection={<Image src="/assets/images/logo.png" w={150} />}
            h={"100%"}
            radius={0}
          >
            {WEB_APP_NAME}
          </Button>
          <span style={{ flex: 1 }}></span>
          {/* {!mediaMinLG && (
            <Title
              style={{
                flex: 1,
                textAlign: "center",
              }}
              order={5}
            >
              {pageTitle}
            </Title>
          )} */}

          <AccountMenu />
        </Flex>
      </AppShell.Header>
    </>
  )
}
