import {
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { useEffect, useState } from "react"
import { useTurnover } from "../../hooks/turnover"
import { TurnoverType } from "../../types"
import { useAuth } from "../../hooks/auth"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import { nanoid } from "nanoid"
import { useNavigate } from "react-router"
import { LINKS } from "../../routes"

export default function TurnoverPopup() {
  const { userData: user, logout, refetchUser } = useAuth()
  const navigate = useNavigate()

  const [opened, { open, close }] = useDisclosure(false)
  const [open1, setOpen1] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [turnover, setTurnover] = useState<TurnoverType | null>(null)

  const { getTurnover, acceptTurnover } = useTurnover()

  const handleSubmit = async () => {
    setDisabled(true)
    let isSuccess = await acceptTurnover(turnover?.id!)
    const updatedData = await getTurnover(turnover?.id)
    if (updatedData && isSuccess) {
      handleClose(updatedData)
    }
    setDisabled(false)
  }

  useEffect(() => {
    if (user) {
      ;(async () => {
        const data = await getTurnover()
        if (data && data.turnover_from_id !== user.id) {
          setTurnover(data)
        } else if (data && data.turnover_from_id === user.id) {
          if (data.accepted_by_id === null) {
            setOpen1(true)
          }
        } else {
          setTurnover(null)
        }
      })()
    }
  }, [user])

  useEffect(() => {
    if (user && turnover) {
      open()
    }
  }, [turnover, user])

  const handleClose = (turnover?: TurnoverType) => {
    if (!disabled && turnover?.accepted_by_id) {
      close()
    }
  }

  const handleLogout = async () => {
    setDisabled(true)
    await logout()
    await refetchUser()
    navigate(LINKS.LOGIN)
    setOpen1(false)
    setDisabled(false)
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={`Turnover Cash`}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"lg"}
      >
        <Stack>
          <Title order={4}>
            Total Cash: {formatNumberWithCommas(turnover?.amount)}
          </Title>
          <Text>Breakdown/Denominator</Text>
          <SimpleGrid cols={3}>
            {turnover?.denominations.map((i) => (
              <Text key={nanoid()}>
                {i.denomination}
                {" : "}
                {i.quantity}
              </Text>
            ))}
          </SimpleGrid>
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={disabled}
              loading={disabled}
            >
              Accept
            </Button>
          </Group>
        </Stack>
      </Modal>
      <Modal
        opened={open1}
        onClose={handleLogout}
        title={`Turnover Cash`}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"lg"}
      >
        <Stack>
          <Text>
            Your turnover cash has not been accepted yet. Please ask the next
            cashier to accept your turnover cash.
          </Text>
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={handleLogout}
              disabled={disabled}
              loading={disabled}
            >
              OK
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
