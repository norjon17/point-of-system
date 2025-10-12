import {
  ActionIcon,
  Button,
  Group,
  Modal,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { useEffect, useState } from "react"
import { DEF_MSG } from "../../../constants/constants"
import { MdEdit } from "react-icons/md"
import { useEmployees } from "../../../hooks/employees"
import { EmployeeLoanFormType } from "../../../types/formTypes"
import { QueryObserverResult, RefetchOptions } from "@tanstack/react-query"
import { EmployeeLoanType } from "../../../types"

interface IProps {
  loan?: EmployeeLoanFormType
  employee_id: number
  type: "add" | "edit"
  employeeLoansRefetch: (
    options?: RefetchOptions
  ) => Promise<QueryObserverResult<EmployeeLoanType[], Error>>
}
export default function AddLoan({
  loan,
  employee_id,
  type,
  employeeLoansRefetch,
}: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { insertLoan, updateLoan } = useEmployees()

  const defVals = (): EmployeeLoanFormType => ({
    id: null,
    employee_id: employee_id,
    amount: null,
    details: null,
  })

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<EmployeeLoanFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<EmployeeLoanFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (loan) {
      //update
      isSuccess = await updateLoan(data)
    } else {
      //create
      isSuccess = await insertLoan(data)
    }
    if (isSuccess) {
      await employeeLoansRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  useEffect(() => {
    if (loan) {
      reset(loan)
    }
  }, [loan])

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
  }

  return (
    <>
      {type === "add" && <Button onClick={open}>Insert Loan</Button>}

      {type === "edit" && (
        <Tooltip label="Update Employee Loan">
          <ActionIcon
            onClick={() => {
              if (loan) {
                open()
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
          <TextInput
            label="Amount"
            type="number"
            {...register("amount", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.amount?.message}
          />

          <Controller
            control={control}
            name="details"
            render={({ field: { value, onChange } }) => (
              <Textarea
                value={value ? value : ""}
                onChange={onChange}
                minRows={3}
                autosize
                resize="vertical"
                required
                error={errors.details?.message}
                label="Details"
                placeholder="Enter details of loan"
              />
            )}
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
