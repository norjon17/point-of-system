import {
    Controller,
    SubmitHandler,
    UseFormReturn,
    useWatch,
} from "react-hook-form";
import { POSFormType, SalesOrderManualType } from "../../types/formTypes";
import {
    Button,
    Group,
    Modal,
    Paper,
    Radio,
    Stack,
    Table,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { useDisclosure } from "@mantine/hooks";
import { useSale } from "../../hooks/sale";
import { DateInput } from "@mantine/dates";
import SalesReprint from "./SalesReprint";

interface IProps {
    posForm: UseFormReturn<POSFormType, any, POSFormType>;
}

export default function SalesCOActions({ posForm }: IProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [disabled, setDisabled] = useState(false);
    const [change, setChange] = useState(0);
    const [customerOrder, setCustomerOrder] = useState<POSFormType | null>(
        null
    );

    //for receipt
    const [saleId, setSaleId] = useState<null | number>(null);
    const [showDialog, setShowDialog] = useState(false);

    const { receiveOrder } = useSale();

    const ordersWatch = useWatch({
        control: posForm.control,
        name: "orders",
    });
    const discountFee = useWatch({
        control: posForm.control,
        name: "discount",
    });
    const serviceFee = useWatch({
        control: posForm.control,
        name: "service_fee",
    });
    const deliveryFee = useWatch({
        control: posForm.control,
        name: "delivery_fee",
    });

    const summary = useMemo(() => {
        const price = ordersWatch.reduce(
            (sum, item) =>
                sum +
                (item.selling_price * item.quantity -
                    (item.discount && !isNaN(item.discount)
                        ? item.discount
                        : 0)),
            0
        );

        const service_fee =
            serviceFee && !isNaN(serviceFee) ? Number(serviceFee) : 0;
        const delivery_fee =
            deliveryFee && !isNaN(deliveryFee) ? Number(deliveryFee) : 0;

        const total =
            price +
            service_fee +
            delivery_fee -
            (discountFee && !isNaN(discountFee)
                ? Math.abs(Number(discountFee))
                : 0);

        const vat = Number((total - total / 1.12).toFixed(2));

        return {
            price,
            vat,
            total,
        };
    }, [ordersWatch, discountFee, serviceFee, deliveryFee, customerOrder]);

    const onSubmit: SubmitHandler<POSFormType> = async (data) => {
        const newData: POSFormType = {
            ...data,
            delivery_fee: Math.abs(Number(data.delivery_fee)),
            service_fee: Math.abs(Number(data.service_fee)),
            discount: Math.abs(Number(data.discount)),
            gcash_ref_num: null,
            cash: null,
        };
        setChange(0);
        setCustomerOrder(newData);
        open();
    };

    const handleReceive = async () => {
        // console.log(customerOrder)
        setDisabled(true);
        let isSuccess = false;
        if (customerOrder) {
            const data = await receiveOrder(customerOrder);
            if (data) {
                isSuccess = true;
                setSaleId(data);
            }
        }
        if (isSuccess) {
            handleClose();
        }
        setDisabled(false);
    };

    const handleClose = () => {
        if (!disabled) {
            close();
            posForm.reset();
            setCustomerOrder(null);
        }
    };

    //to open the receipt dialog, make sure the saleId is not null
    useEffect(() => {
        if (saleId) {
            setShowDialog(true);
        }
    }, [saleId]);

    return (
        <>
            <Paper shadow="xs" p="xs">
                <Stack>
                    <Group align="flex-start">
                        <TextInput
                            type="number"
                            label="Service fee"
                            styles={{
                                input: {
                                    textAlign: "right",
                                },
                            }}
                            {...posForm.register("service_fee")}
                            flex={1}
                        />

                        <Stack flex={1}>
                            <Radio.Group
                                withAsterisk
                                value={posForm.getValues("order_type")}
                                onChange={(e) => {
                                    const value = e as SalesOrderManualType;
                                    posForm.setValue("order_type", value);
                                }}
                            >
                                <Group mt="xs">
                                    <Radio value="pickup" label="Pick up" />
                                    <Radio value="delivery" label="Delivery" />
                                </Group>
                            </Radio.Group>

                            {posForm.watch("order_type") === "delivery" && (
                                <>
                                    <TextInput
                                        type="number"
                                        label="Delivery fee"
                                        styles={{
                                            input: {
                                                textAlign: "right",
                                            },
                                        }}
                                        {...posForm.register("delivery_fee")}
                                    />
                                    <Textarea
                                        label="Delivery Address"
                                        placeholder="Enter address"
                                        {...posForm.register("address")}
                                    />
                                </>
                            )}
                        </Stack>
                    </Group>
                    <Table flex={1} withRowBorders={false}>
                        <Table.Tbody>
                            <Table.Tr>
                                <Table.Td fw={600}>Price:</Table.Td>
                                <Table.Td>
                                    <Text style={{ textAlign: "right" }}>
                                        {formatNumberWithCommas(summary.price)}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={600}>Discount:</Table.Td>
                                <Table.Td>
                                    <Controller
                                        control={posForm.control}
                                        name="discount"
                                        render={({
                                            field: { value, onChange },
                                        }) => (
                                            <TextInput
                                                type="number"
                                                styles={{
                                                    input: {
                                                        textAlign: "right",
                                                    },
                                                }}
                                                value={Math.abs(Number(value))}
                                                onChange={onChange}
                                            />
                                        )}
                                    />
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={600}>Sub total:</Table.Td>
                                <Table.Td>
                                    <Text style={{ textAlign: "right" }}>
                                        {formatNumberWithCommas(summary.total)}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={600}>VAT 12%:</Table.Td>
                                <Table.Td>
                                    <Text style={{ textAlign: "right" }}>
                                        {summary.vat}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                            <Table.Tr>
                                <Table.Td fw={600} fz={18}>
                                    Total Bill (₱):
                                </Table.Td>
                                <Table.Td
                                    fw={600}
                                    fz={18}
                                    style={{ textAlign: "right" }}
                                >
                                    {formatNumberWithCommas(summary.total)}
                                </Table.Td>
                            </Table.Tr>
                        </Table.Tbody>
                    </Table>
                    {ordersWatch.length > 0 && (
                        <Group justify="flex-end">
                            <Button
                                variant="outline"
                                color="orange"
                                onClick={() => {
                                    posForm.reset();
                                }}
                            >
                                Reset
                            </Button>
                            <span style={{ flex: 1 }}></span>
                            <Button
                                onClick={() => posForm.handleSubmit(onSubmit)()}
                            >
                                Checkout
                            </Button>
                        </Group>
                    )}
                </Stack>
            </Paper>

            <Modal
                opened={opened}
                onClose={() => {
                    if (!disabled) {
                        close();
                    }
                }}
                title="Receive"
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
            >
                <Stack>
                    <Group>
                        <Text fw={600} fz={18}>
                            Balance (₱):
                        </Text>
                        <Text fw={600} fz={18} style={{ textAlign: "right" }}>
                            {formatNumberWithCommas(summary.total)}
                        </Text>
                    </Group>
                    {customerOrder?.cash || change ? (
                        <Group>
                            <Text fw={600} fz={18}>
                                {customerOrder?.cash &&
                                customerOrder.cash > 0 &&
                                change >= 0
                                    ? "Change (₱):"
                                    : ""}
                                {!customerOrder?.cash ||
                                customerOrder.cash === 0 ||
                                change < 0
                                    ? "Receivable Amount (₱):"
                                    : ""}
                            </Text>
                            <Text
                                fw={600}
                                fz={18}
                                style={{ textAlign: "right" }}
                            >
                                {customerOrder?.cash
                                    ? formatNumberWithCommas(
                                          change >= 0
                                              ? change
                                              : Math.abs(change)
                                      )
                                    : ""}
                            </Text>
                        </Group>
                    ) : (
                        ""
                    )}

                    <Radio.Group
                        withAsterisk
                        value={customerOrder?.cash_mode}
                        onChange={(e) => {
                            const value = e as "cash" | "gcash";
                            setCustomerOrder((c) => {
                                if (!c) return null;

                                return { ...c, cash_mode: value };
                            });
                        }}
                    >
                        <Group mt="xs">
                            <Radio value="cash" label="Cash" />
                            <Radio value="gcash" label="GCash" />
                        </Group>
                    </Radio.Group>

                    <TextInput
                        type="number"
                        label="Cash"
                        disabled={disabled}
                        //@ts-ignore
                        value={customerOrder?.cash ? customerOrder.cash : null}
                        onChange={(e) => {
                            const cash = !isNaN(Number(e.target.value))
                                ? Number(e.target.value)
                                : null;

                            if (cash) {
                                setChange(cash - summary.total);

                                setCustomerOrder((c) => {
                                    if (!c) return null;

                                    return {
                                        ...c,
                                        cash: cash,
                                    };
                                });
                            } else {
                                setCustomerOrder((c) => {
                                    if (!c) return null;

                                    return {
                                        ...c,
                                        cash: null,
                                    };
                                });
                            }
                        }}
                        required={customerOrder?.cash_mode === "gcash"}
                        placeholder="Enter amount of cash"
                    />
                    {customerOrder?.cash_mode === "gcash" && (
                        <TextInput
                            label="GCash reference(s) number"
                            placeholder="Enter GCash reference(s) number"
                            description={"Ex: 9876543210987, 9876543210987"}
                            disabled={disabled}
                            value={customerOrder?.gcash_ref_num ?? ""}
                            onChange={(e) => {
                                setCustomerOrder((c) => {
                                    if (!c) return null;

                                    return {
                                        ...c,
                                        gcash_ref_num: e.target.value,
                                    };
                                });
                            }}
                            required
                        />
                    )}

                    {(change < 0 || customerOrder?.cash! <= 0) && (
                        <DateInput
                            value={customerOrder?.payment_due_date}
                            onChange={(e) => {
                                setCustomerOrder((c) => {
                                    if (!c) return null;

                                    return {
                                        ...c,
                                        payment_due_date: e,
                                    };
                                });
                            }}
                            required
                            label="Payment due date"
                            minDate={new Date()}
                            placeholder="Enter the payment due date"
                            disabled={disabled}
                        />
                    )}

                    <Group justify="flex-end">
                        <Button
                            onClick={handleReceive}
                            disabled={disabled}
                            loading={disabled}
                        >
                            Receive
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            <SalesReprint
                sales_id={saleId}
                showOnlyDialog
                openExternal={showDialog}
                onCloseExternal={() => {
                    setShowDialog(false);
                    setSaleId(null);
                }}
            />
        </>
    );
}
