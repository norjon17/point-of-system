import {
    ActionIcon,
    Button,
    Center,
    CloseIcon,
    Group,
    Image,
    Loader,
    Modal,
    Pagination,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    ThemeIcon,
    Tooltip,
} from "@mantine/core";
import { useEffect, useState } from "react";
import { ProductType } from "../../types";
import { useFieldArray, useForm } from "react-hook-form";
import { POSFormType, POSOrderType } from "../../types/formTypes";
import { useProducts } from "../../hooks/products";
import { nanoid } from "nanoid";
import { MdImageNotSupported } from "react-icons/md";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import { removeWhiteSpace } from "../../utils/string/removeWhiteSpace";
import { CiSearch } from "react-icons/ci";
import SalesCustomerOrders from "../../components/sales/SalesCustomerOrders";
import SalesCOActions from "../../components/sales/SalesCOActions";
import { IoMdClose } from "react-icons/io";
import { useAuth } from "../../hooks/auth";
import { useNavigate } from "react-router";
import { LINKS } from "../../routes";

export default function PointOfSale() {
    const { userData: user } = useAuth();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const [opened, { open, close }] = useDisclosure(false);
    const [selProds, setSelProds] = useState<POSOrderType[]>([]);

    const posForm = useForm<POSFormType>({
        defaultValues: {
            service_fee: null,
            customer_id: null,
            delivery_fee: null,
            discount: null,
            orders: [],
            cash: 0,
            address: null,
            order_type: "pickup",
            cash_mode: "cash",
        },
    });

    const ordersField = useFieldArray({
        control: posForm.control,
        name: "orders",
    });

    const { products, productsLoading, filterData, setFilterData } =
        useProducts({
            enableProducts: true,
        });

    const handleSearch = useDebouncedCallback((value: string) => {
        setFilterData((c) => ({
            ...c,
            page: 1,
            search: value,
            rows: 50,
        }));
    }, 500);

    useEffect(() => {
        //reset on start
        setFilterData(() => ({
            rows: 10,
            page: 1,
            search: "",
            order_by: null,
        }));
    }, []);

    const handleInsertProduct = () => {
        if (selProds.length > 0) {
            const updatedOrdersMap = new Map<number, any>();

            // Create a map from existing orders for quick lookup
            ordersField.fields.forEach((order, index) => {
                updatedOrdersMap.set(order.product_id, { ...order, index });
            });

            selProds.forEach((item) => {
                const existing = updatedOrdersMap.get(item.product_id);

                if (existing) {
                    // Update quantity and total
                    const qty = existing.quantity + 1;
                    let discount = existing.discount ?? 0;
                    if (!discount || discount < 1) discount = 0;

                    const total = item.selling_price * qty - discount;

                    updatedOrdersMap.set(item.product_id, {
                        ...existing,
                        quantity: qty,
                        total,
                    });
                } else {
                    // Add new entry
                    updatedOrdersMap.set(item.product_id, {
                        name: item.name,
                        quantity: 1,
                        product_id: Number(item.product_id),
                        id: item.id,
                        discount: null,
                        selling_price: item.selling_price,
                        total: item.selling_price,
                    });
                }
            });

            // Finally, commit the entire update in one go
            ordersField.replace(Array.from(updatedOrdersMap.values()));
        }
        handleClose();
    };

    const handleClose = () => {
        setSelProds([]);
        close();
    };

    useEffect(() => {
        //sale, don't have access on this
        if (user.access_sales?.create !== 1) {
            navigate(LINKS.ACCESS_DENY);
        }
    }, [user]);

    return (
        <>
            <Stack>
                {user.access_sales_insert?.read === 1 && (
                    <Group justify="flex-end">
                        <Button onClick={open}>Insert</Button>
                    </Group>
                )}
                <Stack flex={0.8}>
                    <SalesCustomerOrders {...{ posForm, ordersField }} />
                    <SalesCOActions {...{ posForm }} />
                </Stack>
            </Stack>

            <Modal
                opened={opened}
                onClose={handleClose}
                title="Products"
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
                size={"xl"}
            >
                <Stack>
                    <Stack>
                        <TextInput
                            label="Search"
                            placeholder="Enter product or description to search product"
                            value={search}
                            onChange={(e) => {
                                handleSearch(e.target.value);
                                setSearch(e.target.value);
                            }}
                            rightSection={
                                removeWhiteSpace(search).length === 0 ? (
                                    <CiSearch />
                                ) : (
                                    <Tooltip label="Clear">
                                        <ActionIcon
                                            onClick={() => {
                                                setSearch("");
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
                        {productsLoading && (
                            <Center>
                                <Loader />
                            </Center>
                        )}
                        <SimpleGrid cols={{ sm: 1, md: 2, lg: 4 }}>
                            {products?.data.map((item: ProductType) => (
                                <Paper
                                    shadow="xs"
                                    p="xs"
                                    key={nanoid()}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                    }}
                                    withBorder
                                    onClick={() => {
                                        const newSelProds = selProds.map(
                                            (i) => i
                                        );
                                        newSelProds.push({
                                            name: item.name,
                                            quantity: 1,
                                            product_id: Number(item.id),
                                            discount: null,
                                            selling_price: item.selling_price,
                                            total: item.selling_price,
                                            random_id: nanoid(),
                                        });
                                        setSelProds(newSelProds);
                                    }}
                                >
                                    <Stack align="center">
                                        {item.image_path_name && (
                                            <Image
                                                alt={item.image_original_name}
                                                src={`/storage/${item.image_path_name}`}
                                                h={50}
                                                style={{ objectFit: "contain" }}
                                            />
                                        )}
                                        {!item.image_path_name && (
                                            <ThemeIcon size={"lg"}>
                                                <MdImageNotSupported
                                                    size={"100%"}
                                                />
                                            </ThemeIcon>
                                        )}
                                        <Stack gap={0} align="center">
                                            <Text fw={600}>{item.name}</Text>
                                            <Text>Qty: {item.quantity}</Text>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </SimpleGrid>

                        <Group justify="flex-end">
                            <Select
                                placeholder="Select number of rows"
                                value={`${filterData.rows}`}
                                onChange={(e) => {
                                    setFilterData((c) => ({
                                        ...c,
                                        rows: Number(e),
                                    }));
                                }}
                                data={[
                                    {
                                        label: "Select number of rows",
                                        value: "",
                                        disabled: true,
                                    },
                                    "50",
                                    "100",
                                    "200",
                                    "500",
                                ]}
                                allowDeselect={false}
                                label="Rows per page"
                            />
                            {products &&
                                products.last_page &&
                                products.last_page > 1 && (
                                    <Pagination
                                        total={products.last_page ?? 0}
                                        value={
                                            filterData.page
                                                ? filterData.page
                                                : 1
                                        }
                                        onChange={(e) => {
                                            {
                                                setFilterData((c) => ({
                                                    ...c,
                                                    page: e,
                                                }));
                                            }
                                        }}
                                    />
                                )}
                        </Group>
                    </Stack>

                    <Stack gap={5}>
                        {selProds.map((item) => (
                            <Group key={nanoid()}>
                                <Text>{item.name}</Text>{" "}
                                <Tooltip label="Remove">
                                    <ActionIcon
                                        size={"compact-xs"}
                                        color="red"
                                        radius={"lg"}
                                        onClick={() => {
                                            const newSelProds = selProds.filter(
                                                (i) =>
                                                    i.random_id !==
                                                    item.random_id
                                            );

                                            setSelProds(newSelProds);
                                        }}
                                    >
                                        <IoMdClose size={15} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>
                        ))}
                    </Stack>
                    <Group justify="flex-end">
                        <Button onClick={handleInsertProduct}>OK</Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
