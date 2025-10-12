import { useDisclosure } from "@mantine/hooks";
import { ProductReceiveType } from "../../types";
import { useEffect, useState } from "react";
import { Button, Group, Modal, Stack, TextInput, Title } from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { PayableFormType, ReceivableFormType } from "../../types/formTypes";
import { DEF_MSG } from "../../constants/constants";
import { formatNumberWithCommas } from "../../utils/number/formatNumberWithCommas";
import { usePayables } from "../../hooks/payables";
import { usePayable } from "../../hooks/payable";

interface IProps {
    selectedPayable: ProductReceiveType | null;
    setSelectedPayable: React.Dispatch<
        React.SetStateAction<ProductReceiveType | null>
    >;
}
export default function PayableUpdate({
    selectedPayable,
    setSelectedPayable,
}: IProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [disabled, setDisabled] = useState(false);
    const [balance, setBalance] = useState("0");
    const { update } = usePayable();
    const { transactionsRefetch } = usePayables();

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset,
        watch,
        getValues,
    } = useForm<PayableFormType>({
        defaultValues: defValues(),
    });

    const onSubmit: SubmitHandler<PayableFormType> = async (data) => {
        setDisabled(true);
        let isSuccess = false;
        if (selectedPayable) {
            isSuccess = await update(data, selectedPayable.id);
        }
        if (isSuccess) {
            await transactionsRefetch();
            handleClose();
        }
        setDisabled(false);
    };

    useEffect(() => {
        if (selectedPayable) {
            reset({
                cash: null,
            });
            open();
        } else {
            handleClose();
        }
    }, [selectedPayable]);

    useEffect(() => {
        const cash = getValues("cash");
        if (selectedPayable) {
            if (cash) {
                const oldReceived = selectedPayable.amount
                    ? selectedPayable.amount
                    : 0;
                let balance =
                    selectedPayable.product_cost - (cash + oldReceived);

                balance = balance < 0 ? 0 : balance;

                setBalance(formatNumberWithCommas(balance));
            } else {
                const oldReceived = selectedPayable.amount
                    ? selectedPayable.amount
                    : 0;
                let balance = selectedPayable.product_cost - oldReceived;
                balance = balance < 0 ? 0 : balance;

                setBalance(formatNumberWithCommas(balance));
            }
        } else {
            setBalance("0");
        }
    }, [selectedPayable, watch("cash")]);

    const handleClose = () => {
        if (!disabled) {
            close();
            setSelectedPayable(null);
            reset(defValues());
            setBalance("0");
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={handleClose}
                title="Update Receivable"
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                size={"lg"}
            >
                <Stack>
                    <Title order={4}>Balance (₱): {balance}</Title>
                    <Controller
                        control={control}
                        name="cash"
                        rules={{ required: DEF_MSG.REQUIRED }}
                        render={({ field: { value, onChange } }) => (
                            <TextInput
                                type="number"
                                label="Cash"
                                disabled={disabled}
                                //@ts-ignore
                                value={value}
                                onChange={(e) => {
                                    const cash = !isNaN(Number(e.target.value))
                                        ? Number(e.target.value)
                                        : null;

                                    onChange(cash);
                                }}
                                placeholder="Enter amount of cash"
                                required
                                error={errors.cash?.message}
                            />
                        )}
                    />

                    <Group justify="flex-end">
                        <Button
                            type="button"
                            onClick={() => {
                                handleSubmit(onSubmit)();
                            }}
                            disabled={disabled}
                            loading={disabled}
                        >
                            Update
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                handleClose();
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
    );
}

const defValues = (): ReceivableFormType => ({
    cash: null,
    cash_mode: "cash",
    gcash_ref: null,
});
