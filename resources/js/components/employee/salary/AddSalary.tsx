import {
  ActionIcon,
  Button,
  CloseIcon,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useEffect, useMemo, useState } from "react"
import { DEF_MSG } from "../../../constants/constants"
import { MdEdit } from "react-icons/md"
import { useEmployees } from "../../../hooks/employees"
import { EmployeeSalaryFormType } from "../../../types/formTypes"
import { formatNumberWithCommas } from "../../../utils/number/formatNumberWithCommas"
import { EmployeeSalaryType, EmployeeType } from "../../../types"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { FaEquals } from "react-icons/fa"
import { DateTimePicker } from "@mantine/dates"

interface IProps {
  salary?: EmployeeSalaryFormType
  employee: EmployeeType
  type: "add" | "edit"
  employeeSalariesRefetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<EmployeeSalaryType[], Error>>
  employeeDetailsRefetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<EmployeeType | null, Error>>
}
export default function AddSalary({
  salary,
  type,
  employee,
  employeeSalariesRefetch,
  employeeDetailsRefetch,
}: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { insertSalary } = useEmployees()
  const [tloan, setTLoan] = useState(employee.loans_amount)

  const defVals = (): EmployeeSalaryFormType => ({
    id: null,
    employee_id: employee.id,
    days: null,
    salary: employee.salary,
    loan_to_pay: null,
    date_salary: new Date(),
  })

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    watch,
    control,
  } = useForm<EmployeeSalaryFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<EmployeeSalaryFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (salary) {
      //update
      // isSuccess = await updateSalary(data)
    } else {
      //create
      isSuccess = await insertSalary(data)
    }
    if (isSuccess) {
      await employeeDetailsRefetch()
      await employeeSalariesRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  useEffect(() => {
    if (salary) {
      reset(salary)
    }
  }, [salary])

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
  }

  const tdays = watch("days")
  const tLoanToPay = watch("loan_to_pay")
  const salaryToEarn = useMemo(() => {
    //days * daily salary
    let regular_salary = tdays ? tdays * employee.salary : 0 * employee.salary

    //loans to pay
    if (employee.loans_amount && employee.loans_amount > 0 && tLoanToPay) {
      regular_salary = regular_salary - tLoanToPay
      setTLoan(employee.loans_amount ? employee.loans_amount - tLoanToPay : 0)
    }
    //total salary
    return regular_salary
  }, [tdays, tLoanToPay])

  const normalSalary = useMemo(() => {
    return tdays ? tdays * employee.salary : 0 * employee.salary
  }, [tdays])

  return (
    <>
      {type === "add" && <Button onClick={open}>Compute Salary</Button>}

      {type === "edit" && (
        <Tooltip label="Update Employee Salary">
          <ActionIcon
            onClick={async () => {
              if (salary) {
                open()
                await employeeDetailsRefetch()
              }
            }}
            radius={"xl"}
          >
            <MdEdit size={20} />
          </ActionIcon>
        </Tooltip>
      )}

      <Modal
        opened={opened}
        onClose={handleClose}
        title={type === "add" ? "Add New" : "Update"}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"md"}
      >
        <Stack>
          <Group gap={10}>
            <Text>
              Daily Rate:{" "}
              <Text inherit span fw={600}>
                {formatNumberWithCommas(employee.salary)}
              </Text>
            </Text>
            <CloseIcon size="20px" />
            <TextInput
              type="number"
              {...register("days", { required: DEF_MSG.REQUIRED })}
              required
              error={errors.days?.message}
              flex={1}
              placeholder="days"
            />
            <FaEquals size={18} style={{ flex: 1 }} />
            <Text fw={600} flex={1} style={{ textAlign: "right" }}>
              {formatNumberWithCommas(normalSalary)}
            </Text>
          </Group>
          <Text>
            Loan Total:{" "}
            <Text inherit span fw={600}>
              {formatNumberWithCommas(tloan)}
            </Text>
          </Text>
          {employee.loans_amount && employee.loans_amount > 0 && (
            <TextInput
              label="Loan to pay"
              type="number"
              {...register("loan_to_pay", { required: DEF_MSG.REQUIRED })}
              required
              error={errors.loan_to_pay?.message}
            />
          )}

          <Controller
            control={control}
            name="date_salary"
            render={({ field: { value, onChange } }) => (
              <DateTimePicker
                value={value ? new Date(value) : new Date()}
                onChange={onChange}
                dropdownType="modal"
                label="Salary Date and Time"
                placeholder="Pick a date and time"
              />
            )}
          />

          <Text fz={20}>
            Computed Salary:{" "}
            <Text inherit span fw={600}>
              {formatNumberWithCommas(salaryToEarn)}
            </Text>
          </Text>
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit)()
              }}
              disabled={disabled}
              loading={disabled}
            >
              {type === "add" ? "Submit" : "Update"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={disabled}
              loading={disabled}
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}
