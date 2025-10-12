import {
  ActionIcon,
  Button,
  CloseIcon,
  Group,
  Paper,
  Select,
  Table,
  TextInput,
  Tooltip,
} from "@mantine/core"
import { Controller, UseFieldArrayReturn, UseFormReturn } from "react-hook-form"
import { POSFormType, POSOrderType } from "../../types/formTypes"
import { DEF_MSG } from "../../constants/constants"
import { useMenu } from "../../hooks/menu"
import { SelectType } from "../../types"
import { useEffect, useMemo, useRef, useState } from "react"
import { FaMinus, FaPlus } from "react-icons/fa6"
import { MdDelete } from "react-icons/md"
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas"
import { useDebouncedCallback } from "@mantine/hooks"
import { useProducts } from "../../hooks/products"
import css from "../styles/barcode.module.scss"
import { removeWhiteSpace } from "../../utils/string/removeWhiteSpace"
import { CiSearch } from "react-icons/ci"

interface IProps {
  posForm: UseFormReturn<POSFormType, any, POSFormType>
  ordersField: UseFieldArrayReturn<POSFormType, "orders", "id">
}
export default function SalesCustomerOrders({ posForm, ordersField }: IProps) {
  const { posMenu, posMenuLoading } = useMenu({ enablePOSMenu: true })

  const [barcodeSearch, setBarcodeSearch] = useState("")
  const [barcodeSearchT, setBarcodeSearchT] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef(null)
  const { productsBC, productsBCRefetchLoading } = useProducts({
    enableBarcodeProd: true,
    barcodeSearch: barcodeSearchT,
  })

  const customerMenu = useMemo<SelectType[]>(() => {
    if (posMenu && posMenu.customers) {
      return posMenu.customers.map((item) => ({
        label: item.company,
        value: `${item.id}`,
      }))
    }

    return []
  }, [posMenu])

  const orderType = posForm.watch("order_type")
  const customerId = posForm.watch("customer_id")
  useEffect(() => {
    if (customerId && posMenu) {
      if (orderType === "pickup") {
        posForm.setValue("address", null)
        posForm.setValue("delivery_fee", null)
      } else {
        const customer = posMenu.customers.find((i) => i.id === customerId)
        if (customer) {
          posForm.setValue("address", customer.address)
        }
        // posForm.setValue("delivery_fee", null)
      }
    }
  }, [orderType, customerId, posMenu])

  const handleSearch = useDebouncedCallback((value: string) => {
    setBarcodeSearchT(value)
  }, 500)

  useEffect(() => {
    if (barcodeSearch.trim() !== "") {
      setShowDropdown(true)
      setBarcodeSearchT(barcodeSearch)
    } else {
      setShowDropdown(false)
    }
  }, [barcodeSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: any) {
      //@ts-ignore
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleBarSelect = (item: POSOrderType) => {
    console.log(item)
    console.log(ordersField.fields)
    const ordered = ordersField.fields
      .map((item, index) => ({ ...item, index })) // First add index to each item
      .find((i) => i.product_id === Number(item.id)) // Then filter

    if (ordered) {
      const qty = ordered.quantity + 1
      //update
      let total = item.selling_price * qty
      let discount = ordered.discount
      // Fallback to 1 if user clears input or types 0 or invalid number
      if (!discount || discount < 1) discount = 0

      total = total - discount

      ordersField.update(ordered.index!, {
        ...ordered,
        quantity: qty,
        total,
      })
    } else {
      //insert new
      ordersField.append({
        name: item.name,
        quantity: 1,
        product_id: Number(item.id),
        discount: null,
        selling_price: item.selling_price,
        total: item.selling_price,
      })
    }
  }

  return (
    <Paper shadow="xs" p="xs">
      <Group>
        <div className={css.wrapper} ref={wrapperRef}>
          <TextInput
            label="Scan barcode"
            placeholder="scan barcode"
            value={barcodeSearch}
            onChange={(e) => {
              setBarcodeSearch(e.target.value)
              handleSearch(e.target.value)
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && productsBC && productsBC.length > 0) {
                handleBarSelect(productsBC[0])
                setBarcodeSearch("")
                handleSearch("")
                setShowDropdown(false)
              }
            }}
            rightSection={
              removeWhiteSpace(barcodeSearchT).length === 0 ? (
                <CiSearch />
              ) : (
                <Tooltip label="Clear">
                  <ActionIcon
                    onClick={() => {
                      setBarcodeSearch("")
                      handleSearch("")
                    }}
                    variant="subtle"
                  >
                    <CloseIcon />
                  </ActionIcon>
                </Tooltip>
              )
            }
          />
          {showDropdown && (
            <div className={css.dropdown}>
              {productsBCRefetchLoading && (
                <div className={css.item}>Loading...</div>
              )}
              {!productsBCRefetchLoading && productsBC?.length === 0 && (
                <div className={css.noResult}>No data</div>
              )}
              {!productsBCRefetchLoading &&
                productsBC?.map((item) => (
                  <div
                    className={css.item}
                    key={item.id}
                    onClick={() => {
                      handleBarSelect(item)
                      setBarcodeSearch("")
                      handleSearch("")
                      setShowDropdown(false)
                    }}
                  >
                    {item.name}
                  </div>
                ))}
            </div>
          )}
        </div>

        <Controller
          control={posForm.control}
          name="customer_id"
          rules={{ required: DEF_MSG.REQUIRED }}
          render={({ field: { value, onChange } }) => (
            <Select
              data={customerMenu}
              value={value ? `${value}` : null}
              onChange={(e) => onChange(Number(e))}
              label="Customer"
              placeholder="Select customer"
              required
              error={posForm.formState.errors.customer_id?.message}
              flex={1}
              disabled={posMenuLoading}
              searchable
              clearable
            />
          )}
        />
      </Group>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Product</Table.Th>
            <Table.Th>Qty</Table.Th>
            <Table.Th>Discount</Table.Th>
            <Table.Th>Price</Table.Th>
            <Table.Th>Total</Table.Th>
            <Table.Th>Action</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {ordersField.fields.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td>{item.name}</Table.Td>
              <Table.Td>
                <Button.Group>
                  <Button
                    variant="default"
                    radius="md"
                    onClick={() => {
                      const qty = item.quantity - 1
                      if (qty > 0) {
                        let total = item.selling_price * qty

                        let discount = Number(item.discount)

                        // Fallback to 1 if user clears input or types 0 or invalid number
                        if (!discount || discount < 1) discount = 0

                        total = total - discount

                        ordersField.update(index, {
                          ...item,
                          quantity: qty,
                          total,
                        })
                      }
                    }}
                  >
                    <FaMinus size={20} color="var(--mantine-color-red-text)" />
                  </Button>
                  <TextInput
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      let value = Number(e.target.value)

                      // Fallback to 1 if user clears input or types 0 or invalid number
                      if (!value || value < 1) value = 1

                      let total = item.selling_price * value

                      let discount = Number(item.discount)

                      // Fallback to 1 if user clears input or types 0 or invalid number
                      if (!discount || discount < 1) discount = 0

                      total = total - discount

                      ordersField.update(index, {
                        ...item,
                        quantity: value,
                        total,
                      })
                    }}
                    radius={"none"}
                    styles={{
                      input: {
                        textAlign: "right",
                      },
                    }}
                    min={1}
                    w={50}
                  />
                  <Button
                    variant="default"
                    radius="md"
                    onClick={() => {
                      const qty = item.quantity + 1
                      let total = item.selling_price * qty

                      let discount = Number(item.discount)

                      // Fallback to 1 if user clears input or types 0 or invalid number
                      if (!discount || discount < 1) discount = 0

                      total = total - discount

                      ordersField.update(index, {
                        ...item,
                        quantity: qty,
                        total,
                      })
                    }}
                  >
                    <FaPlus size={20} color="var(--mantine-color-teal-text)" />
                  </Button>
                </Button.Group>
              </Table.Td>
              <Table.Td>
                <TextInput
                  type="number"
                  //@ts-ignore
                  value={item.discount ?? null}
                  onChange={(e) => {
                    let value = Number(e.target.value)

                    let total = item.selling_price * item.quantity

                    // Fallback to 1 if user clears input or types 0 or invalid number
                    if (!value || value < 1) value = 0

                    total = total - value

                    ordersField.update(index, {
                      ...item,
                      discount: value,
                      total,
                    })
                  }}
                  styles={{
                    input: {
                      textAlign: "right",
                    },
                  }}
                  min={0}
                />
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {formatNumberWithCommas(item.selling_price)}
              </Table.Td>
              <Table.Td style={{ textAlign: "right" }}>
                {formatNumberWithCommas(item.total)}
              </Table.Td>
              <Table.Td>
                <ActionIcon
                  color="red"
                  onClick={() => {
                    ordersField.remove(index)
                  }}
                >
                  <MdDelete size={18} />
                </ActionIcon>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  )
}
