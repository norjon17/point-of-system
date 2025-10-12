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
import { SupplierFormType } from "../../types/formTypes"
import { useEffect, useState } from "react"
import { DEF_MSG } from "../../constants/constants"
import { useSupplier } from "../../hooks/suppliers"
import { SupplierType } from "../../types"
import { MdEdit } from "react-icons/md"

interface IProps {
  supplier?: SupplierType
  type: "add" | "edit"
}
export default function AddEditSupplier({ supplier, type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const {
    addSupplier: addSupplier,
    suppliersRefetch,
    updateSupplier,
  } = useSupplier()

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<SupplierFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<SupplierFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (supplier) {
      //update
      isSuccess = await updateSupplier(data)
    } else {
      //create
      isSuccess = await addSupplier(data)
    }
    if (isSuccess) {
      await suppliersRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  useEffect(() => {
    if (supplier) {
      reset(supplier)
    }
  }, [supplier])

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
  }

  return (
    <>
      {type === "add" && (
        <Button
          onClick={open}
          // disabled={supplierMenuLoading}
          // loading={supplierMenuLoading}
        >
          Create
        </Button>
      )}

      {type === "edit" && (
        <ActionIcon
          onClick={() => {
            if (supplier) {
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
            label="Company"
            {...register("company", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.company?.message}
          />

          <TextInput
            label="Contact Person"
            {...register("contact_person", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.contact_person?.message}
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

const defVals = (): SupplierFormType => ({
  id: null,
  address: null,
  company: null,
  contact_person: null,
  active: 1,
})
