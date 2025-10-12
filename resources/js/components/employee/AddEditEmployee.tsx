import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  TextInput,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { EmployeeFormType } from "../../types/formTypes"
import { useEffect, useState } from "react"
import { DEF_MSG } from "../../constants/constants"
import { EmployeeType } from "../../types"
import { MdEdit } from "react-icons/md"
import { useEmployees } from "../../hooks/employees"

interface IProps {
  employee?: EmployeeType
  type: "add" | "edit"
}
export default function AddEditEmployee({ employee, type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { addEmployee, employeesRefetch, updateEmployee } = useEmployees()

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<EmployeeFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<EmployeeFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (employee) {
      //update
      isSuccess = await updateEmployee(data)
    } else {
      //create
      isSuccess = await addEmployee(data)
    }
    if (isSuccess) {
      await employeesRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  useEffect(() => {
    if (employee) {
      reset(employee)
    }
  }, [employee])

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
  }

  return (
    <>
      {type === "add" && <Button onClick={open}>Add Employee</Button>}

      {type === "edit" && (
        <Tooltip label="Update Employee">
          <ActionIcon
            onClick={() => {
              if (employee) {
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
            label="Name"
            {...register("name", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.name?.message}
          />
          <TextInput
            label="Salary"
            description="(per day)"
            type="number"
            {...register("salary", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.salary?.message}
          />

          {/* {type === "edit" && (
            <TextInput
              type="number"
              label="Loan"
              {...register("loan_amount")}
            />
          )} */}
          {type === "edit" && (
            <Controller
              control={control}
              name="active"
              rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Checkbox
                  checked={value === 1 ? true : false}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange(1)
                    } else {
                      onChange(0)
                    }
                  }}
                  label="Active"
                  disabled={disabled}
                />
              )}
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

const defVals = (): EmployeeFormType => ({
  id: null,
  name: null,
  salary: null,
  active: 1,
})
