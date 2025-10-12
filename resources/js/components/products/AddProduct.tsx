import {
  ActionIcon,
  Button,
  Checkbox,
  FileButton,
  FileInput,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Stack,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { Controller, SubmitHandler, useForm } from "react-hook-form"
import { ProductFormType } from "../../types/formTypes"
import { useEffect, useMemo, useState } from "react"
import {
  DEF_MSG,
  imageValidation,
  numberValidation,
} from "../../constants/constants"
import { useMenu } from "../../hooks/menu"
import { SelectType } from "../../types"
import { useProduct } from "../../hooks/product"
import { FaCamera } from "react-icons/fa"
import { MdEdit } from "react-icons/md"

interface IProps {
  product?: ProductFormType
  onRefetch?: () => Promise<void>
}

export default function AddProduct({ product, onRefetch }: IProps) {
  const [opened, { open, close }] = useDisclosure(false)
  const [disabled, setDisabled] = useState(false)
  const { addProduct, updateProduct } = useProduct()

  const { productMenu, productMenuLoading } = useMenu({
    enableProductMenu: true,
  })

  const {
    formState: { errors },
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
  } = useForm<ProductFormType>({
    defaultValues: {
      cat_id: null,
      cat_sub_id: null,
      loc_id: null,
      uom_id: null,
      name: "",
      description: "",
      image_original_name: "",
      image_path_name: "",
      barcode: null,
      product_cost: 0,
      selling_price: 0,
      quantity: 0,
      batch_number: 0,
      status: 1,
      image: null,
      item_code: null,
      brand: null,
    },
  })

  const categoryId = watch("cat_id")

  const categoryMenu = useMemo<SelectType[]>(() => {
    if (productMenu && productMenu.categories) {
      return productMenu.categories.map((item) => ({
        value: `${item.id}`,
        label: item.name,
      }))
    }
    return []
  }, [productMenu])

  const categorySubMenu = useMemo<SelectType[]>(() => {
    if (productMenu && categoryId) {
      const tcat = productMenu.categories.find((i) => i.id === categoryId)
      if (tcat && tcat.cat_subs) {
        return tcat.cat_subs.map((item) => ({
          value: `${item.id}`,
          label: item.name,
        }))
      }
    }

    return []
  }, [productMenu, categoryId])

  const locationMenu = useMemo<SelectType[]>(() => {
    if (productMenu && productMenu.locations) {
      return productMenu.locations.map((item) => ({
        value: `${item.id}`,
        label: item.name,
      }))
    }
    return []
  }, [productMenu])

  const uomMenu = useMemo<SelectType[]>(() => {
    if (productMenu && productMenu.uom) {
      return productMenu.uom.map((item) => ({
        value: `${item.id}`,
        label: item.name,
      }))
    }
    return []
  }, [productMenu])

  const onSubmit: SubmitHandler<ProductFormType> = async (data) => {
    setDisabled(true)

    let isSuccess = false
    console.log(data)
    if (product) {
      //update
      isSuccess = await updateProduct(data)
    } else {
      //create
      isSuccess = await addProduct(data)
    }
    if (isSuccess) {
      close()
      reset()
      if (onRefetch) {
        await onRefetch()
      }
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
    if (product) {
      reset(product)
    }
  }, [product])

  return (
    <>
      {!product && (
        <Button
          onClick={open}
          disabled={productMenuLoading}
          loading={productMenuLoading}
        >
          Create
        </Button>
      )}

      {product && (
        <Tooltip label="Edit">
          <ActionIcon
            onClick={open}
            disabled={productMenuLoading}
            loading={productMenuLoading}
            radius={"lg"}
          >
            <MdEdit size={20} />
          </ActionIcon>
        </Tooltip>
      )}

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
            label="Name"
            {...register("name", { required: DEF_MSG.REQUIRED })}
            required
            error={errors.name?.message}
            disabled={disabled}
          />
          <Controller
            control={control}
            name="description"
            render={({ field: { value, onChange } }) => (
              <Textarea
                value={value ? value : ""}
                onChange={onChange}
                label="Description"
                disabled={disabled}
              />
            )}
          />
          <Controller
            control={control}
            name="image"
            rules={imageValidation}
            render={({ field: { value, onChange } }) => (
              <FileInput
                label="Image"
                placeholder="Upload image"
                value={value}
                onChange={onChange}
                accept="image/png,image/jpeg,image/gif"
                error={
                  // errors.image?.message ||
                  errors.image?.type === "isImage" && errors.image.message
                  // (errors.image?.type === "isSizeValid" && errors.image.message)
                }
                disabled={disabled}
                rightSection={
                  <FileButton
                    onChange={onChange}
                    accept="image/png,image/jpeg,image/gif"
                    disabled={disabled}
                    inputProps={{
                      capture: "environment",
                    }}
                  >
                    {(props) => (
                      <ActionIcon {...props}>
                        <FaCamera size={18} />
                      </ActionIcon>
                    )}
                  </FileButton>
                }
              />
            )}
          />
          <SimpleGrid cols={2}>
            <TextInput
              label={`Item Code`}
              placeholder="Enter item code"
              {...register("item_code")}
              disabled={disabled}
            />
            <Controller
              control={control}
              name="barcode"
              rules={{ ...numberValidation }}
              render={({ field: { value, onChange } }) => (
                <TextInput
                  type="number"
                  label="Barcode"
                  //@ts-ignore
                  value={value ? value : null}
                  onChange={(e) => {
                    const v = Number(e.target.value)
                    if (isNaN(v)) {
                      onChange(null)
                    } else {
                      onChange(v)
                    }
                  }}
                  disabled={disabled}
                />
              )}
            />
          </SimpleGrid>

          <SimpleGrid cols={categorySubMenu.length > 0 ? 3 : 2}>
            <Controller
              control={control}
              name="cat_id"
              // rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={categoryMenu}
                  value={value ? `${value}` : null}
                  onChange={(e) => {
                    onChange(Number(e))
                    setValue("cat_sub_id", null)
                  }}
                  label="Category"
                  placeholder="Select category"
                  // required
                  // error={errors.cat_id?.message}
                  allowDeselect={false}
                  disabled={disabled}
                />
              )}
            />
            {categorySubMenu.length > 0 && (
              <Controller
                control={control}
                name="cat_sub_id"
                render={({ field: { value, onChange } }) => (
                  <Select
                    data={categorySubMenu}
                    value={value ? `${value}` : null}
                    onChange={(e) => onChange(Number(e))}
                    label="Sub Category"
                    placeholder="Select sub category"
                    disabled={disabled}
                  />
                )}
              />
            )}
            <TextInput
              label={`Brand`}
              placeholder="Enter brand"
              {...register("brand")}
              disabled={disabled}
            />
          </SimpleGrid>

          <SimpleGrid cols={4}>
            <TextInput
              type="number"
              label={`Batch Number`}
              placeholder="Enter batch number"
              {...register("batch_number", { ...numberValidation })}
              min={0}
              disabled={disabled}
            />
            <TextInput
              type="number"
              label={`Quantity`}
              placeholder="Enter quantity"
              {...register("quantity", { ...numberValidation })}
              min={1}
              disabled={disabled}
            />
            <TextInput
              type="number"
              label={`Product Costs`}
              placeholder="Enter product costs"
              // {...register("product_cost", {
              //   required: DEF_MSG.REQUIRED,
              //   ...numberValidation,
              // })}
              {...register("product_cost")}
              min={0}
              disabled={disabled}
              // required
              // error={errors.product_cost?.message}
            />
            <TextInput
              type="number"
              label={`Selling price`}
              placeholder="Enter selling price"
              // {...register("selling_price", {
              //   required: DEF_MSG.REQUIRED,
              //   ...numberValidation,
              // })}
              {...register("selling_price")}
              min={0}
              disabled={disabled}
              // required
              // error={errors.selling_price?.message}
            />
          </SimpleGrid>

          <SimpleGrid cols={2}>
            <Controller
              control={control}
              name="loc_id"
              render={({ field: { value, onChange } }) => (
                <Select
                  data={locationMenu}
                  value={value ? `${value}` : null}
                  onChange={(e) => onChange(Number(e))}
                  label="Location"
                  placeholder="Select location"
                  disabled={disabled}
                />
              )}
            />
            <Controller
              control={control}
              name="uom_id"
              // rules={{ required: DEF_MSG.REQUIRED }}
              render={({ field: { value, onChange } }) => (
                <Select
                  data={uomMenu}
                  value={value ? `${value}` : null}
                  onChange={(e) => onChange(Number(e))}
                  label="UOM"
                  placeholder="Select unit of measure"
                  // required
                  // error={errors.uom_id?.message}
                  allowDeselect={false}
                  disabled={disabled}
                />
              )}
            />
          </SimpleGrid>
          <Controller
            control={control}
            name="status"
            rules={{ required: DEF_MSG.REQUIRED }}
            render={({ field: { value, onChange } }) => (
              <Checkbox
                checked={value === 1 ? true : false}
                onChange={(e) => onChange(e.target.checked ? 1 : 0)}
                label="Status"
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
