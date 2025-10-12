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
import { ProductUOMType } from "../../../types"
import { useUOM } from "../../../hooks/uom"
import { UOMFormType } from "../../../types/formTypes"

interface IProps {
  uom?: ProductUOMType
  type: "add" | "edit"
}
export default function AddEditUOM({ uom, type }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { addUOM, updateUOM, uomsRefetch } = useUOM()

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<UOMFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<UOMFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (uom) {
      //update
      isSuccess = await updateUOM(data)
    } else {
      //create
      isSuccess = await addUOM(data)
    }
    if (isSuccess) {
      await uomsRefetch()
      handleClose()
    }

    setDisabled(false)
  }

  useEffect(() => {
    if (uom) {
      reset(uom)
    }
  }, [uom])

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
            if (uom) {
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

          <TextInput
            label="Abbreviation"
            {...register("abbr", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.abbr?.message}
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

const defVals = (): UOMFormType => ({
  id: null,
  name: null,
  abbr: null,
  active: 1,
})
