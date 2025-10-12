import {
  Button,
  Center,
  FileInput,
  Group,
  Image,
  Modal,
  Radio,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { ReceiveProductForm } from "../../types/formTypes"
import { useMemo, useState } from "react"
import {
  DEF_MSG,
  imageValidationRequired,
  numberValidation,
  quantityValidation,
} from "../../constants/constants"
import { useMenu } from "../../hooks/menu"
import { SelectType } from "../../types"
import { useProduct } from "../../hooks/product"
import { useProducts } from "../../hooks/products"
import { DateInput } from "@mantine/dates"

export default function ReceiveProduct() {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const [rgroup, setRGroup] = useState<"pay_cash" | "payable">("pay_cash")
  const { receiveProduct } = useProduct()
  const { productsRefetch } = useProducts()

  const { productListMenu, productListMenuLoading } = useMenu({
    enableProductListMenu: true,
  })

  const productMenu = useMemo<SelectType[]>(() => {
    if (productListMenu && productListMenu.products) {
      return productListMenu.products.map((item) => ({
        value: `${item.id}`,
        label: item.name,
      }))
    }
    return []
  }, [productListMenu])

  const supplierMenu = useMemo<SelectType[]>(() => {
    if (productListMenu && productListMenu.suppliers) {
      return productListMenu.suppliers.map((item) => ({
        value: `${item.id}`,
        label: item.company,
      }))
    }
    return []
  }, [productListMenu])

  const userMenu = useMemo<SelectType[]>(() => {
    if (productListMenu && productListMenu.users) {
      return productListMenu.users.map((item) => ({
        value: `${item.id}`,
        label: item.name,
      }))
    }
    return []
  }, [productListMenu])

  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<ReceiveProductForm>({
    defaultValues: {
      product_id: null,
      supplier_id: null,
      delivery_receipt: "",
      product_cost: 0,
      quantity: 0,
      received_by_id: null,
      image: null,
      amount: 0,
      payable_date: null,
    },
  })

  const drImage = watch("image")

  const onSubmit: SubmitHandler<ReceiveProductForm> = async (data) => {
    setDisabled(true)

    let isSuccess = await receiveProduct(data)
    if (isSuccess) {
      close()
      reset()
      await productsRefetch()
    }

    setDisabled(false)
  }

  const handleClose = () => {
    if (!disabled) {
      close()
      reset()
    }
  }

  return (
    <>
      <Button
        onClick={open}
        disabled={productListMenuLoading}
        loading={productListMenuLoading}
      >
        Receive
      </Button>

      <Modal
        opened={opened}
        onClose={handleClose}
        title={`Add New Product`}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        size={"xl"}
      >
        <Stack>
          <TextInput
            label="Delivery Receipt/Invoice Number"
            {...register("delivery_receipt", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.delivery_receipt?.message}
            disabled={disabled}
          />
          <Controller
            control={control}
            name="image"
            rules={imageValidationRequired}
            render={({ field: { value, onChange } }) => (
              <FileInput
                label="DR Image"
                placeholder="Upload image"
                value={value}
                onChange={onChange}
                accept="image/png,image/jpeg,image/gif"
                required
                error={
                  errors.image?.message ||
                  (errors.image?.type === "isImage" && errors.image.message) ||
                  (errors.image?.type === "isSizeValid" && errors.image.message)
                }
                disabled={disabled}
              />
            )}
          />

          {drImage && (
            <Center>
              <Image src={URL.createObjectURL(drImage)} w={200} />
            </Center>
          )}

          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="product_id"
              rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={productMenu}
                  value={value ? `${value}` : null}
                  onChange={(e) => onChange(Number(e))}
                  label="Product"
                  placeholder="Select product"
                  required
                  error={errors.product_id?.message}
                  allowDeselect={false}
                  disabled={disabled}
                />
              )}
            />
            <Controller
              control={control}
              name="supplier_id"
              rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={supplierMenu}
                  value={value ? `${value}` : null}
                  onChange={(e) => onChange(Number(e))}
                  label="Supplier"
                  placeholder="Select supplier"
                  required
                  error={errors.supplier_id?.message}
                  allowDeselect={false}
                  disabled={disabled}
                />
              )}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <TextInput
              type="number"
              label={`Product Cost`}
              placeholder="Enter product cost"
              {...register("product_cost", {
                required: DEF_MSG.REQUIRED,
                ...numberValidation,
              })}
              min={0}
              disabled={disabled}
              required
              error={errors.product_cost?.message}
            />
            <TextInput
              type="number"
              label={`Quantity`}
              placeholder="Enter quantity"
              {...register("quantity", {
                required: DEF_MSG.REQUIRED,
                ...quantityValidation,
              })}
              min={1}
              disabled={disabled}
              required
              error={errors.quantity?.message}
            />
          </SimpleGrid>

          <Radio.Group
            value={rgroup}
            onChange={(e) => {
              //@ts-ignore
              setRGroup(e)
              if (e === "payable") {
                setValue("amount", null)
              } else {
                setValue("payable_date", null)
              }
            }}
          >
            <Group>
              <Radio value="payable" label="Payable" disabled={disabled} />
              <Radio value="pay_cash" label="Pay Cash" disabled={disabled} />
            </Group>
          </Radio.Group>

          {rgroup === "pay_cash" && (
            <TextInput
              type="number"
              label={`Amount`}
              placeholder="Enter amount"
              {...register("amount", {
                required: DEF_MSG.REQUIRED,
                ...numberValidation,
              })}
              min={0}
              disabled={disabled}
              required
              error={errors.amount?.message}
            />
          )}
          {rgroup === "payable" && (
            <Controller
              control={control}
              name="payable_date"
              render={({ field: { value, onChange } }) => (
                <DateInput
                  label={`Payable date`}
                  value={value ? new Date(value) : value}
                  onChange={onChange}
                  placeholder="Enter payable date"
                  minDate={new Date()}
                  disabled={disabled}
                  required
                  error={errors.payable_date?.message}
                />
              )}
            />
          )}

          <Controller
            control={control}
            name="received_by_id"
            rules={{ required: DEF_MSG.REQUIRED }}
            render={({ field: { value, onChange } }) => (
              <Select
                data={userMenu}
                value={value ? `${value}` : null}
                onChange={(e) => onChange(Number(e))}
                label="Received by"
                placeholder="Select user"
                required
                error={errors.received_by_id?.message}
                allowDeselect={false}
                disabled={disabled}
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
              Submit
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
