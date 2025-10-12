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
import { useEffect, useState } from "react"
import { DEF_MSG } from "../../../constants/constants"
import { MdEdit } from "react-icons/md"
import { ProductLocationType } from "../../../types"
import { LocationFormType } from "../../../types/formTypes"
import { useLocation } from "../../../hooks/location"

interface IProps {
  location?: ProductLocationType
  type: "add" | "edit"
}
export default function AddEditLocation({ location, type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { addLocation, updateLocation, locationsRefetch } = useLocation()

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<LocationFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<LocationFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (location) {
      //update
      isSuccess = await updateLocation(data)
    } else {
      //create
      isSuccess = await addLocation(data)
    }
    if (isSuccess) {
      await locationsRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  useEffect(() => {
    if (location) {
      reset(location)
    }
  }, [location])

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
            if (location) {
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
      >
        <Stack>
          <TextInput
            label="Name"
            {...register("name", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.name?.message}
          />

          <TextInput label="Description" {...register("description")} />

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

const defVals = (): LocationFormType => ({
  id: null,
  name: null,
  description: null,
  active: 1,
})
