import {
  Button,
  Checkbox,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { CashFormTypeV2 } from "../../types/formTypes"
import { useMemo, useState } from "react"
import { DEF_MSG } from "../../constants/constants"
import { useCash } from "../../hooks/cash"
import { useCashTransactions } from "../../hooks/cashTransactions"
import { useMenu } from "../../hooks/menu"

interface IProps {
  type: "in" | "out"
}
export default function CashInOutV2({ type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { cashInV2, cashOutV2 } = useCash()
  const { cashMenu, cashMenuLoading } = useMenu({
    enableCashMenu: type === "out" ? true : false,
  })
  const [isEmployee, setIsEmployee] = useState(false)

  const { transactionsRefetch, totalCashRefetch } = useCashTransactions()

  const employeeMenu = useMemo(() => {
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
  } = useForm<CashFormTypeV2>({
    defaultValues: {
      type_id: type === "in" ? 1 : 2, //cash in = 1, out = 2, based on database
      amount: null,
    },
  })

  const onSubmit: SubmitHandler<CashFormTypeV2> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (type === "in") {
      isSuccess = await cashInV2(data)
    } else {
      isSuccess = await cashOutV2(data)
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
          <TextInput
            label={`Amount`}
            type="number"
            placeholder="Enter amount of cash"
            {...register(`amount`)}
            disabled={disabled}
            required
            error={errors.amount?.message}
          />

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
