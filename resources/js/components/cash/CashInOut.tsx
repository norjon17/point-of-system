import {
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from "react-hook-form"
import { CashFormType } from "../../types/formTypes"
import { useMemo, useState } from "react"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import { DEF_MSG, numberValidation } from "../../constants/constants"
import { notifications } from "@mantine/notifications"
import { useCash } from "../../hooks/cash"
import { useCashTransactions } from "../../hooks/cashTransactions"
import { useMenu } from "../../hooks/menu"

interface IProps {
  type: "in" | "out"
}
export default function CashInOut({ type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { cashIn, cashOut } = useCash()
  const { cashMenu, cashMenuLoading } = useMenu({
    enableCashMenu: type === "out" ? true : false,
  })
  const [isEmployee, setIsEmployee] = useState(false)

  const { transactionsRefetch, totalCashRefetch } = useCashTransactions()

  const employeeMenu = useMemo(() => {
    console.log(cashMenu)
    if (cashMenu && cashMenu.employees) {
      return cashMenu.employees.map((item) => ({
        value: `${item.id}`,
        label: item.name,
      }))
    }
    return []
  }, [cashMenu])

  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
    setValue,
  } = useForm<CashFormType>({
    defaultValues: {
      type_id: type === "in" ? 1 : 2, //cash in = 1, out = 2, based on database
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

  const onSubmit: SubmitHandler<CashFormType> = async (data) => {
    if (totalAmount <= 0) {
      notifications.show({
        title: "Error",
        message: "Breakdown/Denominator is required.",
        color: "red",
      })
      return
    }

    setDisabled(true)

    let isSuccess = false
    if (type === "in") {
      isSuccess = await cashIn(data)
    } else {
      isSuccess = await cashOut(data)
    }
    if (isSuccess) {
      close()
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
        title={`${type === "in" ? "Cash In" : "Cash Out"}`}
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

          {type === "out" && (
            <>
              {!isEmployee && (
                <TextInput
                  label={`Name`}
                  description="Specific person"
                  placeholder="Enter name of person"
                  {...register(`name`)}
                  disabled={disabled}
                />
              )}
              {isEmployee && (
                <Controller
                  control={control}
                  name="employee_id"
                  render={({ field: { value, onChange } }) => (
                    <Select
                      data={employeeMenu}
                      value={value ? `${value}` : null}
                      onChange={(e) => {
                        const tid = Number(e)
                        onChange(tid)
                        const temp = employeeMenu.find(
                          (i) => i.value === `${tid}`
                        )
                        if (temp) {
                          setValue("name", temp.label)
                        }
                      }}
                      allowDeselect={false}
                      label="Employee"
                      placeholder="Select Employee"
                      disabled={cashMenuLoading}
                    />
                  )}
                />
              )}
              <Checkbox
                checked={isEmployee}
                onChange={(e) => {
                  const val = e.target.checked
                  setIsEmployee(val)
                  if (!val) {
                    setValue("employee_id", null)
                    setValue("name", "")
                  }
                }}
                label="Is Employee"
              />
            </>
          )}
          <Controller
            control={control}
            name="details"
            rules={{
              required: type === "out" ? DEF_MSG.REQUIRED : undefined,
            }}
            render={({ field: { value, onChange } }) => (
              <Textarea
                value={value}
                onChange={onChange}
                label="Details"
                placeholder="Enter details"
                required={type === "out" ? true : false}
                error={type === "out" ? errors.details?.message : undefined}
                disabled={disabled}
              />
            )}
          />
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

      <Button onClick={open}>{type === "in" ? "IN" : "OUT"}</Button>
    </>
  )
}
