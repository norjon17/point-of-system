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
    Stack,
    Grid,
    Badge,
    SimpleGrid,
} from "@mantine/core";
import {
    Controller,
    UseFieldArrayReturn,
    UseFormReturn,
} from "react-hook-form";
import { POSFormType, POSOrderType } from "../../types/formTypes";
import { DEF_MSG } from "../../constants/constants";
import { useMenu } from "../../hooks/menu";
import { SelectType } from "../../types";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { useDebouncedCallback } from "@mantine/hooks";
import { useProducts } from "../../hooks/products";
import css from "../styles/barcode.module.scss";
import { removeWhiteSpace } from "../../utils/string/removeWhiteSpace";
import { CiSearch } from "react-icons/ci";
import { useMedia } from "../../hooks/media";

interface IProps {
    posForm: UseFormReturn<POSFormType, any, POSFormType>;
    ordersField: UseFieldArrayReturn<POSFormType, "orders", "id">;
}

export default function SalesCustomerOrders({ posForm, ordersField }: IProps) {
    const { posMenu, posMenuLoading } = useMenu({ enablePOSMenu: true });
    const { mediaMinSM } = useMedia();

    useEffect(() => {
        if (mediaMinSM) {
            console.log("true min md");
        } else {
            console.log("false min md");
        }
    }, [mediaMinSM]);

    const [barcodeSearch, setBarcodeSearch] = useState("");
    const [barcodeSearchT, setBarcodeSearchT] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const wrapperRef = useRef(null);
    const { productsBC, productsBCRefetchLoading } = useProducts({
        enableBarcodeProd: true,
        barcodeSearch: barcodeSearchT,
    });

    const customerMenu = useMemo<SelectType[]>(() => {
        if (posMenu && posMenu.customers) {
            return posMenu.customers.map((item) => ({
                label: item.company,
                value: `${item.id}`,
            }));
        }
        return [];
    }, [posMenu]);

    const orderType = posForm.watch("order_type");
    const customerId = posForm.watch("customer_id");

    useEffect(() => {
        if (customerId && posMenu) {
            if (orderType === "pickup") {
                posForm.setValue("address", null);
                posForm.setValue("delivery_fee", null);
            } else {
                const customer = posMenu.customers.find(
                    (i) => i.id === customerId,
                );
                if (customer) {
                    posForm.setValue("address", customer.address);
                }
            }
        }
    }, [orderType, customerId, posMenu]);

    const handleSearch = useDebouncedCallback((value: string) => {
        setBarcodeSearchT(value);
    }, 500);

    useEffect(() => {
        if (barcodeSearch.trim() !== "") {
            setShowDropdown(true);
            setBarcodeSearchT(barcodeSearch);
        } else {
            setShowDropdown(false);
        }
    }, [barcodeSearch]);

    useEffect(() => {
        function handleClickOutside(event: any) {
            //@ts-ignore
            if (
                wrapperRef.current &&
                //@ts-ignore
                !wrapperRef.current.contains(event.target)
            ) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleBarSelect = (item: POSOrderType) => {
        const ordered = ordersField.fields
            .map((item, index) => ({ ...item, index }))
            .find((i) => i.product_id === Number(item.id));

        if (ordered) {
            const qty = ordered.quantity + 1;
            let total = item.selling_price * qty;
            let discount = ordered.discount;
            if (!discount || discount < 1) discount = 0;
            total = total - discount;

            ordersField.update(ordered.index!, {
                ...ordered,
                quantity: qty,
                total,
            });
        } else {
            ordersField.append({
                name: item.name,
                quantity: 1,
                product_id: Number(item.id),
                discount: null,
                selling_price: item.selling_price,
                total: item.selling_price,
            });
        }
        setBarcodeSearch("");
        handleSearch("");
        setShowDropdown(false);
    };

    const updateQuantity = (index: number, qty: number) => {
        const item = ordersField.fields[index];
        if (qty > 0) {
            let total = item.selling_price * qty;
            let discount = Number(item.discount);
            if (!discount || discount < 1) discount = 0;
            total = total - discount;

            ordersField.update(index, {
                ...item,
                quantity: qty,
                total,
            });
        }
    };

    const updateDiscount = (index: number, value: number) => {
        const item = ordersField.fields[index];
        let discount = value;
        if (!discount || discount < 1) discount = 0;

        let total = item.selling_price * item.quantity - discount;

        ordersField.update(index, {
            ...item,
            discount,
            total,
        });
    };

    return (
        <Paper shadow="xs" p="xs">
            <Stack gap="md">
                <SimpleGrid cols={{ sm: 1, md: 2 }}>
                    <div className={css.wrapper} ref={wrapperRef}>
                        <TextInput
                            label="Scan barcode"
                            placeholder="scan barcode"
                            value={barcodeSearch}
                            onChange={(e) => {
                                setBarcodeSearch(e.target.value);
                                handleSearch(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (
                                    e.key === "Enter" &&
                                    productsBC &&
                                    productsBC.length > 0
                                ) {
                                    handleBarSelect(productsBC[0]);
                                }
                            }}
                            rightSection={
                                removeWhiteSpace(barcodeSearchT).length ===
                                0 ? (
                                    <CiSearch />
                                ) : (
                                    <Tooltip label="Clear">
                                        <ActionIcon
                                            onClick={() => {
                                                setBarcodeSearch("");
                                                handleSearch("");
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
                                {!productsBCRefetchLoading &&
                                    productsBC?.length === 0 && (
                                        <div className={css.noResult}>
                                            No data
                                        </div>
                                    )}
                                {!productsBCRefetchLoading &&
                                    productsBC?.map((item) => (
                                        <div
                                            className={css.item}
                                            key={item.id}
                                            onClick={() =>
                                                handleBarSelect(item)
                                            }
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
                                error={
                                    posForm.formState.errors.customer_id
                                        ?.message
                                }
                                disabled={posMenuLoading}
                                searchable
                                clearable
                            />
                        )}
                    />
                </SimpleGrid>

                {/* Desktop Table View */}
                {mediaMinSM && (
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
                                        <QtyControl
                                            item={item}
                                            index={index}
                                            onUpdate={updateQuantity}
                                        />
                                    </Table.Td>
                                    <Table.Td>
                                        <DiscountInput
                                            item={item}
                                            index={index}
                                            onUpdate={updateDiscount}
                                        />
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: "right" }}>
                                        {formatNumberWithCommas(
                                            item.selling_price,
                                        )}
                                    </Table.Td>
                                    <Table.Td style={{ textAlign: "right" }}>
                                        {formatNumberWithCommas(item.total)}
                                    </Table.Td>
                                    <Table.Td>
                                        <ActionIcon
                                            color="red"
                                            onClick={() =>
                                                ordersField.remove(index)
                                            }
                                        >
                                            <MdDelete size={18} />
                                        </ActionIcon>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                )}

                {/* Mobile Card View */}
                {!mediaMinSM && (
                    <Stack gap="sm">
                        {ordersField.fields.map((item, index) => (
                            <Paper key={index} p="md" radius="md" withBorder>
                                <Stack gap="xs">
                                    <Group
                                        justify="space-between"
                                        align="flex-start"
                                    >
                                        <div>
                                            <div
                                                style={{
                                                    fontWeight: 600,
                                                    marginBottom: "0.5rem",
                                                }}
                                            >
                                                {item.name}
                                            </div>
                                            <Badge variant="light" size="sm">
                                                ₱{" "}
                                                {formatNumberWithCommas(
                                                    item.selling_price,
                                                )}
                                            </Badge>
                                        </div>
                                        <ActionIcon
                                            color="red"
                                            variant="light"
                                            onClick={() =>
                                                ordersField.remove(index)
                                            }
                                        >
                                            <MdDelete size={20} />
                                        </ActionIcon>
                                    </Group>

                                    <Grid gutter="xs">
                                        <Grid.Col span={6}>
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "gray",
                                                }}
                                            >
                                                Quantity
                                            </div>
                                            <QtyControl
                                                item={item}
                                                index={index}
                                                onUpdate={updateQuantity}
                                            />
                                        </Grid.Col>
                                        <Grid.Col span={6}>
                                            <div
                                                style={{
                                                    fontSize: "0.85rem",
                                                    color: "gray",
                                                }}
                                            >
                                                Discount
                                            </div>
                                            <DiscountInput
                                                item={item}
                                                index={index}
                                                onUpdate={updateDiscount}
                                            />
                                        </Grid.Col>
                                    </Grid>

                                    <Group
                                        justify="space-between"
                                        pt="xs"
                                        style={{
                                            borderTop: "1px solid #e0e0e0",
                                        }}
                                    >
                                        <span
                                            style={{
                                                fontSize: "0.9rem",
                                                color: "gray",
                                            }}
                                        >
                                            Total:
                                        </span>
                                        <span
                                            style={{
                                                fontWeight: 700,
                                                fontSize: "1.1rem",
                                            }}
                                        >
                                            ₱{" "}
                                            {formatNumberWithCommas(item.total)}
                                        </span>
                                    </Group>
                                </Stack>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}

// Extracted components for reusability
function QtyControl({
    item,
    index,
    onUpdate,
}: {
    item: any;
    index: number;
    onUpdate: (index: number, qty: number) => void;
}) {
    return (
        <Group gap={5} wrap="nowrap">
            <ActionIcon
                variant="default"
                radius="md"
                size="lg"
                onClick={() => onUpdate(index, item.quantity - 1)}
            >
                <FaMinus size={16} />
            </ActionIcon>
            <TextInput
                type="number"
                value={item.quantity}
                onChange={(e) => {
                    let value = Number(e.target.value);
                    if (!value || value < 1) value = 1;
                    onUpdate(index, value);
                }}
                radius={0}
                styles={{
                    input: {
                        textAlign: "center",
                        width: "50px",
                        borderRadius: 0,
                    },
                }}
                min={1}
            />
            <ActionIcon
                variant="default"
                radius="md"
                size="lg"
                onClick={() => onUpdate(index, item.quantity + 1)}
            >
                <FaPlus size={16} />
            </ActionIcon>
        </Group>
    );
}

function DiscountInput({
    item,
    index,
    onUpdate,
}: {
    item: any;
    index: number;
    onUpdate: (index: number, value: number) => void;
}) {
    return (
        <TextInput
            type="number"
            value={item.discount ?? ""}
            onChange={(e) => {
                let value = Number(e.target.value);
                if (!value || value < 1) value = 0;
                onUpdate(index, value);
            }}
            placeholder="0"
            styles={{
                input: {
                    textAlign: "right",
                },
            }}
            min={0}
        />
    );
}
