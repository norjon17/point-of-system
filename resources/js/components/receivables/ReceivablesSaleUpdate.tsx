import { useDisclosure } from "@mantine/hooks"
import { ReceivableType } from "../../types"
import { useEffect, useState } from "react"
import {
  Button,
  Group,
  Modal,
  Radio,
  Stack,
  TextInput,
  Title,
} from "@mantine/core"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { ReceivableFormType } from "../../types/formTypes"
import { DEF_MSG } from "../../constants/constants"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import { useReceivable } from "../../hooks/receivable"
import { useReceivables } from "../../hooks/receivables"

interface IProps {
  selectedReceivable: ReceivableType | null
  setSelectedReceivable: React.Dispatch<
    React.SetStateAction<ReceivableType | null>
  >
}
export default function ReceivablesSaleUpdate({
  selectedReceivable,
  setSelectedReceivable,
}: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const [balance, setBalance] = useState("0")
  const [change, setChange] = useState("0")
  const { transactionsRefetch } = useReceivables()

  const { update } = useReceivable()

  const {
    watch,
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
    getValues,
  } = useForm<ReceivableFormType>({
    defaultValues: defValues(),
  })

  const onSubmit: SubmitHandler<ReceivableFormType> = async (data) => {
    setDisabled(true)
    let isSuccess = false
    if (selectedReceivable) {
      isSuccess = await update(data, selectedReceivable.id)
    }
    if (isSuccess) {
      await transactionsRefetch()
      handleClose()
    }
    setDisabled(false)
  }

  useEffect(() => {
    if (selectedReceivable) {
      reset({
        cash: null,
        cash_mode: selectedReceivable.sale?.mode_id === 1 ? "cash" : "gcash",
      })
      open()
    } else {
      handleClose()
    }
  }, [selectedReceivable])

  useEffect(() => {
    const cash =
      getValues("cash") && !isNaN(getValues("cash")!)
        ? Number(getValues("cash"))
        : 0
    const cash_mode = getValues("cash_mode")
    if (selectedReceivable) {
      if (cash) {
        let balance = selectedReceivable.balance - cash
        balance = balance < 0 ? 0 : balance
        setBalance(formatNumberWithCommas(balance))
        if (cash_mode === "cash") {
          let change = cash - selectedReceivable?.balance

          setChange(change > 0 ? formatNumberWithCommas(change) : "0")
        }
      } else {
        setBalance(formatNumberWithCommas(selectedReceivable.balance))
        setChange("0")
      }
    }
  }, [watch("cash"), selectedReceivable])

  const handleClose = () => {
    if (!disabled) {
      close()
      setSelectedReceivable(null)
      reset(defValues())
      setBalance("0")
    }
  }
  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Update Receivable"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"lg"}
      >
        <Stack>
          <Title order={4}>Balance (₱): {balance}</Title>
          {watch("cash_mode") === "cash" && (
            <Title order={4}>Change (₱): {change}</Title>
          )}
          <Controller
            control={control}
            name="cash_mode"
            render={({ field: { value, onChange } }) => (
              <Radio.Group
                withAsterisk
                value={value}
                onChange={(e) => {
                  const value = e as "cash" | "gcash"
                  onChange(value)
                }}
              >
                <Group mt="xs">
                  <Radio value="cash" label="Cash" />
                  <Radio value="gcash" label="GCash" />
                </Group>
              </Radio.Group>
            )}
          />
          <TextInput
            type="number"
            label="Cash"
            disabled={disabled}
            {...register("cash", { required: DEF_MSG.REQUIRED })}
            placeholder="Enter amount of cash"
            required
            error={errors.cash?.message}
          />

          {watch("cash_mode") === "gcash" && (
            <TextInput
              type="text"
              label="GCash reference(s) number"
              placeholder="Enter GCash reference(s) number"
              description={"Ex: 9876543210987, 9876543210987"}
              disabled={disabled}
              {...register("gcash_ref", { required: DEF_MSG.REQUIRED })}
              required
              error={errors.gcash_ref?.message}
            />
          )}
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit)()
              }}
              disabled={disabled}
              loading={disabled}
            >
              Update
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleClose()
              }}
              disabled={disabled}
              loading={disabled}
              variant="outline"
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

const defValues = (): ReceivableFormType => ({
  cash: null,
  cash_mode: "cash",
  gcash_ref: null,
})
