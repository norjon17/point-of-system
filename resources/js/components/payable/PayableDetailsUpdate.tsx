import { useDisclosure } from "@mantine/hooks";
import { ProductReceiveType, SelectType } from "../../types";
import { useEffect, useMemo, useState } from "react";
import {
    Button,
    Center,
    FileInput,
    Group,
    Image,
    Modal,
    Select,
    SimpleGrid,
    Stack,
    TextInput,
    Title,
} from "@mantine/core";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { ReceiveProductForm } from "../../types/formTypes";
import {
    CURRENTLINK,
    DEF_MSG,
    imageValidation,
    numberValidation,
    quantityValidation,
} from "../../constants/constants";
import { usePayables } from "../../hooks/payables";
import { usePayable } from "../../hooks/payable";
import moment from "moment";
import { DateInput } from "@mantine/dates";
import { useMenu } from "../../hooks/menu";

interface IProps {
    selectedPayable: ProductReceiveType | null;
    setSelectedPayable: React.Dispatch<
        React.SetStateAction<ProductReceiveType | null>
    >;
}
export default function PayableDetailsUpdate({
    selectedPayable,
    setSelectedPayable,
}: IProps) {
    const [opened, { open, close }] = useDisclosure(false);
    const [disabled, setDisabled] = useState(false);
    const { updateDetails } = usePayable();
    const { transactionsRefetch } = usePayables();

    const { productListMenu } = useMenu({
        enableProductListMenu: true,
    });

    const supplierMenu = useMemo<SelectType[]>(() => {
        if (productListMenu && productListMenu.suppliers) {
            return productListMenu.suppliers.map((item) => ({
                value: `${item.id}`,
                label: item.company,
            }));
        }
        return [];
    }, [productListMenu]);

    const userMenu = useMemo<SelectType[]>(() => {
        if (productListMenu && productListMenu.users) {
            return productListMenu.users.map((item) => ({
                value: `${item.id}`,
                label: item.name,
            }));
        }
        return [];
    }, [productListMenu]);

    const {
        control,
        formState: { errors },
        handleSubmit,
        reset,
        watch,
        register,
    } = useForm<ReceiveProductForm>({
        defaultValues: defValues(),
    });

    const newDrImage = watch("image");

    const onSubmit: SubmitHandler<ReceiveProductForm> = async (data) => {
        setDisabled(true);
        let isSuccess = false;
        if (selectedPayable) {
            isSuccess = await updateDetails(data);
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
                id: selectedPayable.id,
                product_cost: selectedPayable.product_cost,
                quantity: selectedPayable.quantity,
                delivery_receipt: selectedPayable.delivery_receipt,
                supplier_id: selectedPayable.supplier_id,
                received_by_id: selectedPayable.received_by_id,
                payable_date: selectedPayable.payable_date
                    ? new Date(selectedPayable.payable_date)
                    : null,
                image: null,
            });
            open();
        } else {
            handleClose();
        }
    }, [selectedPayable]);

    const handleClose = () => {
        if (!disabled) {
            close();
            setSelectedPayable(null);
            reset(defValues());
        }
    };

    return (
        <>
            <Modal
                opened={opened}
                onClose={handleClose}
                title="Update Details"
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                size={"lg"}
            >
                <Stack>
                    <Title order={4}>
                        Product: {selectedPayable?.product?.name}
                    </Title>
                    <Controller
                        control={control}
                        name="supplier_id"
                        render={({ field: { value, onChange } }) => (
                            <Select
                                data={supplierMenu}
                                value={value ? `${value}` : null}
                                onChange={(e) => onChange(Number(e))}
                                label="Supplier"
                                placeholder="Select supplier"
                                allowDeselect={false}
                                disabled={disabled}
                            />
                        )}
                    />
                    <TextInput
                        label="Delivery Receipt/Invoice Number"
                        {...register("delivery_receipt")}
                        disabled={disabled}
                    />
                    <Controller
                        control={control}
                        name="image"
                        rules={imageValidation}
                        render={({ field: { value, onChange } }) => (
                            <FileInput
                                label="DR Image"
                                placeholder="Upload image"
                                value={value}
                                onChange={onChange}
                                accept="image/png,image/jpeg,image/gif"
                                error={
                                    (errors.image?.type === "isImage" &&
                                        errors.image.message) ||
                                    (errors.image?.type === "isSizeValid" &&
                                        errors.image.message)
                                }
                                disabled={disabled}
                            />
                        )}
                    />

                    {newDrImage && (
                        <Center>
                            <Image
                                src={URL.createObjectURL(newDrImage)}
                                w={200}
                            />
                        </Center>
                    )}

                    {!newDrImage && selectedPayable?.image_path_name && (
                        <Center>
                            <Image
                                src={`/storage/${
                                    selectedPayable.image_path_name
                                }?v=${moment(new Date()).format("MMDDYYHHmm")}`}
                                w={200}
                            />
                        </Center>
                    )}

                    <SimpleGrid cols={2}>
                        <TextInput
                            type="number"
                            label={`Product Cost`}
                            placeholder="Enter product cost"
                            {...register("product_cost", {
                                ...numberValidation,
                            })}
                            min={1}
                            disabled={disabled}
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
                    <Controller
                        control={control}
                        name="received_by_id"
                        render={({ field: { value, onChange } }) => (
                            <Select
                                data={userMenu}
                                value={value ? `${value}` : null}
                                onChange={(e) => onChange(Number(e))}
                                label="Received by"
                                placeholder="Select user"
                                allowDeselect={false}
                                disabled={disabled}
                            />
                        )}
                    />
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

const defValues = (): ReceiveProductForm => ({
    id: null,
    product_cost: 0,
    quantity: 0,
    product_id: null,
    supplier_id: null,
    delivery_receipt: "",
    image: null,
    received_by_id: null,
    amount: null,
    payable_date: null,
});
