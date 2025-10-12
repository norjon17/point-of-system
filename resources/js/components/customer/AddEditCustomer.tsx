import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { CustomerFormType } from "../../types/formTypes"
import { useEffect, useState } from "react"
import { DEF_MSG } from "../../constants/constants"
import { useCustomer } from "../../hooks/customers"
import { CustomerType } from "../../types"
import { MdEdit } from "react-icons/md"

interface IProps {
  customer?: CustomerType
  type: "add" | "edit"
}
export default function AddEditCustomer({ customer, type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const {
    addProduct: addCustomer,
    customersRefetch,
    updateCustomer,
  } = useCustomer()

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<CustomerFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<CustomerFormType> = async (data) => {
    setDisabled(true)

    console.log(data)
    let isSuccess = false
    if (customer) {
      //update
      isSuccess = await updateCustomer(data)
    } else {
      //create
      isSuccess = await addCustomer(data)
    }

    if (isSuccess) {
      await customersRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
  }

  useEffect(() => {
    if (customer) {
      reset(customer)
    }
  }, [customer])

  return (
    <>
      {type === "add" && <Button onClick={open}>Create</Button>}

      {type === "edit" && (
        <ActionIcon
          onClick={() => {
            if (customer) {
              open()
            }
          }}
          radius={"xl"}
        >
          <MdEdit size={20} />
        </ActionIcon>
      )}

      <Modal
        opened={opened}
        onClose={handleClose}
        title={type === "add" ? "Add New" : "Update"}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"xl"}
      >
        <Stack>
          <TextInput
            label="Delivery Address"
            {...register("address", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.address?.message}
            disabled={disabled}
          />
          <TextInput
            label="Company"
            {...register("company", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.company?.message}
            disabled={disabled}
          />

          <TextInput
            label="Contact Person"
            {...register("contact_person", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.contact_person?.message}
            disabled={disabled}
          />

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

const defVals = (): CustomerFormType => ({
  id: null,
  address: null,
  company: null,
  contact_person: null,
  active: 1,
})
