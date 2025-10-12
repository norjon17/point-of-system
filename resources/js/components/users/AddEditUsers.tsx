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
import { UserFormType } from "../../types/formTypes"
import { useEffect, useState } from "react"
import { DEF_MSG } from "../../constants/constants"
import { useUsers } from "../../hooks/users"
import { UserType } from "../../types"
import { MdEdit } from "react-icons/md"

interface IProps {
  type: "add" | "edit"
  user?: UserType
}

export default function AddEditUser({ type, user }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)

  const { usersRefetch } = useUsers()
  // const { usersMenu, usersMenuLoading } = useMenu({
  //   enableUsersMenu: true,
  // })

  const { addUser, updateUser } = useUsers()

  // const accessMenu = useMemo(() => {
  //   if (usersMenu && usersMenu.accesses) {
  //     return usersMenu.accesses.map((i) => ({
  //       label: i.access,
  //       value: `${i.id}`,
  //     }))
  //   }
  //   return []
  // }, [usersMenu])

  const {
    formState: { errors },
    register,
    handleSubmit,
    reset,
    control,
  } = useForm<UserFormType>({
    defaultValues: defVals(),
  })

  const onSubmit: SubmitHandler<UserFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    if (user) {
      //update
      isSuccess = await updateUser(data)
    } else {
      //create
      isSuccess = await addUser(data)
    }

    if (isSuccess) {
      await usersRefetch()
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
    if (user) {
      reset(user)
    }
  }, [user])

  return (
    <>
      {type === "add" && (
        <Button
          // disabled={usersMenuLoading}
          onClick={open}
        >
          Add User
        </Button>
      )}
      {type === "edit" && (
        <ActionIcon
          // disabled={usersMenuLoading}
          onClick={() => {
            if (user) {
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
        size={"md"}
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
            label="Username"
            {...register("username", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.username?.message}
            disabled={disabled}
          />

          <TextInput
            type="password"
            label="Password"
            {...register("password", {
              required: type === "add" ? DEF_MSG.REQUIRED : undefined,
            })}
            required={type === "add" ? true : false}
            error={type === "add" ? errors.password?.message : undefined}
            disabled={disabled}
          />

          {/* <Controller
            control={control}
            name="access_id"
            rules={{ required: DEF_MSG.REQUIRED }}
            render={({ field: { value, onChange } }) => (
              <Select
                data={accessMenu}
                value={value ? `${value}` : null}
                label="Role"
                onChange={(e) => onChange(Number(e))}
                placeholder="Select user role"
                allowDeselect={false}
                required
                error={errors.access_id?.message}
                disabled={disabled}
              />
            )}
          /> */}
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

const defVals = () => ({
  id: null,
  name: "",
  username: "",
  password: "",
  access_id: null,
  active: 1,
})
