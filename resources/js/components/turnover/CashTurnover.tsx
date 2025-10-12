import {
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"
import { TurnoverFormType } from "../../types/formTypes"
import { useMemo, useState } from "react"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import { numberValidation } from "../../constants/constants"
import { notifications } from "@mantine/notifications"
import { useCashTransactions } from "../../hooks/cashTransactions"
import { useTurnover } from "../../hooks/turnover"
import { useNavigate } from "react-router"
import { useAuth } from "../../hooks/auth"
import { LINKS } from "../../routes"

export default function CashTurnover() {
  const { logout, refetchUser } = useAuth()
  const navigate = useNavigate()
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)

  const { turnover } = useTurnover()
  const { transactionsRefetch, totalCashRefetch } = useCashTransactions()

  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
  } = useForm<TurnoverFormType>({
    defaultValues: {
      denominations: [
        {
          denomination: 1000,
          quantity: null,
        },
        {
          denomination: 500,
          quantity: null,
        },
        {
          denomination: 200,
          quantity: null,
        },
        {
          denomination: 100,
          quantity: null,
        },
        {
          denomination: 50,
          quantity: null,
        },
        {
          denomination: 20,
          quantity: null,
        },
        {
          denomination: 10,
          quantity: null,
        },
        {
          denomination: 5,
          quantity: null,
        },
        {
          denomination: 1,
          quantity: null,
        },
      ],
    },
  })

  const denominationsField = useFieldArray({
    control: control,
    name: "denominations",
  })

  const denominations = useWatch({
    control,
    name: "denominations",
  })

  const totalAmount = useMemo(() => {
    return denominations.reduce(
      (sum, item) =>
        sum + item.denomination * (item.quantity ? item.quantity : 0),
      0
    )
  }, [denominations])

  const onSubmit: SubmitHandler<TurnoverFormType> = async (data) => {
    if (totalAmount <= 0) {
      notifications.show({
        title: "Error",
        message: "Breakdown/Denominator is required.",
        color: "red",
      })
      return
    }

    setDisabled(true)

    let isSuccess = await turnover(data)

    if (isSuccess) {
      close()
      await logout()
      await refetchUser()
      navigate(LINKS.LOGIN)
      reset()
      transactionsRefetch()
      totalCashRefetch()
    }
    setDisabled(false)
  }

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
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
          <Text fw={600}>
            Total: {`₱ ${formatNumberWithCommas(totalAmount)}`}
          </Text>

          <Text>
            Breakdown/Denominator{" "}
            <Text inherit span c="red">
              *
            </Text>
          </Text>
          <SimpleGrid cols={3}>
            {denominationsField.fields.map((item, index) => (
              <TextInput
                type="number"
                label={`₱ ${formatNumberWithCommas(item.denomination)}`}
                key={index}
                description="Quantity"
                placeholder="Enter quantity"
                {...register(`denominations.${index}.quantity`, {
                  ...numberValidation,
                })}
                min={0}
                disabled={disabled}
                error={errors.denominations?.[index]?.quantity?.message}
              />
            ))}
          </SimpleGrid>
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit)()
              }}
              disabled={disabled}
              loading={disabled}
            >
              Submit
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Button onClick={open}>Turnover</Button>
    </>
  )
}
