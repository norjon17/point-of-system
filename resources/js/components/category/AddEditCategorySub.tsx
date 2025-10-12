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
import { CategorySubFormType } from "../../types/formTypes"
import { useEffect, useState } from "react"
import { DEF_MSG, QUERY_NAME } from "../../constants/constants"
import { ProductCategorySybType } from "../../types"
import { MdEdit } from "react-icons/md"
import { CatSubFilterType, useCategorySub } from "../../hooks/category_subs"
import { useQueryClient } from "@tanstack/react-query"

interface IProps {
  cat_id: number
  category?: ProductCategorySybType
  type: "add" | "edit"
  filterData: CatSubFilterType
}
export default function AddEditCategorySub({
  cat_id,
  category,
  type,
  filterData,
}: IProps) {
  const defVals = (): CategorySubFormType => ({
    id: null,
    cat_id,
    name: null,
    description: "",
    active: 1,
  })

  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { addCategory, updateCategory } = useCategorySub({
    cat_id,
  })

  const queryClient = useQueryClient()

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
    setValue,
  } = useForm<CategorySubFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<CategorySubFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (category) {
      //update
      isSuccess = await updateCategory(data)
    } else {
      //create
      isSuccess = await addCategory(data)
    }

    if (isSuccess) {
      await queryClient.refetchQueries({
        queryKey: [`${QUERY_NAME.CATEGORY_SUBS}-all`, { ...filterData }],
      })
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
    if (category) {
      reset({ ...category, cat_id })
    } else {
      setValue("cat_id", cat_id)
    }
  }, [category])

  return (
    <>
      {type === "add" && <Button onClick={open}>Create</Button>}

      {type === "edit" && (
        <ActionIcon
          onClick={() => {
            if (category) {
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
            label="Name"
            {...register("name", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.name?.message}
            disabled={disabled}
          />
          <TextInput
            label="Description"
            {...register("description")}
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
