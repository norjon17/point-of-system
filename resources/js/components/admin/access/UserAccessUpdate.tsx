import {
  ActionIcon,
  Box,
  Button,
  Center,
  Checkbox,
  Drawer,
  Fieldset,
  Group,
  Loader,
  LoadingOverlay,
  Stack,
  Tooltip,
} from "@mantine/core"
import { UserType } from "../../../types"
import { HiKey } from "react-icons/hi"
import { useDisclosure } from "@mantine/hooks"
import { useAccess } from "../../../hooks/access"
import { nanoid } from "nanoid"
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
} from "react-hook-form"
import { AccessGroupFormType } from "../../../types/formTypes"
import { useEffect, useState } from "react"
import "./drawer.scss"

interface IProps {
  user: UserType
}
export default function UserAccessUpdate({ user }: IProps) {
  const [disabled, setDisabled] = useState(false)
  const [opened, { open, close }] = useDisclosure(false)

  const { accesses, accessesLoading, accessesRefetch, updateAccess } =
    useAccess({
      enableAccess: opened,
      user_id: user.id,
    })

  const { control, handleSubmit } = useForm<AccessGroupFormType>({
    defaultValues: { accesses: [] },
  })

  const accessesField = useFieldArray({
    control: control,
    name: "accesses",
  })

  const onSubmit: SubmitHandler<AccessGroupFormType> = async (data) => {
    setDisabled(true)
    await updateAccess(data)
    await accessesRefetch()
    setDisabled(false)
  }

  useEffect(() => {
    if (
      accesses &&
      !accessesLoading &&
      user &&
      accessesField.fields.length === 0
    ) {
      accesses.forEach((item) => {
        if (item.user_access) {
          accessesField.append({ ...item.user_access })
        } else {
          accessesField.append({
            id: null,
            user_id: user.id!,
            module_id: item.id,
            create: 0,
            read: 0,
            update: 0,
            delete: 0,
          })
        }
      })
    }
  }, [user, accessesLoading, accesses])

  const moduleName = (id: number) => {
    const name = accesses?.find((i) => i.id === id)
    return name?.description ?? ""
  }

  return (
    <>
      <Tooltip label="Access Update">
        <ActionIcon
          color="green"
          onClick={() => {
            open()
          }}
          radius={"lg"}
          loading={accessesLoading}
        >
          <HiKey size={18} />
        </ActionIcon>
      </Tooltip>

      <Drawer
        opened={opened}
        onClose={close}
        title={`Access for ${user.name}`}
        overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        position="right"
        size={"lg"}
      >
        {accessesLoading && (
          <Center>
            <Loader />
          </Center>
        )}
        {!accessesLoading && accesses && (
          <Box pos="relative">
            <Stack pos={"relative"} pl={20} pb={30} pr={20}>
              <LoadingOverlay
                visible={disabled}
                zIndex={1000}
                overlayProps={{ radius: "sm", blur: 2 }}
                loaderProps={{ color: "pink", type: "bars" }}
              />
              {accessesField.fields.map((item, index) => (
                <Fieldset legend={moduleName(item.module_id)} key={nanoid()}>
                  <Group>
                    <Controller
                      control={control}
                      name={`accesses.${index}.create`}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          label="Create"
                          checked={value === 1 ? true : false}
                          onChange={(e) => {
                            onChange(e.target.checked ? 1 : 0)
                          }}
                        />
                      )}
                    />{" "}
                    <Controller
                      control={control}
                      name={`accesses.${index}.read`}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          label="Read"
                          checked={value === 1 ? true : false}
                          onChange={(e) => {
                            onChange(e.target.checked ? 1 : 0)
                          }}
                        />
                      )}
                    />{" "}
                    <Controller
                      control={control}
                      name={`accesses.${index}.update`}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          label="Update"
                          checked={value === 1 ? true : false}
                          onChange={(e) => {
                            onChange(e.target.checked ? 1 : 0)
                          }}
                        />
                      )}
                    />{" "}
                    <Controller
                      control={control}
                      name={`accesses.${index}.delete`}
                      render={({ field: { value, onChange } }) => (
                        <Checkbox
                          label="Delete"
                          checked={value === 1 ? true : false}
                          onChange={(e) => {
                            onChange(e.target.checked ? 1 : 0)
                          }}
                        />
                      )}
                    />
                  </Group>
                </Fieldset>
              ))}
            </Stack>

            <Group
              justify="flex-end"
              pos={"sticky"}
              bottom={0}
              left={0}
              style={{
                background: "white",
                boxShadow: "0 -4px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              <Box p={10}>
                <Button
                  onClick={() => {
                    handleSubmit(onSubmit)()
                  }}
                >
                  Apply
                </Button>
              </Box>
            </Group>
          </Box>
        )}
      </Drawer>
    </>
  )
}
