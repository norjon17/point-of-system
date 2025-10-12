import { useDisclosure } from "@mantine/hooks"
import { SalesType, SelectType } from "../../types"
import { useEffect, useMemo, useState } from "react"
import {
  Button,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
} from "@mantine/core"
import { useMenu } from "../../hooks/menu"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { DeliverUpdateFormType } from "../../types/formTypes"
import { DEF_MSG } from "../../constants/constants"
import { DateInput } from "@mantine/dates"
import { useSale } from "../../hooks/sale"
import { useSales } from "../../hooks/sales"

interface IProps {
  selectedSale: SalesType | null
  setSelectedSale: React.Dispatch<React.SetStateAction<SalesType | null>>
}
export default function SalesDeliveryEdit({
  selectedSale,
  setSelectedSale,
}: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { updateDeliveryStatus } = useSale()
  const { transactionsRefetch } = useSales()

  const { deliveryMenu, deliveryMenuLoading } = useMenu({
    enableDeliveryMenu: true,
  })

  const usersMenu = useMemo<SelectType[]>(() => {
    if (deliveryMenu && deliveryMenu.users) {
      return deliveryMenu.users.map((i) => ({
        label: i.name,
        value: `${i.id}`,
      }))
    }
    return []
  }, [deliveryMenu])

  const vehicleMenu = useMemo<SelectType[]>(() => {
    if (deliveryMenu && deliveryMenu.vehicles) {
      return deliveryMenu.vehicles.map((i) => ({
        label: i.plate_num,
        value: `${i.id}`,
      }))
    }
    return []
  }, [deliveryMenu])
  const deliveryStatusMenu = useMemo<SelectType[]>(() => {
    if (deliveryMenu && deliveryMenu.delivery_statuses) {
      return deliveryMenu.delivery_statuses.map((i) => ({
        label: i.name,
        value: `${i.id}`,
      }))
    }
    return []
  }, [deliveryMenu])

  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
  } = useForm<DeliverUpdateFormType>({
    defaultValues: defValues(),
  })

  const onSubmit: SubmitHandler<DeliverUpdateFormType> = async (data) => {
    setDisabled(true)
    let isSuccess = false
    if (selectedSale) {
      isSuccess = await updateDeliveryStatus(data, selectedSale.id)
    }
    if (isSuccess) {
      await transactionsRefetch()
      handleClose()
    }
    setDisabled(false)
  }

  useEffect(() => {
    if (selectedSale) {
      reset({
        address: selectedSale.address,
        delivered_by_id: selectedSale.delivered_by_id,
        vehicle_id: selectedSale.vehicle_id,
        received_by: selectedSale.received_by,
        departed: selectedSale.departed
          ? new Date(selectedSale.departed)
          : null,
        returned: selectedSale.returned
          ? new Date(selectedSale.returned)
          : null,
        delivery_status_id: selectedSale.delivery_status_id,
      })
      open()
    } else {
      handleClose()
    }
  }, [selectedSale])

  const handleClose = () => {
    if (!disabled) {
      close()
      setSelectedSale(null)
      reset(defValues())
    }
  }

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title="Update Delivery Status"
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"lg"}
      >
        <Stack>
          <SimpleGrid cols={{ xs: 1, sm: 2 }}>
            <Controller
              control={control}
              name="address"
              rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Textarea
                  value={value}
                  onChange={onChange}
                  label="Address"
                  placeholder="Enter address"
                  required
                  error={errors.address?.message}
                  disabled={disabled}
                />
              )}
            />
            <Controller
              control={control}
              name="delivered_by_id"
              rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={usersMenu}
                  label="Delivered by"
                  placeholder="Select user"
                  value={value ? `${value}` : null}
                  onChange={(e) => {
                    onChange(Number(e))
                  }}
                  required
                  error={errors.delivered_by_id?.message}
                  disabled={deliveryMenuLoading || disabled}
                />
              )}
            />
            <TextInput
              label="Received by"
              {...register("received_by")}
              placeholder="Enter name of the receiver"
              disabled={disabled}
            />
            <Controller
              control={control}
              name="vehicle_id"
              rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={vehicleMenu}
                  label="Vehicle"
                  placeholder="Select vehicle"
                  value={value ? `${value}` : null}
                  onChange={(e) => {
                    onChange(Number(e))
                  }}
                  required
                  error={errors.vehicle_id?.message}
                  disabled={deliveryMenuLoading || disabled}
                />
              )}
            />
            <Controller
              control={control}
              name="departed"
              render={({ field: { value, onChange } }) => (
                <DateInput
                  label="Departed Date"
                  placeholder="Enter departed date"
                  value={value ? new Date(value) : null}
                  onChange={onChange}
                  disabled={disabled}
                />
              )}
            />
            <Controller
              control={control}
              name="returned"
              render={({ field: { value, onChange } }) => (
                <DateInput
                  label="Returned Date"
                  placeholder="Enter returned date"
                  value={value ? new Date(value) : null}
                  onChange={onChange}
                  disabled={disabled || !watch("departed")}
                  minDate={watch("departed") ?? undefined}
                />
              )}
            />
            <Controller
              control={control}
              name="delivery_status_id"
              render={({ field: { value, onChange } }) => (
                <Select
                  data={deliveryStatusMenu}
                  label="Delivery Status"
                  placeholder="Select delivery status"
                  value={value ? `${value}` : null}
                  onChange={(e) => {
                    onChange(Number(e))
                  }}
                  disabled={deliveryMenuLoading || disabled}
                />
              )}
            />
          </SimpleGrid>
          <Group justify="flex-end">
            <Button
              type="button"
              onClick={() => {
                handleSubmit(onSubmit)()
              }}
              disabled={disabled}
              loading={disabled}
            >
              Update
            </Button>
            <Button
              type="button"
              onClick={() => {
                handleClose()
              }}
              disabled={disabled}
              loading={disabled}
              variant="outline"
            >
              Cancel
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  )
}

const defValues = (): DeliverUpdateFormType => ({
  address: "",
  delivered_by_id: null,
  vehicle_id: null,
  received_by: null,
  departed: null,
  returned: null,
  delivery_status_id: null,
})
